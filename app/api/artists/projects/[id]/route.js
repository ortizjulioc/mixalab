import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/artists/projects/[id]
 * Get project details for the artist (owner)
 */
export async function GET(request, props) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Fetch Project from the new Project model
    const project = await prisma.project.findUnique({
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
        services: true,
        files: true,
        // Include serviceRequest to get the linked chatRoom (Legacy)
        serviceRequest: {
          include: {
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
        },
        // Include direct chatRoom (New Project Model)
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

    // Verify ownership
    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to project" },
        { status: 403 },
      );
    }

    // Normalize chatRoom: distinct preference for Project-linked chat, fallback to ServiceRequest-linked
    if (!project.chatRoom && project.serviceRequest?.chatRoom) {
      project.chatRoom = project.serviceRequest.chatRoom;
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/artists/projects/[id]
 * Update project details (e.g. status code approvals)
 */
export async function PUT(request, props) {
  const params = await props.params;
  // Implement updates if needed (e.g. approving a file)
  return NextResponse.json({ message: "Not implemented" });
}
