import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

function parseBoolean(value) {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
}

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
            prisma.maintainRequirements.findMany({
                skip,
                take: limit,
                where,
                orderBy: { id: 'desc' },
                include: { tier: true },
            }),
            prisma.maintainRequirements.count({ where }),
        ]);

        return NextResponse.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('MaintainRequirements GET Error:', error);
        return NextResponse.json({ error: 'Error fetching maintain requirements' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.tierId || typeof body.tierId !== 'string') {
            return NextResponse.json({ error: 'tierId is required' }, { status: 400 });
        }

        const minRating = Number(body.minRating);
        const minOnTimeRate = Number(body.minOnTimeRate);
        const requireRetentionFeedback = parseBoolean(body.requireRetentionFeedback);

        if (Number.isNaN(minRating) || minRating < 0) {
            return NextResponse.json({ error: 'minRating must be a non-negative number' }, { status: 400 });
        }

        if (Number.isNaN(minOnTimeRate) || minOnTimeRate < 0 || minOnTimeRate > 1) {
            return NextResponse.json({ error: 'minOnTimeRate must be a number between 0 and 1' }, { status: 400 });
        }

        if (requireRetentionFeedback === undefined) {
            return NextResponse.json({ error: 'requireRetentionFeedback is required and must be a boolean' }, { status: 400 });
        }

        const data = {
            tierId: body.tierId,
            minRating,
            minOnTimeRate,
            requireRetentionFeedback,
        };

        const item = await prisma.maintainRequirements.create({ data, include: { tier: true } });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('MaintainRequirements POST Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'MaintainRequirements for this tier already exists' }, { status: 409 });
        }
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid tierId' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error creating maintain requirements' }, { status: 500 });
    }
}
