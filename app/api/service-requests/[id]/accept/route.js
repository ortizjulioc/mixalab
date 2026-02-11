import prisma from "@/utils/lib/prisma";
import { sendMail } from "@/app/services/sendMail.service";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * POST /api/service-requests/:id/accept
 * Accept a service request (creator only)
 */
export async function POST(request, { params }) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;

    // Verify user is a creator
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!creatorProfile) {
      return NextResponse.json(
        { error: "Only creators can accept service requests" },
        { status: 403 },
      );
    }

    // Find service request
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        creator: true,
      },
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { error: "Service request not found" },
        { status: 404 },
      );
    }

    // Two scenarios:
    // 1. Request has no creator assigned yet (creator is accepting from available list)
    // 2. Request is already assigned to this creator (creator is confirming acceptance)

    if (
      serviceRequest.creatorId &&
      serviceRequest.creatorId !== creatorProfile.id
    ) {
      return NextResponse.json(
        { error: "This request has already been accepted by another creator" },
        { status: 403 },
      );
    }

    // Confirm valid status transition
    if (
      [
        "ACCEPTED",
        "AWAITING_PAYMENT",
        "PAID",
        "IN_PROGRESS",
        "COMPLETED",
      ].includes(serviceRequest.status)
    ) {
      return NextResponse.json(
        { message: "Request already accepted", data: serviceRequest },
        { status: 200 },
      );
    }

    // Update service request
    const updateData = {
      status: "ACCEPTED", // Creator accepted, project initiated
      statusUpdatedAt: new Date(),
    };

    // If creator is not assigned yet, assign them
    if (!serviceRequest.creatorId) {
      updateData.creator = {
        connect: { id: creatorProfile.id },
      };
    }

    // Transaction to update request, create event, and create notification
    const [updatedRequest] = await prisma.$transaction([
      // 1. Update Request
      prisma.serviceRequest.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          creator: {
            select: {
              id: true,
              brandName: true,
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          files: true,
          genres: { include: { genre: true } },
        },
      }),

      // 2. Create Event
      prisma.projectEvent.create({
        data: {
          requestId: id,
          type: "CREATOR_ACCEPTED",
          description: `Request accepted by ${creatorProfile.brandName || "Creator"}`,
          userId: userId,
          metadata: {
            creatorId: creatorProfile.id,
            previousStatus: serviceRequest.status,
            newStatus: "ACCEPTED",
          },
        },
      }),

      // 3. Create Notification for Artist
      prisma.notification.create({
        data: {
          userId: serviceRequest.userId,
          type: "REQUEST_ACCEPTED",
          title: "Request Accepted",
          message: `Your request "${serviceRequest.projectName}" has been accepted by ${creatorProfile.brandName || "a Creator"}.`,
          link: `/artists/my-requests/${id}`,
        },
      }),

      // 4. Create Chat Room
      prisma.chatRoom.create({
        data: {
          serviceRequestId: id,
          artistId: serviceRequest.userId,
          creatorId: userId, // Creator's User ID
          messages: {
            create: {
              senderId: userId,
              content: "I've accepted your request! Let's get started.",
              type: "TEXT",
            },
          },
        },
      }),
    ]);

    // 4. Send Email to Artist
    try {
      const artistEmail = updatedRequest.user.email;
      const projectLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/artists/my-requests/${id}`;
      const subject = "¡Tu solicitud ha sido aceptada!";
      const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1 style="color: #4F46E5;">¡Buenas noticias, ${updatedRequest.user.name || "Artista"}!</h1>
            <p>Tu solicitud para el proyecto <strong>${updatedRequest.projectName}</strong> ha sido aceptada por <strong>${creatorProfile.brandName}</strong>.</p>
            <p>Estamos listos para empezar a trabajar en tu música.</p>
            <br/>
            <a href="${projectLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Ver Solicitud
            </a>
            <br/><br/>
            <p style="font-size: 12px; color: #666;">Si el botón no funciona, copia y pega este enlace en tu navegador: ${projectLink}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">Gracias por confiar en Mixa Lab.</p>
        </div>
      `;

      await sendMail(artistEmail, subject, html);
    } catch (emailError) {
      console.error("Error sending acceptance email:", emailError);
    }

    return NextResponse.json({
      message: "Service request accepted successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error accepting service request:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 },
    );
  }
}
