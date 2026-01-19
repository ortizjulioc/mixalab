import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

/**
 * POST /api/service-requests/:id/accept
 * Accept a service request (creator only)
 */
export async function POST(request, { params }) {
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

    // Two scenarios:
    // 1. Request has no creator assigned yet (creator is accepting from available list)
    // 2. Request is already assigned to this creator (creator is confirming acceptance)

    if (serviceRequest.creatorId && serviceRequest.creatorId !== creatorProfile.id) {
      return NextResponse.json(
        { error: 'This request has already been accepted by another creator' },
        { status: 403 }
      );
    }

    // If already in AWAITING_PAYMENT or later status, it's already been accepted
    if (serviceRequest.status === 'AWAITING_PAYMENT' || serviceRequest.status === 'PAID' || serviceRequest.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { message: 'Request already accepted', data: serviceRequest },
        { status: 200 }
      );
    }

    // Update service request - assign creator if not assigned, update status to AWAITING_PAYMENT
    const updateData = {
      status: 'AWAITING_PAYMENT' // Creator accepted, now waiting for artist payment
    };

    // If creator is not assigned yet, assign them
    if (!serviceRequest.creatorId) {
      updateData.creator = {
        connect: { id: creatorProfile.id }
      };
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
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
