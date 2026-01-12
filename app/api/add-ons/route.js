import { NextResponse } from 'next/server';
import prisma from '@/utils/lib/prisma';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const serviceType = searchParams.get('serviceType'); // 'MIXING' or 'MASTERING'

        const whereClause = {
            active: true,
        };

        if (serviceType) {
            whereClause.serviceType = serviceType;
        }

        const addOns = await prisma.serviceAddOn.findMany({
            where: whereClause,
            orderBy: {
                price: 'asc', // Or some other order
            },
        });

        return NextResponse.json(addOns);
    } catch (error) {
        console.error('[PUBLIC_ADD_ONS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
