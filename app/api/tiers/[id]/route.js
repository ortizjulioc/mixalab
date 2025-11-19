import prisma from '@/utils/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const tier = await prisma.tier.findUnique({ where: { id: params.id } });
    if (!tier) return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    return NextResponse.json(tier);
  } catch (error) {
    console.error('GET /tiers/[id] Error:', error);
    return NextResponse.json({ error: 'Error fetching tier' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    if (body.description && (typeof body.description !== 'string' || body.description.length > 500)) {
      return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
    }

    if (body.order === undefined || isNaN(Number(body.order))) {
      return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
    }

    const existing = await prisma.tier.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Tier not found' }, { status: 404 });

    const updated = await prisma.tier.update({
      where: { id: params.id },
      data: {
        name: body.name.toUpperCase(),
        description: body.description !== undefined ? body.description || null : existing.description,
        order: Number(body.order),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /tiers/[id] Error:', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    if (error.code === 'P2002') return NextResponse.json({ error: 'A tier with that name or order already exists' }, { status: 400 });
    return NextResponse.json({ error: 'Error updating tier' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const existing = await prisma.tier.findUnique({
      where: { id: params.id },
      include: { CreatorTier: true, UpgradeRequirements: true, DowngradeTriggers: true, MaintainRequirements: true },
    });

    if (!existing) return NextResponse.json({ error: 'Tier not found' }, { status: 404 });

    // Prevent deletion if there are dependent records
    if (
      (existing.CreatorTier && existing.CreatorTier.length > 0) ||
      existing.UpgradeRequirements ||
      existing.DowngradeTriggers ||
      existing.MaintainRequirements
    ) {
      return NextResponse.json({ error: 'Cannot delete tier with related records' }, { status: 400 });
    }

    await prisma.tier.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Tier deleted successfully' });
  } catch (error) {
    console.error('DELETE /tiers/[id] Error:', error);
    if (error.code === 'P2025') return NextResponse.json({ error: 'Tier not found' }, { status: 404 });
    if (error.code === 'P2003') return NextResponse.json({ error: 'Cannot delete tier due to related records' }, { status: 400 });
    return NextResponse.json({ error: 'Error deleting tier' }, { status: 500 });
  }
}
