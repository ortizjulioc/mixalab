import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/utils/lib/prisma";
import { stripe } from "@/utils/stripe/server";

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 */
export async function POST(req) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error(
      `[STRIPE_WEBHOOK] Signature verification failed: ${err.message}`,
    );
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object);
        break;

      case "transfer.paid":
        break;

      default:
        break;
    }
  } catch (error) {
    console.error(
      `[STRIPE_WEBHOOK] Error handling event ${event.type}:`,
      error,
    );
    return new NextResponse("Internal Error", { status: 500 });
  }

  return new NextResponse("OK", { status: 200 });
}

// ---------------------------------------------------------
// HANDLERS
// ---------------------------------------------------------

async function handleCheckoutSessionCompleted(session) {
  const requestId = session.metadata?.requestId;
  const creatorId = session.metadata?.creatorId;
  const artistUserId = session.metadata?.userId;
  const totalAmount = session.amount_total; // cents

  if (!requestId || !creatorId) {
    console.error("Missing metadata in Stripe session");
    return;
  }

  // Fetch creator profile outside transaction (read-only)
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { id: creatorId },
    select: { userId: true },
  });

  const creatorUserId = creatorProfile?.userId;

  await prisma.$transaction(async (tx) => {
    // 1️⃣ Prevent duplicate processing
    const existingPayment = await tx.payment.findUnique({
      where: { stripeSessionId: session.id },
    });

    if (existingPayment) return;

    // 2️⃣ Fetch ServiceRequest
    const serviceRequest = await tx.serviceRequest.findUnique({
      where: { id: requestId },
      include: { genres: true },
    });

    if (!serviceRequest) {
      throw new Error("ServiceRequest not found");
    }

    // 3️⃣ Fetch Tier
    const tier = await tx.tier.findUnique({
      where: { name: serviceRequest.tier },
    });

    if (!tier) {
      throw new Error("Tier not found");
    }

    // 4️⃣ Calculate commission
    const commission = tier.commissionPercentage ?? 10;
    const platformFee = Math.round((totalAmount * commission) / 100);
    const creatorAmount = totalAmount - platformFee;

    // 5️⃣ Create Payment
    await tx.payment.create({
      data: {
        serviceRequestId: requestId,
        stripeSessionId: session.id,
        stripePaymentIntentId: session.payment_intent,
        totalAmount,
        platformFee,
        creatorAmount,
        currency: session.currency,
        status: "COMPLETED",
      },
    });

    // 6️⃣ Update ServiceRequest
    await tx.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: "PAID",
        statusUpdatedAt: new Date(),
      },
    });

    // 7️⃣ Create Timeline Event
    await tx.projectEvent.create({
      data: {
        requestId,
        type: "PAYMENT_COMPLETED",
        description: "Payment processed successfully via Stripe",
        userId: artistUserId,
      },
    });

    // 8️⃣ Prevent duplicate project
    const existingProject = await tx.project.findUnique({
      where: { serviceRequestId: requestId },
    });

    if (existingProject) return;

    // 9️⃣ Calculate delivery deadline
    const deliveryDeadline = new Date(
      Date.now() + tier.deliveryDays * 24 * 60 * 60 * 1000
    );

    // 🔟 Create Project
    const newProject = await tx.project.create({
      data: {
        userId: serviceRequest.userId,
        serviceRequestId: requestId,

        // Commercial snapshot
        projectName: serviceRequest.projectName,
        artistName: serviceRequest.artistName,
        projectType: serviceRequest.projectType,
        tier: tier.name,
        references: serviceRequest.description,

        deliveryDeadline,
        currentPhase: "PRE_PRODUCTION",
        stemsIncluded: tier.stems > 0,

        commercialSnapshot: {
          basePrice: totalAmount,
          commissionPercentage: commission,
          platformFee,
          creatorAmount,
          currency: session.currency,
        },

        tierSnapshot: {
          name: tier.name,
          deliveryDays: tier.deliveryDays,
          numberOfRevisions: tier.numberOfRevisions,
          stemsLimit: tier.stems,
        },

        // 🔥 MANY-TO-MANY GENRES
        genres: serviceRequest.genres?.length
          ? {
            create: serviceRequest.genres.map((sg) => ({
              genre: {
                connect: { id: sg.genreId },
              },
            })),
          }
          : undefined,

        services: {
          create: {
            type: mapServiceTypeToProjectService(serviceRequest.services),
            creatorId: creatorId,
          },
        },
      },
    });

    // 1️⃣1️⃣ Create Chat Room
    if (creatorUserId) {
      await tx.chatRoom.create({
        data: {
          projectId: newProject.id,
          serviceRequestId: requestId,
          artistId: serviceRequest.userId,
          creatorId: creatorUserId,
          messages: {
            create: {
              senderId: creatorUserId,
              content: "Project started! You can now chat here.",
              type: "SYSTEM",
            },
          },
        },
      });
    }
  });

  console.log(`✅ Payment handled for request ${requestId}`);
}

function mapServiceTypeToProjectService(serviceType) {
  const map = {
    MIXING: "MIXING",
    MASTERING: "MASTERING",
    RECORDING: "PRODUCTION",
  };

  return map[serviceType] || "MIXING";
}

async function handleAccountUpdated(account) {
  const creator = await prisma.creatorProfile.findFirst({
    where: { stripeConnectAccountId: account.id },
  });

  if (!creator) return;

  await prisma.creatorProfile.update({
    where: { id: creator.id },
    data: {
      stripeOnboardingComplete: account.details_submitted,
      stripePayoutsEnabled: account.payouts_enabled,
    },
  });

  console.log(`✅ Account status synced for creator ${creator.id}`);
}
