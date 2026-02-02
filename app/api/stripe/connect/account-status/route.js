import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/utils/lib/prisma';
import { stripe } from '@/utils/stripe/server';

/**
 * GET /api/stripe/connect/account-status
 * Checks the status of the creator's Stripe Connect account
 */
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const creator = await prisma.creatorProfile.findUnique({
            where: { userId: session.user.id },
            select: { id: true, stripeConnectAccountId: true },
        });

        if (!creator || !creator.stripeConnectAccountId) {
            return NextResponse.json({
                isConnected: false,
                onboardingComplete: false,
                payoutsEnabled: false,
            });
        }

        const account = await stripe.accounts.retrieve(creator.stripeConnectAccountId);

        const isConnected = true;
        const payoutsEnabled = account.payouts_enabled;
        const chargesEnabled = account.charges_enabled;
        const detailsSubmitted = account.details_submitted;

        // Sync with DB
        await prisma.creatorProfile.update({
            where: { id: creator.id },
            data: {
                stripeOnboardingComplete: detailsSubmitted,
                stripePayoutsEnabled: payoutsEnabled,
            },
        });

        return NextResponse.json({
            isConnected,
            onboardingComplete: detailsSubmitted,
            payoutsEnabled,
            chargesEnabled,
        });

    } catch (error) {
        console.error('[STRIPE_CONNECT_STATUS]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
