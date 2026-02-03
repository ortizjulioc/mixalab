import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * GET /api/service-requests/:id
 * Get a specific service request by ID
 */
export async function GET(request, { params }) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Find service request
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
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
            country: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        },
        files: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        },
        genres: {
          include: {
            genre: true
          }
        }
      }
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      );
    }

    // Check authorization - user must be either the requester or the creator
    const userId = session.user.id;
    const isRequester = serviceRequest.userId === userId;
    const isCreator = serviceRequest.creator.user.id === userId;

    if (!isRequester && !isCreator) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have access to this service request' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      data: serviceRequest
    });

  } catch (error) {
    console.error('Error fetching service request:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
