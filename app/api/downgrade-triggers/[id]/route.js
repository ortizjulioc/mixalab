import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const item = await prisma.downgradeTriggers.findUnique({
            where: { id: params.id },
            include: { tier: true },
        });

        if (!item) return NextResponse.json({ error: 'DowngradeTriggers not found' }, { status: 404 });

        return NextResponse.json(item);
    } catch (error) {
        console.error('DowngradeTriggers GET by id Error:', error);
        return NextResponse.json({ error: 'Error fetching downgrade triggers' }, { status: 500 });
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

        if (body.minRatingThreshold !== undefined) {
            const v = Number(body.minRatingThreshold);
            if (Number.isNaN(v) || v < 0) return NextResponse.json({ error: 'minRatingThreshold must be non-negative' }, { status: 400 });
            update.minRatingThreshold = v;
        }

        if (body.lateDeliveriesLimit !== undefined) {
            const v = Number(body.lateDeliveriesLimit);
            if (!Number.isInteger(v) || v < 0) return NextResponse.json({ error: 'lateDeliveriesLimit must be a non-negative integer' }, { status: 400 });
            update.lateDeliveriesLimit = v;
        }

        if (body.unresolvedDisputesLimit !== undefined) update.unresolvedDisputesLimit = body.unresolvedDisputesLimit === null ? null : Number(body.unresolvedDisputesLimit);
        if (body.refundRateLimit !== undefined) update.refundRateLimit = body.refundRateLimit === null ? null : Number(body.refundRateLimit);
        if (body.inactivityDays !== undefined) update.inactivityDays = body.inactivityDays === null ? null : Number(body.inactivityDays);

        const item = await prisma.downgradeTriggers.update({
            where: { id: params.id },
            data: update,
            include: { tier: true },
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('DowngradeTriggers PUT Error:', error);
        if (error.code === 'P2025') return NextResponse.json({ error: 'DowngradeTriggers not found' }, { status: 404 });
        if (error.code === 'P2003') return NextResponse.json({ error: 'Invalid foreign key' }, { status: 400 });
        if (error.code === 'P2002') return NextResponse.json({ error: 'Unique constraint violation' }, { status: 409 });
        return NextResponse.json({ error: 'Error updating downgrade triggers' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await prisma.downgradeTriggers.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'DowngradeTriggers deleted successfully' });
    } catch (error) {
        console.error('DowngradeTriggers DELETE Error:', error);
        if (error.code === 'P2025') return NextResponse.json({ error: 'DowngradeTriggers not found' }, { status: 404 });
        return NextResponse.json({ error: 'Error deleting downgrade triggers' }, { status: 500 });
    }
}
