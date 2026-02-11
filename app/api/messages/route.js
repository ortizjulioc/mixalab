import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * POST /api/messages
 * Send a message
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatRoomId, content } = await request.json();

    if (!chatRoomId || !content) {
      return NextResponse.json(
        { error: "Missing required fields: chatRoomId, content" },
        { status: 400 },
      );
    }

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: "Chat room not found" },
        { status: 404 },
      );
    }

    // Access check using direct participant fields
    const isParticipant =
      chatRoom.artistId === session.user.id ||
      chatRoom.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isParticipant && !isAdmin) {
      return NextResponse.json(
        { error: "You are not a participant of this chat" },
        { status: 403 },
      );
    }

    // Create Message
    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          chatRoomId,
          senderId: session.user.id,
          content,
          type: "TEXT", // Default type
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          files: true,
        },
      });

      // Update chat room timestamp
      await tx.chatRoom.update({
        where: { id: chatRoomId },
        data: { updatedAt: new Date() },
      });

      return msg;
    });

    // Emit Socket Event
    if (global.io) {
      global.io.to(chatRoomId).emit("receive-message", message);
      console.log(`Emitted receive-message to room ${chatRoomId}`);
    } else {
      console.warn("Socket.io instance not found in global.io");
    }

    return NextResponse.json(
      {
        message: "Message sent successfully",
        data: message,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 },
    );
  }
}

/**
 * GET /api/messages
 * Get messages for a chat room
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const chatRoomId = searchParams.get("chatRoomId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!chatRoomId) {
      return NextResponse.json(
        { error: "Missing chatRoomId" },
        { status: 400 },
      );
    }

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: "Chat room not found" },
        { status: 404 },
      );
    }

    // Access check using direct participant fields
    const isParticipant =
      chatRoom.artistId === session.user.id ||
      chatRoom.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isParticipant && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get total messages
    const total = await prisma.message.count({
      where: { chatRoomId },
    });

    // Get messages (reverse chronological usually for chat, but let's default to DESC so newest first)
    // Client usually reverses this or deals with it.
    const messages = await prisma.message.findMany({
      where: { chatRoomId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: messages,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 },
    );
  }
}
