import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/artists/projects/[id]
 * Get project details for the artist (owner)
 */
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Fetch Project from the new Project model
        // Note: Project model ID is passed here
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                services: true,
                files: true,
                // We don't have events relation in Project model yet according to previous read schema, 
                // but we might want to fetch them separately or if relation exists.
                // Let's check schema for relation... Schema showed no relation to ProjectEvent.
                // But ServiceRequest has events. 
                // Since this Project is simplified, maybe we rely on simple data for now.
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Verify ownership
        if (project.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized access to project' }, { status: 403 });
        }

        return NextResponse.json({ project });

    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PUT /api/artists/projects/[id]
 * Update project details (e.g. status code approvals)
 */
export async function PUT(request, { params }) {
    // Implement updates if needed (e.g. approving a file)
    return NextResponse.json({ message: 'Not implemented' });
}
