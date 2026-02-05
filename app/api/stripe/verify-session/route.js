import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/server';
import prisma from '@/utils/lib/prisma';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return new NextResponse('Missing session_id', { status: 400 });
        }

        // 1. Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // 2. Check if payment was successful
        if (session.payment_status === 'paid') {
            const requestId = session.metadata.requestId;

            // 3. Check if Project has been created
            // We search for a project linked to this request (implicitly via logic or explicit link if we had one)
            // For now, based on our logic: Project is created with same data as Request.
            // A precise way is to look for a project with this requestId if we stored it, 
            // OR find by serviceRequestID if we added a relation (which we didn't explicitly in schema, 
            // but we did via events or manually).

            // Wait, we didn't add requestId to Project model directly in the previous step?
            // Let's check Schema... Project has userId, ArtistName... 
            // In webhook we created it. 
            // Let's Find the latest project for this user created in the last minute matching the request name?
            // OR better: The webhook updates ServiceRequest status to PAID. 

            const serviceRequest = await prisma.serviceRequest.findUnique({
                where: { id: requestId }
            });

            // 4. Find the project created for this user with this name
            // (Assuming unique project names or fuzzy match for safety, or better:
            // The webhook runs quickly. If we find a project with same ServiceRequest properties created recently.)

            // To make this robust, we should probably start storing requestId in Project or use a more direct link.
            // But for now, let's find the most recent project for this user.

            let project = await prisma.project.findFirst({
                where: {
                    userId: session.metadata.userId,
                    projectName: serviceRequest.projectName
                },
                orderBy: { createdAt: 'desc' }
            });

            // FALLBACK: If project not found (webhook missed), create it here manually
            if (!project) {
                console.log(`[VERIFY_SESSION] Project not found for paid session ${sessionId}. Creating manually.`);

                // Need to import mapping function or duplicate small logic
                const mapServiceTypeToProjectService = (type) => {
                    const map = { 'MIXING': 'MIXING', 'MASTERING': 'MASTERING', 'RECORDING': 'PRODUCTION' };
                    return map[type] || 'MIXING';
                };

                // Run transaction to ensure consistency similar to webhook
                const result = await prisma.$transaction(async (tx) => {
                    // Update Request
                    await tx.serviceRequest.update({
                        where: { id: requestId },
                        data: { status: 'PAID', statusUpdatedAt: new Date() }
                    });

                    // Create Payment if not exists
                    const existingPayment = await tx.payment.findUnique({ where: { stripeSessionId: session.id } });
                    if (!existingPayment) {
                        await tx.payment.create({
                            data: {
                                serviceRequestId: requestId,
                                stripeSessionId: session.id,
                                stripePaymentIntentId: session.payment_intent,
                                totalAmount: session.amount_total,
                                platformFee: Math.round(session.amount_total * 0.15), // Fallback 15%
                                creatorAmount: Math.round(session.amount_total * 0.85),
                                currency: session.currency,
                                status: 'COMPLETED',
                            }
                        });
                    }

                    // Create Project
                    return await tx.project.create({
                        data: {
                            userId: serviceRequest.userId,
                            projectName: serviceRequest.projectName,
                            artistName: serviceRequest.artistName,
                            projectType: serviceRequest.projectType,
                            tier: serviceRequest.tier,
                            services: {
                                create: {
                                    type: mapServiceTypeToProjectService(serviceRequest.services),
                                    creatorId: session.metadata.creatorId // Assign creator ID from metadata
                                }
                            }
                        }
                    });
                });

                project = result;
            }

            return NextResponse.json({
                status: 'paid',
                paymentStatus: session.payment_status,
                requestId: requestId,
                projectId: project ? project.id : null,
                isProcessed: !!project
            });
        }

        return NextResponse.json({
            status: session.payment_status,
            paymentStatus: session.payment_status
        });

    } catch (error) {
        console.error('Error verifying session:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
