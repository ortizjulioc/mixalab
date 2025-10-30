


import prisma from '@/utils/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        

        const [genres, total] = await Promise.all([
            prisma.genre.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.genre.count(),
        ]);

        return NextResponse.json({
            genres,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('GET Error:', error);
        return NextResponse.json({ error: 'Error fetching genres' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Validación simple
        if (!body.name || typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 100) {
            return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
        }

        

        const genre = await prisma.genre.create({
            data: { name: body.name },
        });

        return NextResponse.json(genre, { status: 201 });
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ error: 'Error creating genre' }, { status: 500 });
    }
}