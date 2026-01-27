import { NextResponse } from 'next/server';
import prisma from '@/utils/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: List all add-ons with pagination and search
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

        // Search by name or description
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get total count for pagination
        const total = await prisma.serviceAddOn.count({ where: whereClause });

        // Get paginated results
        const addOns = await prisma.serviceAddOn.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return NextResponse.json({
            items: addOns,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[ADD_ONS_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// POST: Create new add-on (Admin only)
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const {
            serviceType,
            name,
            description,
            price,
            pricePerUnit,
            isQuantityBased,
            isMultiSelect,
            options,
            icon,
            badge,
            tierRestriction,
            addsDays,
            commissionPercentage
        } = body;

        if (!serviceType || !name) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const addOn = await prisma.serviceAddOn.create({
            data: {
                serviceType,
                name,
                description,
                price: price !== undefined ? parseFloat(price) : null,
                pricePerUnit: pricePerUnit !== undefined ? parseFloat(pricePerUnit) : null,
                isQuantityBased: isQuantityBased || false,
                isMultiSelect: isMultiSelect || false,
                options: options || undefined,
                icon,
                badge,
                tierRestriction: tierRestriction || undefined,
                addsDays: addsDays ? parseInt(addsDays) : null,
                commissionPercentage: commissionPercentage !== undefined ? parseFloat(commissionPercentage) : 10,
                active: true
            }
        });

        return NextResponse.json(addOn);
    } catch (error) {
        console.error('[ADD_ONS_POST]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
