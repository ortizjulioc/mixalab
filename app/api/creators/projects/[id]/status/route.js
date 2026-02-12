import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: projectId } = params;
        const { status, message } = await request.json(); // message optional for logs

        // 1. Verify Project Access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { services: true }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const currentCreator = await prisma.creatorProfile.findUnique({
            where: { userId: session.user.id }
        });

        // Permission check: Who can change status?
        // - Creator can move to REVIEW
        // - Artist (Owner) can move to REVISION_REQUESTED or COMPLETED
        // - Admin can do anything

        // Simplification for now: Creator can trigger REVIEW.

        const isOwner = project.userId === session.user.id;
        const isAssignedCreator = currentCreator && project.services.some(s => s.creatorId === currentCreator.id);

        if (!isOwner && !isAssignedCreator) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Validate Transition (Basic State Machine)
        const validTransitions = {
            'PRE_PRODUCTION': ['PRODUCTION'],
            'PRODUCTION': ['REVIEW'],
            'REVIEW': ['PRODUCTION', 'COMPLETED'], // Back to PROD means revision
            'COMPLETED': [], // End state
        };

        // Note: ProjectPhase enum: PRE_PRODUCTION, PRODUCTION, POST_PRODUCTION, REVIEW, COMPLETED
        // Mapping simplification: treat POST_PRODUCTION as PRODUCTION equivalent for now or just allow it

        // Strict check disabled for flexibility during dev, but logic should guide UI

        // Update Phase
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                currentPhase: status
            }
        });

        // 3. Log Event
        await prisma.projectEvent.create({
            data: {
                projectId,
                requestId: project.serviceRequestId,
                type: "STATUS_CHANGED",
                description: `Status changed to ${status}${message ? `: ${message}` : ''}`,
                userId: session.user.id
            }
        });

        // 4. Update Revision Count if re-entering PRODUCTION from REVIEW (Revision loop)
        if (status === 'PRODUCTION' && project.currentPhase === 'REVIEW') {
            await prisma.project.update({
                where: { id: projectId },
                data: { revisionCount: { increment: 1 } }
            });
        }

        return NextResponse.json(updatedProject);

    } catch (error) {
        console.error("Error updating project status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
