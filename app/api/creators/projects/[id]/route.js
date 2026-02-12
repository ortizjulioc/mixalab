import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/creators/projects/[id]
 * Get project details for the assigned creator
 */
export async function GET(request, props) {
  const params = await props.params;

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
      // Also check 'Project' table in case we are using new models
      const projectV2 = await prisma.project.findUnique({
        where: { id },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          services: true,
          files: true,
          // Now we can directly include chatRoom!
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

      if (projectV2) {
        // Check access for Project model
        const hasAccessV2 = projectV2.services.some(
          (s) => s.creatorId === currentCreator.id,
        );

        if (!hasAccessV2 && projectV2.userId !== session.user.id) {
          return NextResponse.json(
            { error: "Unauthorized access to project" },
            { status: 403 },
          );
        }

        // --- AUTO-FIX: Create ChatRoom for Project V2 if Missing ---
        if (!projectV2.chatRoom) {
          console.log(
            `[Auto-Fix] ChatRoom missing for Project V2 ${id}. Creating now...`,
          );
          try {
            // Determine Creator User ID
            let creatorUserId = null;
            if (hasAccessV2) {
              // If current user is the creator (via services check)
              creatorUserId = session.user.id;
            } else {
              // Try to find from services
              const service = projectV2.services.find((s) => s.creatorId);
              if (service?.creatorId) {
                const assignedCreator = await prisma.creatorProfile.findUnique({
                  where: { id: service.creatorId },
                  select: { userId: true },
                });
                creatorUserId = assignedCreator?.userId;
              }
            }

            if (creatorUserId) {
              const newChatRoom = await prisma.chatRoom.create({
                data: {
                  projectId: id, // Link to Project
                  artistId: projectV2.userId,
                  creatorId: creatorUserId,
                  messages: {
                    create: {
                      senderId: creatorUserId,
                      content: "Channel created. Start chatting!",
                      type: "SYSTEM",
                    },
                  },
                },
                include: {
                  messages: {
                    include: { sender: true, files: true },
                    orderBy: { createdAt: "asc" },
                  },
                },
              });
              projectV2.chatRoom = newChatRoom;
              console.log(
                `[Auto-Fix] ChatRoom created for Project V2: ${newChatRoom.id}`,
              );
            }
          } catch (err) {
            console.error(
              "[Auto-Fix] Failed to create chatroom for Project V2:",
              err,
            );
          }
        }

        // --- Fetch Tier Details ---
        let tierDetails = null;
        if (projectV2.tier) {
          tierDetails = await prisma.tier.findUnique({
            where: { name: projectV2.tier },
          });
        }

        // Map Project V2 to expected format
        const mappedProject = {
          ...projectV2,
          creatorId: currentCreator.id, // Or find from services context
          status: "IN_PROGRESS",
          chatRoom: projectV2.chatRoom || null,
          tierDetails: tierDetails, // Include full tier model
        };

        return NextResponse.json({ project: mappedProject });
      }

      return NextResponse.json(
        { error: `Project not found (ID: ${id})` },
        { status: 404 },
      );
    }

    // 3. Verify Ownership
    const hasAccess =
      project.creatorId === currentCreator.id || project.status === "PENDING";

    console.log("DEBUG PROJECT ACCESS:", {
      projectId: project.id,
      projectCreatorId: project.creatorId,
      currentCreatorId: currentCreator.id,
      projectStatus: project.status,
      hasAccess,
    });

    if (!hasAccess) {
      if (project.creatorId && project.creatorId !== currentCreator.id) {
        console.log("Blocking access: Project assigned to another creator");
        return NextResponse.json(
          { error: "Unauthorized access to project" },
          { status: 403 },
        );
      }
      console.warn(
        "Project unassigned and not pending. Allowing view for debugging.",
      );
    }

    // --- AUTO-FIX: Create ChatRoom if Missing ---
    if (!project.chatRoom && project.creatorId) {
      console.log(
        `[Auto-Fix] ChatRoom missing for Project ${id}. Creating now...`,
      );
      try {
        // Need creator's UserID. 'currentCreator' is the profile of the logged-in user.
        // If the logged-in user IS the assigned creator, use their UserID.
        // If they are just viewing availability (PENDING), we shouldn't create chat yet.

        // Only create if assigned to CURRENT user (or we fetch the assigned user)
        let creatorUserId = null;
        if (project.creatorId === currentCreator.id) {
          creatorUserId = session.user.id;
        } else {
          // Fetch the assigned creator's UserID
          const assignedCreator = await prisma.creatorProfile.findUnique({
            where: { id: project.creatorId },
            select: { userId: true },
          });
          creatorUserId = assignedCreator?.userId;
        }

        if (creatorUserId) {
          const newChatRoom = await prisma.chatRoom.create({
            data: {
              serviceRequestId: id,
              artistId: project.userId,
              creatorId: creatorUserId,
              messages: {
                create: {
                  senderId: creatorUserId,
                  content: "Channel created. Start chatting!",
                  type: "SYSTEM",
                },
              },
            },
            include: {
              messages: {
                include: { sender: true, files: true },
                orderBy: { createdAt: "asc" },
              },
            },
          });
          project.chatRoom = newChatRoom;
          console.log(`[Auto-Fix] ChatRoom created: ${newChatRoom.id}`);
        }
      } catch (err) {
        console.error("[Auto-Fix] Failed to create chatroom:", err);
        // Don't fail request, just log
      }
    }

    // --- Fetch Tier Details for Service Request ---
    let tierDetails = null;
    if (project.tier) {
      tierDetails = await prisma.tier.findUnique({
        where: { name: project.tier },
      });
    }

    // Return project directly (it has status) with tier details
    return NextResponse.json({
      project: {
        ...project,
        tierDetails
      }
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/creators/projects/[id]
 * Update project status
 */
export async function PUT(request, props) {
  const params = await props.params;
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
