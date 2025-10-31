import prisma from '@/utils/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;
        const search = searchParams.get('search') || '';
        const serviceType = searchParams.get('serviceType') || ''; // Opcional: filtro por tipo de servicio

        const where = {
            ...(search && {
                name: {
                    contains: search,
                    mode: 'insensitive', // Para búsqueda insensible a mayúsculas
                },
            }),
            ...(serviceType && {
                serviceType: serviceType.toUpperCase(), // Asumiendo que se envía en formato enum
            }),
        };

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

        // Validación
        if (!body.name || typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 100) {
            return NextResponse.json({ error: 'Invalid name: must be a string between 1 and 100 characters' }, { status: 400 });
        }

        if (!body.serviceType || typeof body.serviceType !== 'string' || !['MIXING', 'MASTERING', 'RECORDING', 'PRODUCTION', 'ARRANGEMENT', 'OTHER'].includes(body.serviceType.toUpperCase())) {
            return NextResponse.json({ error: 'Invalid serviceType: must be one of MIXING, MASTERING, RECORDING, PRODUCTION, ARRANGEMENT, OTHER' }, { status: 400 });
        }

        if (body.description && (typeof body.description !== 'string' || body.description.length > 500)) {
            return NextResponse.json({ error: 'Invalid description: must be a string up to 500 characters' }, { status: 400 });
        }

        const service = await prisma.service.create({
            data: { 
                name: body.name,
                serviceType: body.serviceType.toUpperCase(), // Normalizar a mayúsculas para coincidir con el enum
                description: body.description || null, // Opcional
            },
        });

        return NextResponse.json(service, { status: 201 });
    } catch (error) {
        console.error('POST Error:', error);
        return NextResponse.json({ error: 'Error creating service' }, { status: 500 });
    }
}