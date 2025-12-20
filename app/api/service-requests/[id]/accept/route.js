import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

/**
 * PATCH /api/service-requests/:id/accept
 * Accept a service request (creator only)
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
        { error: 'Only creators can accept service requests' },
        { status: 403 }
      );
    }

    // Find service request
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        creator: true
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

    // Check if already accepted or rejected
    if (serviceRequest.creatorStatus === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Service request already accepted' },
        { status: 400 }
      );
    }

    if (serviceRequest.creatorStatus === 'REJECTED') {
      return NextResponse.json(
        { error: 'Cannot accept a rejected service request' },
        { status: 400 }
      );
    }

    // Update service request
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: {
        creatorStatus: 'ACCEPTED',
        status: 'IN_REVIEW' // Update main status to IN_REVIEW when accepted
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
        creator: {
          select: {
            id: true,
            brandName: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
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

    return NextResponse.json({
      message: 'Service request accepted successfully',
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error accepting service request:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
