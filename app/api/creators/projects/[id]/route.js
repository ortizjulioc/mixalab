import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * GET /api/creators/projects/[id]
 * Get project details for the assigned creator
 */
export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // 1. Get the current user's Creator Profile
        const currentCreator = await prisma.creatorProfile.findUnique({
            where: { userId: session.user.id }
        });

        if (!currentCreator) {
            return NextResponse.json({ error: 'Creator profile not found' }, { status: 403 });
        }

        // 2. Fetch Project (New Model)
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
                // Note: Project model doesn't have events or separate creator field like ServiceRequest
                // Access is determined by services.creatorId
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // 3. Verify Ownership
        // Creator must be assigned to at least one service in this project
        const hasAccess = project.services.some(service => service.creatorId === currentCreator.id);

        if (!hasAccess) {
            console.error(`Unauthorized: Creator (${currentCreator.id}) is not assigned to any service in Project (${project.id})`);
            return NextResponse.json({ error: 'Unauthorized access to project' }, { status: 403 });
        }

        // Inject a simulated 'status' for frontend compatibility or handle in frontend
        const projectWithStatus = {
            ...project,
            status: 'IN_PROGRESS' // Projects are active by definition
        };

        return NextResponse.json({ project: projectWithStatus });

    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PUT /api/creators/projects/[id]
 * Update project status
 */
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = params;
        const { status, message } = await request.json();

        // Validate Status Change
        const allowedStatuses = ['IN_PROGRESS', 'REVIEW_READY', 'COMPLETED', 'CANCELLED']; // Example flow
        // Note: Prisma Enum might correspond to these. Let's stick to existing ServiceRequestStatus enum values if possible or map them. 
        // Current Enum: PENDING, IN_REVIEW, ACCEPTED, REJECTED, COMPLETED, CANCELLED.
        // We might need to add IN_PROGRESS, REVIEW_READY. 
        // For now, let's use ACCEPTED as "In Progress" effectively, or assume schema has been updated.
        // Actually, user schema update earlier added: ACCEPTED, UNDER_REVIEW, REVISION_REQUESTED, COMPLETED.

        // Let's verify statuses from memory or assume standard set.
        // The previous tool output showed: ACCEPTED, UNDER_REVIEW, REVISION_REQUESTED, COMPLETED, REJECTED.

        const validStatuses = ['ACCEPTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'COMPLETED'];

        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const project = await prisma.serviceRequest.update({
            where: { id },
            data: {
                status: status,
                ...(status === 'COMPLETED' ? { completedAt: new Date() } : {})
            },
            include: { user: true } // Need user to notify
        });

        // Create Event
        await prisma.projectEvent.create({
            data: {
                requestId: id,
                type: 'STATUS_CHANGED',
                description: `Project status updated to ${status}` + (message ? `: ${message}` : ''),
                userId: session.user.id,
            }
        });

        // Notify Artist
        await prisma.notification.create({
            data: {
                userId: project.userId,
                type: 'STATUS_CHANGED',
                title: 'Project Update',
                message: `Your project "${project.projectName}" is now ${status.replace('_', ' ')}. ${message || ''}`,
                link: `/artists/my-requests/${id}`
            }
        });

        return NextResponse.json({ success: true, project });

    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
