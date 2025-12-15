// app/api/genres/[id]/route.js
// PUT: Actualizar un género
// DELETE: Eliminar un género


import prisma from '@/utils/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const genre = await prisma.genre.findUnique({
            where: { id },
        });

        if (!genre) {
            return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
        }

        return NextResponse.json(genre);
    } catch (error) {
        console.error('Genre GET Error:', error);
        return NextResponse.json({ error: 'Error fetching genre' }, { status: 500 });
    }
}

export async function PUT(
    request,
    { params }
) {
    try {
        const body = await request.json();

        // Validación simple
        if (!body.name || typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 100) {
            return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
        }

        const genre = await prisma.genre.update({
            where: { id: params.id },
            data: { name: body.name },
        });

        return NextResponse.json(genre);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') { // Prisma error for non-existent record
            return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Error updating genre' }, { status: 500 });
    }
}

export async function DELETE(
    request,
    { params }
) {
    try {
        await prisma.genre.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Genre deleted successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Error deleting genre' }, { status: 500 });
    }
}