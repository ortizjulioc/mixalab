


import prisma from '@/utils/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;
        const search = searchParams.get('search') || '';

        const where = search ? {
            name: {
                contains: search
            }
        } : {};

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.service.count({ where }),
        ]);

        return NextResponse.json({
            services,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('GET Error:', error);
        return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Validación simple
        if (!body.name || typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 100) {
            return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
        }



        const service = await prisma.service.create({
            data: { name: body.name },
        });

        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ error: 'Error creating service' }, { status: 500 });
    }
}