import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

export async function PATCH(request, { params }) {
    try {
        // Verificar autenticación
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verificar que sea admin
        if (session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        // Validar status
        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json({
                error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
            }, { status: 400 });
        }

        // Verificar que el perfil existe
        const existing = await prisma.creatorProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
        }

        // Actualizar solo el status
        const updated = await prisma.creatorProfile.update({
            where: { id },
            data: { status },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        // TODO: Enviar notificación por email al creator sobre el cambio de estado

        return NextResponse.json({
            message: `Creator profile status updated to ${status}`,
            profile: updated,
        });

    } catch (error) {
        console.error('CreatorProfile PATCH Status Error:', error);
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
        }
        return NextResponse.json({ error: 'Error updating creator profile status' }, { status: 500 });
    }
}
