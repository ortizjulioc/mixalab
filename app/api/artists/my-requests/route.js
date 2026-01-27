import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/artists/my-requests
 * Fetch all service requests for the authenticated artist
 * Query params:
 *  - status: Filter by request status (optional)
 */
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Build where clause
        const where = {
            userId: session.user.id,
            ...(status && status !== 'ALL' ? { status } : {}),
        };

        // Fetch requests with related data
        const requests = await prisma.serviceRequest.findMany({
            where,
            include: {
                creator: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
                genres: {
                    include: {
                        genre: true,
                    },
                },
                files: {
                    select: {
                        id: true,
                        name: true,
                        url: true,
                        mimeType: true,
                        extension: true,
                        size: true,
                        createdAt: true,
                    },
                },
                events: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10, // Last 10 events
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ requests }, { status: 200 });
    } catch (error) {
        console.error('Error fetching artist requests:', error);
        return NextResponse.json(
            { error: 'Error fetching requests' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/artists/my-requests
 * Update a service request (e.g., cancel)
 */
export async function PUT(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { requestId, action, reason } = body;

        if (!requestId || !action) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify ownership
        const existingRequest = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
        });

        if (!existingRequest) {
            return NextResponse.json(
                { error: 'Request not found' },
                { status: 404 }
            );
        }

        if (existingRequest.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Handle different actions
        if (action === 'CANCEL') {
            // Only allow cancellation if status is PENDING or IN_REVIEW
            if (!['PENDING', 'IN_REVIEW'].includes(existingRequest.status)) {
                return NextResponse.json(
                    { error: 'Cannot cancel request in current status' },
                    { status: 400 }
                );
            }

            const updatedRequest = await prisma.serviceRequest.update({
                where: { id: requestId },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date(),
                    cancellationReason: reason || 'Cancelled by artist',
                    statusUpdatedAt: new Date(),
                },
            });

            // Create event
            await prisma.projectEvent.create({
                data: {
                    requestId,
                    type: 'STATUS_CHANGED',
                    description: `Request cancelled by artist${reason ? `: ${reason}` : ''}`,
                    userId: session.user.id,
                    metadata: {
                        previousStatus: existingRequest.status,
                        newStatus: 'CANCELLED',
                        reason,
                    },
                },
            });

            return NextResponse.json({ request: updatedRequest }, { status: 200 });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error updating request:', error);
        return NextResponse.json(
            { error: 'Error updating request' },
            { status: 500 }
        );
    }
}
