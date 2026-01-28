import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

/**
 * POST /api/service-requests/:id/decline
 * Decline a service request (creator only)
 * When declined, the request goes back to PENDING and is unassigned from the creator
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
                { error: 'Only creators can decline service requests' },
                { status: 403 }
            );
        }

        // Find service request
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
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
                { error: 'Cannot decline an accepted service request' },
                { status: 400 }
            );
        }

        // Update service request: unassign creator and return to PENDING
        await prisma.$transaction([
            // 1. Update Request - unassign creator and return to PENDING
            prisma.serviceRequest.update({
                where: { id },
                data: {
                    creatorId: null, // Unassign the creator
                    status: 'PENDING', // Return to PENDING so other creators can see it
                    statusUpdatedAt: new Date()
                }
            }),
            // 2. Create Event
            prisma.projectEvent.create({
                data: {
                    requestId: id,
                    type: 'CREATOR_REJECTED',
                    description: `${creatorProfile.brandName} declined the request`,
                    userId: userId,
                    metadata: {
                        creatorId: creatorProfile.id,
                        creatorBrandName: creatorProfile.brandName
                    }
                }
            }),
            // 3. Notify Artist
            prisma.notification.create({
                data: {
                    userId: serviceRequest.userId,
                    type: 'REQUEST_REJECTED',
                    title: 'Request Declined',
                    message: `${creatorProfile.brandName} has declined your request "${serviceRequest.projectName}". We'll find another creator for you.`,
                    link: `/artists/my-requests/${id}`
                }
            })
        ]);

        return NextResponse.json({
            message: 'Request declined successfully. The request is now available for other creators.'
        });

    } catch (error) {
        console.error('Error declining service request:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
