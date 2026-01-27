import { NextResponse } from 'next/server';
import prisma from '@/utils/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Get specific add-on
export async function GET(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return new NextResponse("Add-on ID required", { status: 400 });
        }

        const addon = await prisma.serviceAddOn.findUnique({
            where: {
                id: id
            }
        });

        return NextResponse.json(addon);
    } catch (error) {
        console.error('[ADD_ON_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// PUT: Update add-on (Admin only)
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return new NextResponse("Add-on ID required", { status: 400 });
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
            commissionPercentage,
            active
        } = body;

        const addOn = await prisma.serviceAddOn.update({
            where: {
                id: id
            },
            data: {
                serviceType,
                name,
                description,
                price: price !== undefined ? parseFloat(price) : null,
                pricePerUnit: pricePerUnit !== undefined ? parseFloat(pricePerUnit) : null,
                isQuantityBased,
                isMultiSelect,
                options: options || undefined,
                icon,
                badge,
                tierRestriction: tierRestriction || undefined,
                addsDays: addsDays ? parseInt(addsDays) : null,
                commissionPercentage: commissionPercentage !== undefined ? parseFloat(commissionPercentage) : undefined,
                active
            }
        });

        return NextResponse.json(addOn);
    } catch (error) {
        console.error('[ADD_ON_PUT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// DELETE: Delete add-on (Admin only)
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = await params;

        if (!id) {
            return new NextResponse("Add-on ID required", { status: 400 });
        }

        const addOn = await prisma.serviceAddOn.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json(addOn);
    } catch (error) {
        console.error('[ADD_ON_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
