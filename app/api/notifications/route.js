import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/utils/lib/prisma';


export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';
        const type = searchParams.get('type');

        const skip = (page - 1) * limit;

        const where = {
            userId: session.user.id,
            ...(unreadOnly && { read: false }),
            ...(type && { type }),
        };

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        const total = await prisma.notification.count({ where });
        const unreadCount = await prisma.notification.count({
            where: { userId: session.user.id, read: false }
        });

        return NextResponse.json({
            notifications,
            unreadCount, // Useful for the Badge
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Error fetching notifications' },
            { status: 500 }
        );
    }
}

// POST endpoint for manually creating notifications (e.g. from admins or test scripts)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // TODO: Add stricter role check if necessary (e.g. only Admin can send arbitrary notifications)

        const data = await request.json();
        const { userId, type, title, message, link } = data;

        if (!userId || !type || !title || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                link: link || null,
                read: false
            }
        });

        return NextResponse.json(notification, { status: 201 });

    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json(
            { error: 'Error creating notification' },
            { status: 500 }
        );
    }
}
