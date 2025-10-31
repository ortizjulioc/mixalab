// app/api/services/[id]/route.js
// PUT: Actualizar un servicio
// DELETE: Eliminar un servicio

import prisma from '@/utils/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
    request,
    { params }
) {
    try {
        const body = await request.json();

        // Validación
        if (!body.name || typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 100) {
            return NextResponse.json({ error: 'Invalid name: must be a string between 1 and 100 characters' }, { status: 400 });
        }

        if (body.serviceType && (typeof body.serviceType !== 'string' || !['MIXING', 'MASTERING', 'RECORDING', 'PRODUCTION', 'ARRANGEMENT', 'OTHER'].includes(body.serviceType.toUpperCase()))) {
            return NextResponse.json({ error: 'Invalid serviceType: must be one of MIXING, MASTERING, RECORDING, PRODUCTION, ARRANGEMENT, OTHER' }, { status: 400 });
        }

        if (body.description && (typeof body.description !== 'string' || body.description.length > 500)) {
            return NextResponse.json({ error: 'Invalid description: must be a string up to 500 characters' }, { status: 400 });
        }

        // Verificar si el servicio existe antes de actualizar (opcional, pero evita errores innecesarios)
        const existingService = await prisma.service.findUnique({
            where: { id: params.id },
        });
        if (!existingService) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        const service = await prisma.service.update({
            where: { id: params.id },
            data: { 
                name: body.name,
                ...(body.serviceType && { serviceType: body.serviceType.toUpperCase() }), // Opcional: solo si se proporciona
                ...(body.description !== undefined && { description: body.description || null }), // Opcional: permite actualizar a null o string
            },
        });

        return NextResponse.json(service);
    } catch (error) {
        console.error('PUT Error:', error);
        if (error.code === 'P2025') { // Prisma error for non-existent record
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Error updating service' }, { status: 500 });
    }
}

export async function DELETE(
    request,
    { params }
) {
    try {
        // Verificar si el servicio existe y maneja relaciones si es necesario
        // Nota: Si hay creatorOfferings relacionados, Prisma lanzará error si no hay cascade delete configurado.
        // Considera agregar soft delete o manejo de dependencias si aplica.
        const existingService = await prisma.service.findUnique({
            where: { id: params.id },
            include: { creatorOfferings: true }, // Opcional: verifica si hay dependencias
        });

        if (!existingService) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        if (existingService.creatorOfferings.length > 0) {
            // Opcional: Prevenir eliminación si hay dependencias
            return NextResponse.json({ error: 'Cannot delete service with associated offerings' }, { status: 400 });
        }

        await prisma.service.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('DELETE Error:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }
        if (error.code === 'P2003') { // Foreign key constraint violation
            return NextResponse.json({ error: 'Cannot delete service due to related records' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error deleting service' }, { status: 500 });
    }
}