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
            prisma.upgradeRequirements.findMany({
                skip,
                take: limit,
                where,
                orderBy: { id: 'desc' },
                include: { tier: true },
            }),
            prisma.upgradeRequirements.count({ where }),
        ]);

        return NextResponse.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('UpgradeRequirements GET Error:', error);
        return NextResponse.json({ error: 'Error fetching upgrade requirements' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.tierId || typeof body.tierId !== 'string') {
            return NextResponse.json({ error: 'tierId is required' }, { status: 400 });
        }

        const minProjects = Number(body.minProjects);
        const minRating = Number(body.minRating);
        const minOnTimeRate = Number(body.minOnTimeRate);

        if (!Number.isInteger(minProjects) || minProjects < 0) {
            return NextResponse.json({ error: 'minProjects must be a non-negative integer' }, { status: 400 });
        }

        if (Number.isNaN(minRating) || minRating < 0) {
            return NextResponse.json({ error: 'minRating must be a non-negative number' }, { status: 400 });
        }

        if (Number.isNaN(minOnTimeRate) || minOnTimeRate < 0 || minOnTimeRate > 1) {
            return NextResponse.json({ error: 'minOnTimeRate must be a number between 0 and 1' }, { status: 400 });
        }

        const data = {
            tierId: body.tierId,
            minProjects,
            minRating,
            minOnTimeRate,
            ...(body.minReturningClients !== undefined && { minReturningClients: Number(body.minReturningClients) }),
            ...(body.minFeedbackScore !== undefined && { minFeedbackScore: Number(body.minFeedbackScore) }),
        };

        const item = await prisma.upgradeRequirements.create({ data, include: { tier: true } });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('UpgradeRequirements POST Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'UpgradeRequirements for this tier already exists' }, { status: 409 });
        }
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid tierId' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error creating upgrade requirements' }, { status: 500 });
    }
}
