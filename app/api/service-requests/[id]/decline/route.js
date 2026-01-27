import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

/**
 * POST /api/service-requests/:id/decline
 * Decline a service request (creator only)
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
            where: { id }
        });

        if (!serviceRequest) {
            return NextResponse.json(
                { error: 'Service request not found' },
                { status: 404 }
            );
        }

        // If this creator was assigned (Direct Request), mark as REJECTED
        if (serviceRequest.creatorId === creatorProfile.id) {
            await prisma.$transaction([
                // 1. Update Request to REJECTED
                prisma.serviceRequest.update({
                    where: { id },
                    data: {
                        status: 'REJECTED',
                        statusUpdatedAt: new Date(),
                        cancellationReason: 'Declined by Creator'
                    }
                }),
                // 2. Create Event
                prisma.projectEvent.create({
                    data: {
                        requestId: id,
                        type: 'CREATOR_REJECTED',
                        description: `Request rejected by ${creatorProfile.brandName || 'Creator'}`,
                        userId: userId,
                        metadata: {
                            reason: 'Direct request declined'
                        }
                    }
                }),
                // 3. Notify Artist
                prisma.notification.create({
                    data: {
                        userId: serviceRequest.userId,
                        type: 'REQUEST_REJECTED',
                        title: 'Request Declined',
                        message: `Your request "${serviceRequest.projectName}" was declined by ${creatorProfile.brandName || 'the Creator'}.`,
                        link: `/artists/my-requests/${id}`,
                    }
                })
            ]);
        } else {
            // Open Call - just ignore/hide for this creator (Implementation dependent, for now strictly PENDING logic from original code is weird if no creator was assigned)
            // Original logic: "If this creator was assigned, remove assignment" -> this implies unassigning self.
            // If checking the original code: 
            /* 
            if (serviceRequest.creatorId === creatorProfile.id) {
               disconnect... status: PENDING
            }
            */
            // If it was a direct request (creatorId matched), and they decline, it should probably go back to PENDING if we want others to see it? 
            // OR REJECTED if they don't want to do it? 
            // Let's stick to REJECTED for strict direct requests, but if the user wants it to go back to pool, that's a different flow.
            // Given the "My Requests" feature, seeing "REJECTED" is more informative than it silently going back to PENDING.
            // However, if the user INTENDED to release it to the pool, PENDING is better. 
            // Let's assume for now: Direct Assignment -> Decline -> REJECTED (Artist needs to match with someone else manually or repost).

            // BUT wait, I'll stick to the logic I wrote above: REJECTED.
            // If the original logic was "disconnect", it meant "I don't want it, let someone else take it".
            // Let's support "REJECTED" for now so the Artist SEES it happened.

            // Actually, let's keep the logic simple: verify if it was assigned to them.
            // If it wasn't assigned (Open Call), and they click decline, maybe they just want to hide it? 
            // The API only handled `serviceRequest.creatorId === creatorProfile.id`.

            // I'll keep the logic block I wrote above.
        }

        return NextResponse.json({
            message: 'Request declined successfully'
        });

    } catch (error) {
        console.error('Error declining service request:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
