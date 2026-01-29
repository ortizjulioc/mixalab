import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * POST /api/service-requests/:id/payment
 * Process payment for a service request
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
        const body = await request.json();

        // Find service request
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                user: true,
                creator: true,
            }
        });

        if (!serviceRequest) {
            return NextResponse.json(
                { error: 'Service request not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (serviceRequest.userId !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Verify status
        if (!['ACCEPTED', 'AWAITING_PAYMENT'].includes(serviceRequest.status)) {
            return NextResponse.json(
                { error: 'Request is not ready for payment' },
                { status: 400 }
            );
        }

        // Get Creator User ID for notification
        let creatorUserId = null;
        if (serviceRequest.creatorId) {
            const creatorProfile = await prisma.creatorProfile.findUnique({
                where: { id: serviceRequest.creatorId },
                select: { userId: true }
            });
            creatorUserId = creatorProfile?.userId;
        }

        // Transaction to update request, create event, and notification
        const [updatedRequest] = await prisma.$transaction([
            // 1. Update Request to PAID
            prisma.serviceRequest.update({
                where: { id },
                data: {
                    status: 'PAID',
                    statusUpdatedAt: new Date()
                },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    creator: {
                        select: {
                            id: true,
                            brandName: true,
                            user: { select: { id: true, name: true, email: true } }
                        }
                    },
                    files: true,
                    genres: { include: { genre: true } }
                }
            }),

            // 2. Create Payment Event
            prisma.projectEvent.create({
                data: {
                    requestId: id,
                    type: 'PAYMENT_COMPLETED',
                    description: `Payment completed by ${session.user.name || 'Artist'}`,
                    userId: userId,
                    metadata: {
                        amount: 'Simulated',
                        currency: 'USD'
                    }
                }
            }),

            // 3. Notify Creator
            ...(creatorUserId ? [
                prisma.notification.create({
                    data: {
                        userId: creatorUserId,
                        type: 'PAYMENT_RECEIVED',
                        title: 'Payment Received',
                        message: `Payment received for project "${serviceRequest.projectName}". You can now start working!`,
                        link: `/creators/projects/${id}`, // Future project page
                    }
                })
            ] : [])
        ]);

        return NextResponse.json({
            message: 'Payment processed successfully',
            data: updatedRequest
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
