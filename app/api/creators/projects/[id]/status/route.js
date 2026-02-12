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

        const { id: projectId } = await params;
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

        const isOwner = project.userId === session.user.id;
        const isAssignedCreator = currentCreator && project.services.some(s => s.creatorId === currentCreator.id);

        // Permission check: Who can change status?
        // - Creator can move to IN_REVIEW
        // - Artist (Owner) can move to CHANGES_REQUESTED or COMPLETED

        // 3. Strict State Machine & Role Validation
        const allowedTransitions = {
            'IN_PROGRESS': ['IN_REVIEW', 'CANCELLED'],
            'IN_REVIEW': ['CHANGES_REQUESTED', 'COMPLETED'],
            'CHANGES_REQUESTED': ['IN_REVIEW'],
            'COMPLETED': [],
            'CANCELLED': []
        };

        const currentPhase = project.currentPhase;
        const potentialNextPhases = allowedTransitions[currentPhase] || [];

        if (!potentialNextPhases.includes(status)) {
            // Allow admin override or force update if needed, but for now strict
            if (status === currentPhase) {
                return NextResponse.json(project); // No change
            }
            return NextResponse.json({
                error: `Invalid status transition from ${currentPhase} to ${status}`
            }, { status: 400 });
        }

        // Role-based Action Validation
        if (status === 'IN_REVIEW') {
            if (!isAssignedCreator) {
                return NextResponse.json({ error: "Only the assigned creator can submit for review" }, { status: 403 });
            }
        }

        if (status === 'CHANGES_REQUESTED' || status === 'COMPLETED') {
            if (!isOwner) {
                return NextResponse.json({ error: "Only the artist (client) can accept or request changes" }, { status: 403 });
            }
        }

        // 4. Revision Logic
        let updateData = { currentPhase: status };

        if (status === 'CHANGES_REQUESTED') {
            // Check limits
            const limit = project.revisionLimit || project.tierDetails?.numberOfRevisions || 0;

            if (project.revisionCount >= limit) {
                return NextResponse.json({
                    error: "Revision limit reached. You cannot request more changes.",
                    code: "REVISION_LIMIT_REACHED"
                }, { status: 400 });
            }

            // Increment count
            updateData.revisionCount = { increment: 1 };
        }

        // Update Phase
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updateData
        });

        // 5. Log Event
        await prisma.projectEvent.create({
            data: {
                projectId,
                requestId: project.serviceRequestId,
                type: status === 'CHANGES_REQUESTED' ? 'REVISION_REQUESTED' :
                    status === 'COMPLETED' ? 'MILESTONE_COMPLETED' :
                        'STATUS_CHANGED',
                description: `Status changed from ${currentPhase} to ${status}${message ? `: ${message}` : ''}`,
                userId: session.user.id
            }
        });

        return NextResponse.json(updatedProject);

    } catch (error) {
        console.error("Error updating project status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
