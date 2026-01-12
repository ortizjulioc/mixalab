import prisma from '@/utils/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';

    const where = search
      ? {
        OR: [
          { name: { contains: search } },
        ],
      }
      : {};

    const [tiers, total] = await Promise.all([
      prisma.tier.findMany({
        skip,
        take: limit,
        where,
        orderBy: { order: 'asc' },
      }),
      prisma.tier.count({ where }),
    ]);

    return NextResponse.json({ tiers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error('GET /tiers Error:', error);
    return NextResponse.json({ error: 'Error fetching tiers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid name' } }, { status: 400 });
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

    const tier = await prisma.tier.create({
      data: {
        name: body.name.toUpperCase(),
        order: Number(body.order),
        price: body.price !== undefined ? Number(body.price) : 0,
        prices: body.prices || null, // Guardar precios por servicio
        numberOfRevisions: body.numberOfRevisions !== undefined ? Number(body.numberOfRevisions) : 0,
        stems: body.stems !== undefined ? (body.stems === '' || body.stems === null ? null : Number(body.stems)) : null,
        deliveryDays: body.deliveryDays !== undefined ? Number(body.deliveryDays) : 0,
        serviceDescriptions: body.serviceDescriptions || null,
      },
    });

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    console.error('POST /tiers Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: { code: 'DUPLICATE_ERROR', message: 'A tier with that name or order already exists' } }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Error creating tier' } }, { status: 500 });
  }
}
