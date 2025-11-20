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
            { description: { contains: search } },
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
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    if (body.description && (typeof body.description !== 'string' || body.description.length > 500)) {
      return NextResponse.json({ error: 'Invalid description' }, { status: 400 });
    }

    if (body.order === undefined || isNaN(Number(body.order))) {
      return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
    }

    const tier = await prisma.tier.create({
      data: {
        name: body.name.toUpperCase(),
        description: body.description || null,
        order: Number(body.order),
      },
    });

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    console.error('POST /tiers Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A tier with that name or order already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error creating tier' }, { status: 500 });
  }
}
