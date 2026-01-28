import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import prisma from '@/utils/lib/prisma';

export async function PATCH(request, context) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = context.params;

        // Ensure the notification belongs to the user
        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        if (notification.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { read: true },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Error updating notification' }, { status: 500 });
    }
}
