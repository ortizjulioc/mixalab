import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/utils/lib/prisma';
import { stripe } from '@/utils/stripe/server';

/**
 * POST /api/stripe/create-checkout-session
 * Creates a Stripe Checkout session for the service request
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { requestId, tier, addOns } = await req.json();

        // 1. Fetch Request Details & Prices from DB
        const request = await prisma.serviceRequest.findUnique({
            where: { id: requestId },
            include: {
                user: true,
                creator: true,
            },
        });

        if (!request || request.userId !== session.user.id) {
            return new NextResponse('Unauthorized or Request Not Found', { status: 403 });
        }

        // 2. Fetch Tier Price
        const tierData = await prisma.tier.findUnique({
            where: { name: tier },
        });

        if (!tierData) {
            return new NextResponse('Invalid Tier', { status: 400 });
        }

        let basePrice = 0;
        // Logic to get correct price based on service type? 
        // For now using the logic discussed: fallback to hardcoded if json structure is complex or assume structure
        // Assuming tierData.prices is JSON: { "MIXING": 199, ... }
        if (tierData.prices && typeof tierData.prices === 'object') {
            // We need to know the service type from request.services (ENUM)
            // Mapping ENUM to Key if necessary. 
            // Request.services is ServiceType enum (MIXING, MASTERING, RECORDING)
            basePrice = tierData.prices[request.services] || tierData.price;
        } else {
            basePrice = tierData.price;
        }

        // Ensure basePrice is valid
        if (!basePrice) basePrice = 0;

        // 3. Build Line Items
        const lineItems = [];

        // Base Tier Item
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${request.projectName} - ${tier} Tier (${request.services})`,
                    description: `Service request for ${request.artistName}`,
                },
                unit_amount: Math.round(basePrice * 100), // cents
            },
            quantity: 1,
        });

        // Add-ons
        if (addOns && addOns.length > 0) {
            // Need to verify add-on prices from DB for security
            const addOnIds = addOns.map(a => a.id);
            const dbAddOns = await prisma.serviceAddOn.findMany({
                where: { id: { in: addOnIds } }
            });

            addOns.forEach(addOn => {
                const dbAddOn = dbAddOns.find(a => a.id === addOn.id);
                if (dbAddOn) {
                    const price = dbAddOn.pricePerUnit || dbAddOn.price || 0;
                    lineItems.push({
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Add-on: ${dbAddOn.name}`,
                            },
                            unit_amount: Math.round(price * 100), // cents
                        },
                        quantity: addOn.quantity || 1,
                    });
                }
            });
        }

        // 4. Create Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'payment',
            client_reference_id: requestId,
            customer_email: session.user.email,
            line_items: lineItems,
            payment_intent_data: {
                metadata: {
                    requestId: requestId,
                    creatorId: request.creatorId || '',
                    userId: session.user.id,
                },
            },
            metadata: {
                requestId: requestId,
                creatorId: request.creatorId || '',
            },
            success_url: `${process.env.NEXTAUTH_URL}/artists/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/artists/payment/cancel?requestId=${requestId}`,
        });

        return NextResponse.json({ sessionUrl: checkoutSession.url });

    } catch (error) {
        console.error('[STRIPE_CHECKOUT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
