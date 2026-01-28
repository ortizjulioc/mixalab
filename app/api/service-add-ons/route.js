import { NextResponse } from 'next/server';
import prisma from '@/utils/lib/prisma';

/**
 * GET /api/service-add-ons
 * Fetch service add-ons, optionally filtered by IDs
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const idsParam = searchParams.get('ids'); // Comma-separated IDs
        const serviceType = searchParams.get('serviceType');

        const where = {
            active: true,
        };

        // Filter by service type if provided
        if (serviceType) {
            where.serviceType = serviceType;
        }

        // Filter by specific IDs if provided
        if (idsParam) {
            const ids = idsParam.split(',').filter(id => id.trim());
            if (ids.length > 0) {
                where.id = { in: ids };
            }
        }

        const addOns = await prisma.serviceAddOn.findMany({
            where,
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json({ addOns }, { status: 200 });
    } catch (error) {
        console.error('Error fetching service add-ons:', error);
        return NextResponse.json(
            { error: 'Error fetching add-ons' },
            { status: 500 }
        );
    }
}
