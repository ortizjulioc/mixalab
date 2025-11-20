import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

function parseJSON(value) {
    if (value === undefined) return undefined;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch (e) {
        return undefined;
    }
}

const AVAILABILITIES = ['FULL_TIME', 'PART_TIME', 'ON_DEMAND'];

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;

        const search = searchParams.get('search') || undefined; // search brandName
        const availability = searchParams.get('availability') || undefined;
        const userId = searchParams.get('userId') || undefined;

        const where = {
            ...(search && { brandName: { contains: search } }),
            ...(availability && { availability }),
            ...(userId && { userId }),
            deleted: false,
        };

        const [items, total] = await Promise.all([
            prisma.creatorProfile.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, email: true, name: true } } },
            }),
            prisma.creatorProfile.count({ where }),
        ]);

        return NextResponse.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('CreatorProfile GET Error:', error);
        return NextResponse.json({ error: 'Error fetching creator profiles' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.userId || typeof body.userId !== 'string') {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        if (!body.brandName || typeof body.brandName !== 'string' || body.brandName.trim().length === 0) {
            return NextResponse.json({ error: 'brandName is required' }, { status: 400 });
        }

        const yearsOfExperience = Number(body.yearsOfExperience ?? 0);
        if (!Number.isInteger(yearsOfExperience) || yearsOfExperience < 0) {
            return NextResponse.json({ error: 'yearsOfExperience must be a non-negative integer' }, { status: 400 });
        }

        const availability = body.availability;
        if (!AVAILABILITIES.includes(availability)) {
            return NextResponse.json({ error: `availability must be one of ${AVAILABILITIES.join(', ')}` }, { status: 400 });
        }

        const socials = parseJSON(body.socials);

        const data = {
            userId: body.userId,
            brandName: body.brandName,
            country: body.country ?? null,
            portfolio: body.portfolio ?? null,
            socials: socials ?? null,
            yearsOfExperience,
            mainDaw: body.mainDaw ?? null,
            gearList: body.gearList ?? null,
            availability,
        };

        const item = await prisma.creatorProfile.create({ data, include: { user: { select: { id: true, email: true, name: true } } } });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('CreatorProfile POST Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'CreatorProfile for this user already exists' }, { status: 409 });
        }
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error creating creator profile' }, { status: 500 });
    }
}
