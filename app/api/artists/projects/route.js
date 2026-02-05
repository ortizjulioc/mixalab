import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/artists/projects
 * Get all projects for the authenticated artist
 */
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
        }

        const projects = await prisma.project.findMany({
            where: { userId },
            include: {
                services: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ projects });

    } catch (error) {
        console.error('Error fetching artist projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
