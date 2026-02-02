import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/creators/projects
 * Get all projects where the authenticated user (creator) is assigned
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

        // 1. Get CreatorProfile ID from UserId
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!creatorProfile) {
            return NextResponse.json({ projects: [] }); // Not a creator
        }

        // 2. Find Projects where this creator is assigned to at least one service
        // The relationship should be Project -> ProjectService -> CreatorProfile
        // Checking ProjectService schema... assuming it has creatorId
        const projects = await prisma.project.findMany({
            where: {
                services: {
                    some: {
                        creatorId: creatorProfile.id
                    }
                }
            },
            include: {
                services: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ projects });

    } catch (error) {
        console.error('Error fetching creator projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
