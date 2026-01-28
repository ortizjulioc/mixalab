import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import prisma from '@/utils/lib/prisma';

export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updated = await prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                read: false
            },
            data: { read: true },
        });

        return NextResponse.json({ count: updated.count });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ error: 'Error updating notifications' }, { status: 500 });
    }
}
