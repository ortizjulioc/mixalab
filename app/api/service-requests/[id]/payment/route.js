import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

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
        if (serviceRequest.status !== 'AWAITING_PAYMENT') {
            return NextResponse.json(
                { error: 'Request is not ready for payment' },
                { status: 400 }
            );
        }

        // TODO: Integrate with payment gateway (Stripe, PayPal, etc.)
        // For now, we'll simulate a successful payment

        // Example Stripe integration:
        // const paymentIntent = await stripe.paymentIntents.create({
        //     amount: body.amount * 100, // Convert to cents
        //     currency: 'usd',
        //     metadata: {
        //         serviceRequestId: id,
        //         userId: userId,
        //     },
        // });

        // Update service request status to PAID
        const updatedRequest = await prisma.serviceRequest.update({
            where: { id },
            data: {
                status: 'PAID',
                // TODO: Store payment information
                // paymentId: paymentIntent.id,
                // paymentAmount: body.amount,
                // paymentDate: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                creator: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                genres: {
                    include: {
                        genre: true
                    }
                },
                files: true,
            }
        });

        // TODO: Send notification to creator that payment was received
        // TODO: Create Project entity from ServiceRequest

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
