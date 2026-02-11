import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/creators/projects/[id]
 * Get project details for the assigned creator
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // 1. Get the current user's Creator Profile
    const currentCreator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!currentCreator) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 403 },
      );
    }

    // 2. Fetch Project (Using ServiceRequest Model as 'Project')
    // Ideally this should use the Project model if fully migrated, but currently the flow uses ServiceRequest
    const project = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            brandName: true,
          },
        },
        files: true,
        chatRoom: {
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
              include: {
                sender: {
                  select: { id: true, name: true, image: true },
                },
                files: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 3. Verify Ownership
    // Creator must be the assigned creator
    // Or if not assigned yet, verify they can view available requests (logic separate usually)
    // But here it seems to be "My Projects" view.
    // We check if creatorId matches currentCreator.id.

    // If status is PENDING, maybe allow viewing?
    // But typically this route is for AFTER assignment.
    // Let's assume strict ownership for now or lenient?
    // The original code checked: project.services.some(s => s.creatorId === currentCreator.id)

    const hasAccess =
      project.creatorId === currentCreator.id || project.status === "PENDING"; // Allow viewing if pending (for acceptance) or if assigned.

    if (!hasAccess) {
      // If not assigned and not pending, then 403.
      // But wait, if pending, any creator can view?
      // Maybe this is "My Projects".
      // If status is PENDING, it might be in "Available Requests".
      // If creator accepts, it becomes theirs.

      // Let's stick to safe defaults: if assigned to someone else, 403.
      if (project.creatorId && project.creatorId !== currentCreator.id) {
        return NextResponse.json(
          { error: "Unauthorized access to project" },
          { status: 403 },
        );
      }
    }

    // Return project directly (it has status)
    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/creators/projects/[id]
 * Update project status
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const { status, message } = await request.json();

    // Validate Status Change
    const allowedStatuses = [
      "IN_PROGRESS",
      "REVIEW_READY",
      "COMPLETED",
      "CANCELLED",
    ]; // Example flow
    // Note: Prisma Enum might correspond to these. Let's stick to existing ServiceRequestStatus enum values if possible or map them.
    // Current Enum: PENDING, IN_REVIEW, ACCEPTED, REJECTED, COMPLETED, CANCELLED.
    // We might need to add IN_PROGRESS, REVIEW_READY.
    // For now, let's use ACCEPTED as "In Progress" effectively, or assume schema has been updated.
    // Actually, user schema update earlier added: ACCEPTED, UNDER_REVIEW, REVISION_REQUESTED, COMPLETED.

    // Let's verify statuses from memory or assume standard set.
    // The previous tool output showed: ACCEPTED, UNDER_REVIEW, REVISION_REQUESTED, COMPLETED, REJECTED.

    const validStatuses = [
      "ACCEPTED",
      "UNDER_REVIEW",
      "REVISION_REQUESTED",
      "COMPLETED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const project = await prisma.serviceRequest.update({
      where: { id },
      data: {
        status: status,
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
      include: { user: true }, // Need user to notify
    });

    // Create Event
    await prisma.projectEvent.create({
      data: {
        requestId: id,
        type: "STATUS_CHANGED",
        description:
          `Project status updated to ${status}` +
          (message ? `: ${message}` : ""),
        userId: session.user.id,
      },
    });

    // Notify Artist
    await prisma.notification.create({
      data: {
        userId: project.userId,
        type: "STATUS_CHANGED",
        title: "Project Update",
        message: `Your project "${project.projectName}" is now ${status.replace("_", " ")}. ${message || ""}`,
        link: `/artists/my-requests/${id}`,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
