import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import prisma from '@/utils/lib/prisma';
import { stripe, calculatePlatformFee, calculateCreatorPayout } from '@/utils/stripe/server';

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 */
export async function POST(req) {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`[STRIPE_WEBHOOK] Signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'account.updated':
                await handleAccountUpdated(event.data.object);
                break;
            case 'transfer.paid':
                // Handle transfer paid logic if needed
                break;
            default:
            // console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error(`[STRIPE_WEBHOOK] Error handling event ${event.type}:`, error);
        return new NextResponse('Internal Error', { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
}

// ---------------------------------------------------------
// HANDLERS
// ---------------------------------------------------------

async function handleCheckoutSessionCompleted(session) {
    const requestId = session.metadata.requestId;
    const creatorId = session.metadata.creatorId;
    const totalAmount = session.amount_total; // in cents

    if (!requestId) {
        console.error('Missing requestId in session metadata');
        return;
    }

    // 1. Calculate Fees (Dynamic logic based on your needs)
    // For now assuming we can fetch the percentage from DB or use default since we are in webhook
    // Ideally we would have stored the snapshot of fees in metadata or DB before
    // Using default/global logic or fetching from related entities if needed.
    // For simplicity, we use the server utility's default (which defaults to 10 if not provided)
    // Real implementation: Fetch Tier/Addon specific commission if needed.

    // Let's fetch the project to see which tier/addons were used if we really want 100% precision
    // allowing us to pass the specific percentage.
    const serviceRequest = await prisma.serviceRequest.findUnique({
        where: { id: requestId },
        include: { genres: true }
    });

    // TODO: Fetch specific commission percentage from Tier table if needed
    // const tier = await prisma.tier.findUnique(...) 
    // const commission = tier.commissionPercentage

    // Using default logic from utility for now
    const platformFee = calculatePlatformFee(totalAmount);
    const creatorAmount = calculateCreatorPayout(totalAmount);

    await prisma.$transaction([
        // 1. Create Payment Record
        prisma.payment.create({
            data: {
                serviceRequestId: requestId,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent,
                totalAmount: totalAmount,
                platformFee: platformFee,
                creatorAmount: creatorAmount,
                currency: session.currency,
                status: 'COMPLETED',
            }
        }),

        // 2. Update Request Status
        prisma.serviceRequest.update({
            where: { id: requestId },
            data: {
                status: 'PAID',
                statusUpdatedAt: new Date(),
            }
        }),

        // 3. Create Timeline Event
        prisma.projectEvent.create({
            data: {
                requestId: requestId,
                type: 'PAYMENT_COMPLETED',
                description: 'Payment processed successfully via Stripe',
                userId: session.metadata.userId // Artist User ID
            }
        }),

        // 4. Create Project (New)
        prisma.project.create({
            data: {
                userId: serviceRequest.userId,
                projectName: serviceRequest.projectName,
                artistName: serviceRequest.artistName,
                projectType: serviceRequest.projectType,
                tier: serviceRequest.tier,
                // Map ServiceType to ProjectServiceType
                services: {
                    create: {
                        type: mapServiceTypeToProjectService(serviceRequest.services),
                        creatorId: creatorId // Assign creator ID
                    }
                }
            }
        })
    ]);

    console.log(`✅ Payment handled for request ${requestId}`);
}

function mapServiceTypeToProjectService(serviceType) {
    const map = {
        'MIXING': 'MIXING',
        'MASTERING': 'MASTERING',
        'RECORDING': 'PRODUCTION' // Mapping RECORDING to PRODUCTION as per schema availability
    };
    return map[serviceType] || 'MIXING'; // Fallback
}

async function handleAccountUpdated(account) {
    // Sync onboarding status
    const creator = await prisma.creatorProfile.findFirst({
        where: { stripeConnectAccountId: account.id }
    });

    if (creator) {
        await prisma.creatorProfile.update({
            where: { id: creator.id },
            data: {
                stripeOnboardingComplete: account.details_submitted,
                stripePayoutsEnabled: account.payouts_enabled,
            }
        });
        console.log(`✅ Account status synced for creator ${creator.id}`);
    }
}
