import prisma from "@/utils/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

/**
 * PATCH /api/messages/read
 * Mark messages in a chat room as read
 */
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatRoomId } = await request.json();

    if (!chatRoomId) {
      return NextResponse.json(
        { error: "Missing chatRoomId" },
        { status: 400 },
      );
    }

    // Update messages: set isRead = true for all messages in this room
    // that were NOT sent by the current user and are currently unread.
    const updateResult = await prisma.message.updateMany({
      where: {
        chatRoomId,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    if (updateResult.count > 0) {
      // Emit socket event to notify others (e.g. the sender) that messages were read
      if (global.io) {
        global.io.to(chatRoomId).emit("messages-read", {
          readerId: session.user.id,
          count: updateResult.count,
        });
      }
    }

    return NextResponse.json({
      message: "Messages marked as read",
      count: updateResult.count,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
