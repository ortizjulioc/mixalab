import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * PATCH /api/service-requests/:id/reject
 * Reject a service request (creator only)
 * When rejected, the request goes back to PENDING and is unassigned from the creator
 */
export async function PATCH(request, { params }) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = params;

    // Verify user is a creator
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!creatorProfile) {
      return NextResponse.json(
        { error: 'Only creators can reject service requests' },
        { status: 403 }
      );
    }

    // Find service request
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        creator: true,
        user: true
      }
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      );
    }

    // Verify the creator is the one assigned to this request
    if (serviceRequest.creatorId !== creatorProfile.id) {
      return NextResponse.json(
        { error: 'Forbidden - This service request is not assigned to you' },
        { status: 403 }
      );
    }

    // Check if already accepted
    if (serviceRequest.status === 'ACCEPTED' || serviceRequest.status === 'AWAITING_PAYMENT') {
      return NextResponse.json(
        { error: 'Cannot reject an accepted service request' },
        { status: 400 }
      );
    }

    // Update service request: unassign creator and return to PENDING
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: {
        creatorId: null, // Unassign the creator
        status: 'PENDING', // Return to PENDING so other creators can see it
        statusUpdatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        files: true,
        genres: {
          include: {
            genre: true
          }
        }
      }
    });

    // Create a project event for rejection
    await prisma.projectEvent.create({
      data: {
        requestId: id,
        type: 'CREATOR_REJECTED',
        description: `${creatorProfile.brandName} rejected the request`,
        userId: userId,
        metadata: {
          creatorId: creatorProfile.id,
          creatorBrandName: creatorProfile.brandName
        }
      }
    });

    // Create notification for the artist
    await prisma.notification.create({
      data: {
        userId: serviceRequest.userId,
        type: 'REQUEST_REJECTED',
        title: 'Request Rejected',
        message: `${creatorProfile.brandName} has declined your request "${serviceRequest.projectName}". We'll find another creator for you.`,
        link: `/artists/my-requests/${id}`
      }
    });

    return NextResponse.json({
      message: 'Service request rejected successfully. The request is now available for other creators.',
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error rejecting service request:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
