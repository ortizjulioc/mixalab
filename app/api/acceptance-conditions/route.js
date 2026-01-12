import { NextResponse } from 'next/server';
import prisma from '@/utils/lib/prisma';

// GET: List active acceptance conditions filtered by serviceType (public endpoint for artists)
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const serviceType = searchParams.get('serviceType');

        if (!serviceType) {
            return new NextResponse('Service type is required', { status: 400 });
        }

        const conditions = await prisma.acceptanceCondition.findMany({
            where: {
                serviceType,
                active: true
            },
            orderBy: {
                order: 'asc',
            },
        });

        return NextResponse.json(conditions);
    } catch (error) {
        console.error('[PUBLIC_ACCEPTANCE_CONDITIONS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
