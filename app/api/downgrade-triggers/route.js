import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;

        const tierId = searchParams.get('tierId') || undefined;

        const where = {
            ...(tierId && { tierId }),
        };

        const [items, total] = await Promise.all([
            prisma.downgradeTriggers.findMany({
                skip,
                take: limit,
                where,
                orderBy: { id: 'desc' },
                include: { tier: true },
            }),
            prisma.downgradeTriggers.count({ where }),
        ]);

        return NextResponse.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('DowngradeTriggers GET Error:', error);
        return NextResponse.json({ error: 'Error fetching downgrade triggers' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.tierId || typeof body.tierId !== 'string') {
            return NextResponse.json({ error: 'tierId is required' }, { status: 400 });
        }

        const minRatingThreshold = Number(body.minRatingThreshold);
        const lateDeliveriesLimit = Number(body.lateDeliveriesLimit);

        if (Number.isNaN(minRatingThreshold) || minRatingThreshold < 0) {
            return NextResponse.json({ error: 'minRatingThreshold must be a non-negative number' }, { status: 400 });
        }

        if (!Number.isInteger(lateDeliveriesLimit) || lateDeliveriesLimit < 0) {
            return NextResponse.json({ error: 'lateDeliveriesLimit must be a non-negative integer' }, { status: 400 });
        }

        const data = {
            tierId: body.tierId,
            minRatingThreshold,
            lateDeliveriesLimit,
            ...(body.unresolvedDisputesLimit !== undefined && { unresolvedDisputesLimit: Number(body.unresolvedDisputesLimit) }),
            ...(body.refundRateLimit !== undefined && { refundRateLimit: Number(body.refundRateLimit) }),
            ...(body.inactivityDays !== undefined && { inactivityDays: Number(body.inactivityDays) }),
        };

        const item = await prisma.downgradeTriggers.create({ data, include: { tier: true } });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('DowngradeTriggers POST Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'DowngradeTriggers for this tier already exists' }, { status: 409 });
        }
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid tierId' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error creating downgrade triggers' }, { status: 500 });
    }
}
