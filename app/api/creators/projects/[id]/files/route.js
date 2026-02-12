import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { uploadFile } from "@/utils/upload";

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: projectId } = await params;

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

        if (!isOwner && !isAssignedCreator) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Process File
        const formData = await request.formData();
        const file = formData.get("file");
        const label = formData.get("label") || "Deliverable"; // E.g., "Mix V1", "Stems"

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Upload to local storage (public/uploads)
        const uploadResult = await uploadFile(file, {
            username: session.user.id,
            project: projectId, // Organize by project ID
        });

        // 3. Create ProjectFile Record
        const projectFile = await prisma.projectFile.create({
            data: {
                projectId,
                fileType: "DEMO", // Defaulting to DEMO (or 'DELIVERABLE' if added to enum), assuming 'DEMO' maps to deliverables for now or add new enum value
                filePath: uploadResult.path, // Relative path
                fileName: uploadResult.name,
                fileSize: uploadResult.size,
                // We might want to store 'label' or 'description' if schema allowed, but for now strict to schema
            }
        });

        // 4. Log Event
        await prisma.projectEvent.create({
            data: {
                projectId, // Note: ProjectEvent needs to be linked to Project. Schema check needed.
                requestId: project.serviceRequestId, // Fallback link to request
                type: "FILE_UPLOADED",
                description: `File uploaded: ${uploadResult.name} (${label})`,
                userId: session.user.id,
                metadata: { fileId: projectFile.id }
            }
        });

        return NextResponse.json(projectFile);

    } catch (error) {
        console.error("Error uploading project file:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
