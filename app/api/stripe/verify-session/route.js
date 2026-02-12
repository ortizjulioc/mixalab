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

        // 1️⃣ Retrieve Stripe session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json({
                status: session.payment_status,
                paymentStatus: session.payment_status
            });
        }

        const requestId = session.metadata?.requestId;

        if (!requestId) {
            return new NextResponse('Missing requestId metadata', { status: 400 });
        }

        // 2️⃣ Get ServiceRequest
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: { genres: true }
        });

        if (!serviceRequest) {
            return new NextResponse('ServiceRequest not found', { status: 404 });
        }

        // 3️⃣ Get Tier rules
        const tierData = await prisma.tier.findUnique({
            where: { name: serviceRequest.tier }
        });

        if (!tierData) {
            return new NextResponse('Tier not found', { status: 500 });
        }

        // 4️⃣ Check if project already exists
        let project = await prisma.project.findFirst({
            where: {
                userId: session.metadata.userId,
                projectName: serviceRequest.projectName
            },
            orderBy: { createdAt: 'desc' },
            include: { genres: true }
        });

        if (!project) {
            console.log(`[VERIFY_SESSION] Creating missing project for session ${sessionId}`);

            const mapServiceTypeToProjectService = (type) => {
                const map = {
                    MIXING: 'MIXING',
                    MASTERING: 'MASTERING',
                    RECORDING: 'PRODUCTION'
                };
                return map[type] || 'MIXING';
            };

            const result = await prisma.$transaction(async (tx) => {

                // 1️⃣ Update ServiceRequest status
                await tx.serviceRequest.update({
                    where: { id: requestId },
                    data: {
                        status: 'PAID',
                        statusUpdatedAt: new Date()
                    }
                });

                // 2️⃣ Create Payment if not exists
                const existingPayment = await tx.payment.findUnique({
                    where: { stripeSessionId: session.id }
                });

                if (!existingPayment) {
                    await tx.payment.create({
                        data: {
                            serviceRequestId: requestId,
                            stripeSessionId: session.id,
                            stripePaymentIntentId: session.payment_intent,
                            totalAmount: session.amount_total,
                            platformFee: Math.round(
                                session.amount_total * (tierData.commissionPercentage / 100)
                            ),
                            creatorAmount: Math.round(
                                session.amount_total * (1 - tierData.commissionPercentage / 100)
                            ),
                            currency: session.currency,
                            status: 'COMPLETED',
                        }
                    });
                }

                // 3️⃣ Create Project with many-to-many genres
                return await tx.project.create({
                    data: {
                        user: {
                            connect: { id: serviceRequest.userId }
                        },

                        serviceRequest: {
                            connect: { id: requestId }
                        },

                        projectName: serviceRequest.projectName,
                        artistName: serviceRequest.artistName,
                        projectType: serviceRequest.projectType,
                        tier: serviceRequest.tier,

                        // 🔥 Technical metadata
                        bpm: serviceRequest.bpm ?? null,
                        timeSignature: serviceRequest.timeSignature ?? null,
                        durationSeconds: serviceRequest.durationSeconds ?? null,
                        recordingQuality: serviceRequest.recordingQuality ?? null,
                        vocalTracksCount: serviceRequest.vocalTracksCount ?? null,
                        instrumentalType: serviceRequest.instrumentalType ?? null,

                        // 🔥 Commercial rules
                        revisionLimit: tierData.numberOfRevisions,
                        deliveryDeadline: new Date(
                            Date.now() + tierData.deliveryDays * 24 * 60 * 60 * 1000
                        ),
                        stemsIncluded: tierData.stems > 0,

                        // 🔥 MANY-TO-MANY GENRES
                        genres: serviceRequest.genres?.length
                            ? {
                                create: serviceRequest.genres.map((sg) => ({
                                    genre: {
                                        connect: { id: sg.genreId }
                                    }
                                }))
                            }
                            : undefined,

                        services: {
                            create: {
                                type: mapServiceTypeToProjectService(serviceRequest.services),
                                creatorId: session.metadata.creatorId
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
            requestId,
            projectId: project?.id ?? null,
            isProcessed: !!project
        });

    } catch (error) {
        console.error('Error verifying session:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
