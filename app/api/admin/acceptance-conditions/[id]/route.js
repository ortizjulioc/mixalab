import { NextResponse } from 'next/server';
import prisma from '@/utils/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Get single acceptance condition by ID
export async function GET(req, { params }) {
    try {
        const condition = await prisma.acceptanceCondition.findUnique({
            where: { id: params.id }
        });

        if (!condition) {
            return new NextResponse('Not Found', { status: 404 });
        }

        return NextResponse.json(condition);
    } catch (error) {
        console.error('[ACCEPTANCE_CONDITION_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// PUT: Update acceptance condition (Admin only)
export async function PUT(req, { params }) {
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

        const condition = await prisma.acceptanceCondition.update({
            where: { id: params.id },
            data: {
                serviceType,
                fieldName,
                label,
                description,
                order: order !== undefined ? parseInt(order) : undefined,
                required,
                active
            }
        });

        return NextResponse.json(condition);
    } catch (error) {
        console.error('[ACCEPTANCE_CONDITION_PUT]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

// DELETE: Delete acceptance condition (Admin only)
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await prisma.acceptanceCondition.delete({
            where: { id: params.id }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('[ACCEPTANCE_CONDITION_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
