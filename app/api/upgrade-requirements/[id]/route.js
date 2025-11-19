import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const item = await prisma.upgradeRequirements.findUnique({
            where: { id: params.id },
            include: { tier: true },
        });

        if (!item) return NextResponse.json({ error: 'UpgradeRequirements not found' }, { status: 404 });

        return NextResponse.json(item);
    } catch (error) {
        console.error('UpgradeRequirements GET by id Error:', error);
        return NextResponse.json({ error: 'Error fetching upgrade requirements' }, { status: 500 });
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

        if (body.minProjects !== undefined) {
            const v = Number(body.minProjects);
            if (!Number.isInteger(v) || v < 0) return NextResponse.json({ error: 'minProjects must be a non-negative integer' }, { status: 400 });
            update.minProjects = v;
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

        if (body.minReturningClients !== undefined) update.minReturningClients = body.minReturningClients === null ? null : Number(body.minReturningClients);
        if (body.minFeedbackScore !== undefined) update.minFeedbackScore = body.minFeedbackScore === null ? null : Number(body.minFeedbackScore);

        const item = await prisma.upgradeRequirements.update({
            where: { id: params.id },
            data: update,
            include: { tier: true },
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('UpgradeRequirements PUT Error:', error);
        if (error.code === 'P2025') return NextResponse.json({ error: 'UpgradeRequirements not found' }, { status: 404 });
        if (error.code === 'P2003') return NextResponse.json({ error: 'Invalid foreign key' }, { status: 400 });
        if (error.code === 'P2002') return NextResponse.json({ error: 'Unique constraint violation' }, { status: 409 });
        return NextResponse.json({ error: 'Error updating upgrade requirements' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await prisma.upgradeRequirements.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'UpgradeRequirements deleted successfully' });
    } catch (error) {
        console.error('UpgradeRequirements DELETE Error:', error);
        if (error.code === 'P2025') return NextResponse.json({ error: 'UpgradeRequirements not found' }, { status: 404 });
        return NextResponse.json({ error: 'Error deleting upgrade requirements' }, { status: 500 });
    }
}
