import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/utils/lib/prisma';
import { stripe } from '@/utils/stripe/server';

/**
 * POST /api/stripe/connect/onboard
 * Creates a Stripe Connect account for the creator and returns an onboarding link
 */
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Get creator profile
        const creator = await prisma.creatorProfile.findUnique({
            where: { userId: session.user.id },
            include: { user: true },
        });

        if (!creator) {
            return new NextResponse('Creator profile not found', { status: 404 });
        }

        // 1. Create or retrieve Stripe Account
        let accountId = creator.stripeConnectAccountId;

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US', // Default to US or make dynamic based on user
                email: session.user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    userId: session.user.id,
                    creatorId: creator.id,
                },
            });

            accountId = account.id;

            // Save account ID to DB
            await prisma.creatorProfile.update({
                where: { id: creator.id },
                data: { stripeConnectAccountId: accountId },
            });
        }

        // 2. Create Account Link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXTAUTH_URL}/creators/settings/stripe?refresh=true`,
            return_url: `${process.env.NEXTAUTH_URL}/creators/settings/stripe?success=true`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error) {
        console.error('[STRIPE_CONNECT_ONBOARD]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
