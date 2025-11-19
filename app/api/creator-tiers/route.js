import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

function parseBoolean(value) {
    if (value === null || value === undefined) return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
}

function parseDate(value) {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error('INVALID_DATE');
    }
    return parsed;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;

        const creatorId = searchParams.get('creatorId') || undefined;
        const tierId = searchParams.get('tierId') || undefined;
        const active = parseBoolean(searchParams.get('active'));

        const where = {
            ...(creatorId && { creatorId }),
            ...(tierId && { tierId }),
            ...(active !== undefined && { active }),
        };

        const [creatorTiers, total] = await Promise.all([
            prisma.creatorTier.findMany({
                skip,
                take: limit,
                where,
                orderBy: { assignedAt: 'desc' },
                include: {
                    creator: {
                        select: {
                            id: true,
                            userId: true,
                            brandName: true,
                        },
                    },
                    tier: true,
                },
            }),
            prisma.creatorTier.count({ where }),
        ]);

        return NextResponse.json({
            creatorTiers,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('CreatorTier GET Error:', error);
        return NextResponse.json({ error: 'Error fetching creator tiers' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.creatorId || typeof body.creatorId !== 'string') {
            return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
        }

        if (!body.tierId || typeof body.tierId !== 'string') {
            return NextResponse.json({ error: 'tierId is required' }, { status: 400 });
        }

        if (body.active !== undefined && typeof body.active !== 'boolean') {
            return NextResponse.json({ error: 'active must be a boolean' }, { status: 400 });
        }

        let assignedAt;
        let upgradedAt;
        let downgradedAt;

        try {
            assignedAt = parseDate(body.assignedAt);
            upgradedAt = parseDate(body.upgradedAt);
            downgradedAt = parseDate(body.downgradedAt);
        } catch (dateError) {
            if (dateError.message === 'INVALID_DATE') {
                return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
            }
            throw dateError;
        }

        const creatorTier = await prisma.creatorTier.create({
            data: {
                creatorId: body.creatorId,
                tierId: body.tierId,
                active: body.active ?? true,
                ...(assignedAt && { assignedAt }),
                ...(upgradedAt && { upgradedAt }),
                ...(downgradedAt && { downgradedAt }),
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        userId: true,
                        brandName: true,
                    },
                },
                tier: true,
            },
        });

        return NextResponse.json(creatorTier, { status: 201 });
    } catch (error) {
        console.error('CreatorTier POST Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Creator already has this tier assigned' }, { status: 409 });
        }
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid creatorId or tierId' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error creating creator tier' }, { status: 500 });
    }
}

