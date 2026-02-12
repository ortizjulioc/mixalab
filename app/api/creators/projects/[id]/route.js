import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/creators/projects/[id]
 * Get project details using Project model only
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get creator profile of logged-in user
    const currentCreator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!currentCreator) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 403 }
      );
    }

    // Fetch Project (Single Source of Truth)
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
        files: {
          orderBy: { createdAt: 'desc' }
        },
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
        serviceRequest: {
          include: {
            files: true,
          },
        },
        genres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: `Project not found (ID: ${id})` },
        { status: 404 }
      );
    }

    // Verify access (creator assigned OR project owner)
    const hasAccess =
      project.userId === session.user.id ||
      project.services.some(
        (service) => service.creatorId === currentCreator.id
      );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized access to project" },
        { status: 403 }
      );
    }

    // Auto-create ChatRoom if missing
    if (!project.chatRoom) {
      try {
        const assignedService = project.services.find(
          (s) => s.creatorId
        );

        if (assignedService) {
          const assignedCreator = await prisma.creatorProfile.findUnique({
            where: { id: assignedService.creatorId },
            select: { userId: true },
          });

          if (assignedCreator?.userId) {
            const newChatRoom = await prisma.chatRoom.create({
              data: {
                projectId: id,
                artistId: project.userId,
                creatorId: assignedCreator.userId,
                messages: {
                  create: {
                    senderId: assignedCreator.userId,
                    content: "Channel created. Start chatting!",
                    type: "SYSTEM",
                  },
                },
              },
              include: {
                messages: {
                  orderBy: { createdAt: "asc" },
                  include: {
                    sender: true,
                    files: true,
                  },
                },
              },
            });

            project.chatRoom = newChatRoom;
          }
        }
      } catch (err) {
        console.error("Failed to auto-create chatroom:", err);
      }
    }

    // Optional: fetch tier details
    let tierDetails = null;
    if (project.tier) {
      tierDetails = await prisma.tier.findUnique({
        where: { name: project.tier },
      });
    }

    // 🔥 Normalizar genres (si no existen devolver array vacío)
    const normalizedGenres = Array.isArray(project.genres)
      ? project.genres.map((g) => g.genre.name)
      : [];

    // 🔥 Fetch Add-on details
    let addOnDetails = [];
    if (project.serviceRequest?.addOns && typeof project.serviceRequest.addOns === 'object') {
      const addOnIds = Object.keys(project.serviceRequest.addOns);
      if (addOnIds.length > 0) {
        addOnDetails = await prisma.serviceAddOn.findMany({
          where: {
            id: { in: addOnIds }
          },
          select: {
            id: true,
            name: true,
            description: true,
            price: true
          }
        });
      }
    }

    return NextResponse.json({
      project: {
        ...project,
        genres: normalizedGenres,
        tierDetails,
        addOnDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/creators/projects/[id]
 * Update project technical details
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updateData = await request.json();

    // Get creator profile of logged-in user
    const currentCreator = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!currentCreator) {
      return NextResponse.json(
        { error: "Creator profile not found" },
        { status: 403 }
      );
    }

    // Verify access
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        services: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const hasAccess =
      project.userId === session.user.id ||
      project.services.some(
        (service) => service.creatorId === currentCreator.id
      );

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized access to project" },
        { status: 403 }
      );
    }

    // Filter allowed fields to prevent overwriting critical data
    const allowedFields = [
      'key',
      'bpm',
      'timeSignature',
      'durationSeconds',
      'recordingQuality',
      'stemsIncluded',
      'vocalTracksCount',
      'instrumentalType',
      'notes',
      'internalNotes'
    ];

    const numericFields = ['bpm', 'durationSeconds', 'vocalTracksCount'];

    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        let value = updateData[key];

        // Handle numeric fields
        if (numericFields.includes(key)) {
          if (value === "" || value === null || value === undefined) {
            value = null;
          } else {
            const intVal = parseInt(value, 10);
            value = isNaN(intVal) ? null : intVal;
          }
        }
        // Handle strings/nullables (empty string -> null)
        else if (typeof value === 'string' && value.trim() === "") {
          value = null;
        }

        obj[key] = value;
        return obj;
      }, {});

    // Update
    const updatedProject = await prisma.project.update({
      where: { id },
      data: filteredData
    });

    return NextResponse.json({ project: updatedProject });

  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

