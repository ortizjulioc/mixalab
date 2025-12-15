import prisma from '@/utils/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const tier = await prisma.tier.findUnique({ where: { id } });
    if (!tier) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Tier not found' } }, { status: 404 });
    return NextResponse.json(tier);
  } catch (error) {
    console.error('GET /tiers/[id] Error:', error);
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Error fetching tier' } }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid name' } }, { status: 400 });
    }

    if (body.description && typeof body.description !== 'string') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid description' } }, { status: 400 });
    }

    if (body.order === undefined || isNaN(Number(body.order))) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid order' } }, { status: 400 });
    }

    if (body.price !== undefined && (isNaN(Number(body.price)) || Number(body.price) < 0)) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid price' } }, { status: 400 });
    }

    if (body.numberOfRevisions !== undefined && (isNaN(Number(body.numberOfRevisions)) || Number(body.numberOfRevisions) < 0)) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid number of revisions' } }, { status: 400 });
    }

    if (body.stems !== undefined && (isNaN(Number(body.stems)) || Number(body.stems) < 0)) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid stems count' } }, { status: 400 });
    }

    if (body.deliveryDays !== undefined && (isNaN(Number(body.deliveryDays)) || Number(body.deliveryDays) < 0)) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid delivery days' } }, { status: 400 });
    }

    const existing = await prisma.tier.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Tier not found' } }, { status: 404 });

    const updated = await prisma.tier.update({
      where: { id },
      data: {
        name: body.name.toUpperCase(),
        description: body.description !== undefined ? body.description || null : existing.description,
        order: Number(body.order),
        price: body.price !== undefined ? Number(body.price) : existing.price,
        numberOfRevisions: body.numberOfRevisions !== undefined ? Number(body.numberOfRevisions) : existing.numberOfRevisions,
        stems: body.stems !== undefined ? Number(body.stems) : existing.stems,
        deliveryDays: body.deliveryDays !== undefined ? Number(body.deliveryDays) : existing.deliveryDays,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT /tiers/[id] Error:', error);
    if (error.code === 'P2025') return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Tier not found' } }, { status: 404 });
    if (error.code === 'P2002') return NextResponse.json({ success: false, error: { code: 'DUPLICATE_ERROR', message: 'A tier with that name or order already exists' } }, { status: 400 });
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Error updating tier' } }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const existing = await prisma.tier.findUnique({
      where: { id },
      include: { CreatorTier: true, UpgradeRequirements: true, DowngradeTriggers: true, MaintainRequirements: true },
    });

    if (!existing) return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Tier not found' } }, { status: 404 });

    // Prevent deletion if there are dependent records
    if (
      (existing.CreatorTier && existing.CreatorTier.length > 0) ||
      existing.UpgradeRequirements ||
      existing.DowngradeTriggers ||
      existing.MaintainRequirements
    ) {
      return NextResponse.json({ success: false, error: { code: 'CONSTRAINT_ERROR', message: 'Cannot delete tier with related records' } }, { status: 400 });
    }

    await prisma.tier.delete({ where: { id } });

    return NextResponse.json({ message: 'Tier deleted successfully' });
  } catch (error) {
    console.error('DELETE /tiers/[id] Error:', error);
    if (error.code === 'P2025') return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'Tier not found' } }, { status: 404 });
    if (error.code === 'P2003') return NextResponse.json({ success: false, error: { code: 'CONSTRAINT_ERROR', message: 'Cannot delete tier due to related records' } }, { status: 400 });
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Error deleting tier' } }, { status: 500 });
  }
}
