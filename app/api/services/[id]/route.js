// app/api/services/[id]/route.js
// PUT: Actualizar un género
// DELETE: Eliminar un género


import prisma from '@/utils/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';


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

        const service = await prisma.service.update({
            where: { id: params.id },
            data: { name: body.name },
        });

        return NextResponse.json(service);
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') { // Prisma error for non-existent record
            return NextResponse.json({ error: 'service not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Error updating service' }, { status: 500 });
    }
}

export async function DELETE(
    request,
    { params }
) {
    try {
        await prisma.service.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'service deleted successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'service not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Error deleting service' }, { status: 500 });
    }
}