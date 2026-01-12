import { NextResponse } from 'next/server';
import prisma from '@/utils/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: List acceptance conditions with pagination and search
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const serviceType = searchParams.get('serviceType');
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;

        const whereClause = {};

        // Filter by service type
        if (serviceType) {
            whereClause.serviceType = serviceType;
        }

        // Search by label or fieldName
        if (search) {
            whereClause.OR = [
                { label: { contains: search, mode: 'insensitive' } },
                { fieldName: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get total count for pagination
        const total = await prisma.acceptanceCondition.count({ where: whereClause });

        // Get paginated results
        const conditions = await prisma.acceptanceCondition.findMany({
            where: whereClause,
            orderBy: [
                { serviceType: 'asc' },
                { order: 'asc' },
                { createdAt: 'desc' }
            ],
            skip: (page - 1) * limit,
            take: limit,
        });

        return NextResponse.json({
            items: conditions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[ACCEPTANCE_CONDITIONS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// POST: Create new acceptance condition (Admin only)
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const {
            serviceType,
            fieldName,
            label,
            description,
            order,
            required,
            active
        } = body;

        if (!serviceType || !fieldName || !label) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const condition = await prisma.acceptanceCondition.create({
            data: {
                serviceType,
                fieldName,
                label,
                description,
                order: order !== undefined ? parseInt(order) : 0,
                required: required !== undefined ? required : true,
                active: active !== undefined ? active : true
            }
        });

        return NextResponse.json(condition);
    } catch (error) {
        console.error('[ACCEPTANCE_CONDITIONS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
