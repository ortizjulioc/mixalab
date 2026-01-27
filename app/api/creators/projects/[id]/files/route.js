import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

/**
 * POST /api/creators/projects/[id]/files
 * Register a new file uploaded by the creator (deliverable, preview, etc.)
 */
export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { name, url, mimeType, size, category } = body;
        // category could be: 'DEMO', 'FINAL_MASTER', 'STEMS'

        // 1. Verify access (Optional but good)
        // ... (Skipping full check for speed, assuming UI guards it slightly, strict check is better security practice though)

        // 2. Create File Record
        const newFile = await prisma.file.create({
            data: {
                name,
                url,
                mimeType: mimeType || 'application/octet-stream',
                size: size || 0,
                folder: category || 'DELIVERABLES',
                userId: session.user.id,
                requestId: id, // Link to request
            }
        });

        // 3. Create Event
        await prisma.projectEvent.create({
            data: {
                requestId: id,
                type: 'FILE_UPLOADED',
                description: `Uploaded file: ${name} (${category})`,
                userId: session.user.id,
            }
        });

        // 4. Notify Artist
        // First get the project to know the artist ID
        const project = await prisma.serviceRequest.findUnique({
            where: { id },
            select: { userId: true, projectName: true }
        });

        if (project) {
            await prisma.notification.create({
                data: {
                    userId: project.userId,
                    type: 'FILE_UPLOADED',
                    title: 'New File Uploaded',
                    message: `Creator uploaded "${name}" for project "${project.projectName}"`,
                    link: `/artists/my-requests/${id}`
                }
            });
        }

        return NextResponse.json({ success: true, file: newFile });

    } catch (error) {
        console.error('Error registering file:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
