import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * GET /api/creator/service-requests
 * Get all service requests for the authenticated creator
 */
export async function GET(request) {
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

    // Verify user is a creator
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId }
    });

    if (!creatorProfile) {
      return NextResponse.json(
        { error: 'Creator profile not found. Only creators can access this endpoint.' },
        { status: 403 }
      );
    }

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status'); // RequestStatus filter
    const creatorStatus = searchParams.get('creatorStatus'); // CreatorRequestStatus filter
    const projectType = searchParams.get('projectType');
    const services = searchParams.get('services');

    // Build where clause
    const where = {
      creatorId: creatorProfile.id,
      ...(status && { status }),
      ...(creatorStatus && { creatorStatus }),
      ...(projectType && { projectType }),
      ...(services && { services })
    };

    // Fetch service requests with pagination
    const [items, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          files: {
            select: {
              id: true,
              name: true,
              url: true,
              mimeType: true,
              size: true
            }
          },
          genres: {
            include: {
              genre: true
            }
          }
        }
      }),
      prisma.serviceRequest.count({ where })
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching creator service requests:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
