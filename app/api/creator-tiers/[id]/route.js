import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

function parseDate(value) {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new Error('INVALID_DATE');
    }
    return parsed;
}

export async function PUT(request, { params }) {
    try {
        const body = await request.json();

        const data = {};

        if (body.tierId !== undefined) {
            if (typeof body.tierId !== 'string' || body.tierId.length === 0) {
                return NextResponse.json({ error: 'tierId must be a non-empty string' }, { status: 400 });
            }
            data.tierId = body.tierId;
        }

        if (body.active !== undefined) {
            if (typeof body.active !== 'boolean') {
                return NextResponse.json({ error: 'active must be a boolean' }, { status: 400 });
            }
            data.active = body.active;
        }

        try {
            const assignedAt = parseDate(body.assignedAt);
            const upgradedAt = parseDate(body.upgradedAt);
            const downgradedAt = parseDate(body.downgradedAt);
            if (assignedAt) data.assignedAt = assignedAt;
            if (upgradedAt || body.upgradedAt === null) data.upgradedAt = upgradedAt ?? null;
            if (downgradedAt || body.downgradedAt === null) data.downgradedAt = downgradedAt ?? null;
        } catch (dateError) {
            if (dateError.message === 'INVALID_DATE') {
                return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
            }
            throw dateError;
        }

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
        }

        const existing = await prisma.creatorTier.findUnique({
            where: { id: params.id },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Creator tier not found' }, { status: 404 });
        }

        const creatorTier = await prisma.creatorTier.update({
            where: { id: params.id },
            data,
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

        return NextResponse.json(creatorTier);
    } catch (error) {
        console.error('CreatorTier PUT Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Creator already has this tier assigned' }, { status: 409 });
        }
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid tierId' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error updating creator tier' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await prisma.creatorTier.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Creator tier deleted successfully' });
    } catch (error) {
        console.error('CreatorTier DELETE Error:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Creator tier not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Error deleting creator tier' }, { status: 500 });
    }
}

