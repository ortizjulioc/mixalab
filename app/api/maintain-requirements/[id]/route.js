import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

function parseBoolean(value) {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
}

export async function GET(request, { params }) {
    try {
        const item = await prisma.maintainRequirements.findUnique({
            where: { id: params.id },
            include: { tier: true },
        });

        if (!item) return NextResponse.json({ error: 'MaintainRequirements not found' }, { status: 404 });

        return NextResponse.json(item);
    } catch (error) {
        console.error('MaintainRequirements GET by id Error:', error);
        return NextResponse.json({ error: 'Error fetching maintain requirements' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const body = await request.json();

        const update = {};

        if (body.tierId !== undefined) {
            if (typeof body.tierId !== 'string') return NextResponse.json({ error: 'Invalid tierId' }, { status: 400 });
            update.tierId = body.tierId;
        }

        if (body.minRating !== undefined) {
            const v = Number(body.minRating);
            if (Number.isNaN(v) || v < 0) return NextResponse.json({ error: 'minRating must be non-negative' }, { status: 400 });
            update.minRating = v;
        }

        if (body.minOnTimeRate !== undefined) {
            const v = Number(body.minOnTimeRate);
            if (Number.isNaN(v) || v < 0 || v > 1) return NextResponse.json({ error: 'minOnTimeRate must be between 0 and 1' }, { status: 400 });
            update.minOnTimeRate = v;
        }

        if (body.requireRetentionFeedback !== undefined) {
            const b = parseBoolean(body.requireRetentionFeedback);
            if (b === undefined) return NextResponse.json({ error: 'requireRetentionFeedback must be a boolean' }, { status: 400 });
            update.requireRetentionFeedback = b;
        }

        const item = await prisma.maintainRequirements.update({
            where: { id: params.id },
            data: update,
            include: { tier: true },
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('MaintainRequirements PUT Error:', error);
        if (error.code === 'P2025') return NextResponse.json({ error: 'MaintainRequirements not found' }, { status: 404 });
        if (error.code === 'P2003') return NextResponse.json({ error: 'Invalid foreign key' }, { status: 400 });
        if (error.code === 'P2002') return NextResponse.json({ error: 'Unique constraint violation' }, { status: 409 });
        return NextResponse.json({ error: 'Error updating maintain requirements' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await prisma.maintainRequirements.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'MaintainRequirements deleted successfully' });
    } catch (error) {
        console.error('MaintainRequirements DELETE Error:', error);
        if (error.code === 'P2025') return NextResponse.json({ error: 'MaintainRequirements not found' }, { status: 404 });
        return NextResponse.json({ error: 'Error deleting maintain requirements' }, { status: 500 });
    }
}
