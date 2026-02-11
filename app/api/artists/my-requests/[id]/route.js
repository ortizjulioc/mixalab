import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * GET /api/artists/my-requests/[id]
 * Fetch detailed information for a specific service request
 */
export async function GET(request, props) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const serviceRequest = await prisma.serviceRequest.findUnique({
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        genres: {
          include: {
            genre: true,
          },
        },
        files: {
          select: {
            id: true,
            name: true,
            url: true,
            mimeType: true,
            extension: true,
            size: true,
            createdAt: true,
          },
        },
        events: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
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
      },
    });

    if (!serviceRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify ownership
    if (serviceRequest.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ request: serviceRequest }, { status: 200 });
  } catch (error) {
    console.error("Error fetching request details:", error);
    return NextResponse.json(
      { error: "Error fetching request details" },
      { status: 500 },
    );
  }
}
