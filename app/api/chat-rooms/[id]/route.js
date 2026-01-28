import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * GET /api/chat-rooms/[id]
 * Get a specific chat room by ID
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        serviceRequest: {
          select: {
            id: true,
            projectName: true,
            status: true,
            userId: true, // Artist User ID
            creator: {
                select: {
                    id: true,
                    userId: true, // Creator User ID
                    brandName: true
                }
            }
          }
        }
      }
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }

    // Access Control
    const isArtist = chatRoom.serviceRequest.userId === session.user.id;
    const isCreator = chatRoom.serviceRequest.creator?.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isArtist && !isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ data: chatRoom });

  } catch (error) {
    console.error('Error fetching chat room:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat-rooms/[id]
 * Delete a chat room (Admin only or maybe owner?)
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const chatRoom = await prisma.chatRoom.findUnique({
      where: { id },
      include: {
        serviceRequest: {
             include: {
                 creator: true
             }
        }
      }
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }

    // Only Admin can delete? Or maybe users involved?
    // Let's restrict to Admin for now to be safe, or if the user is the owner of the project.
    const isAdmin = session.user.role === 'ADMIN';
    // const isOwner = chatRoom.serviceRequest.userId === session.user.id; 

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized to delete chat room' },
        { status: 403 }
      );
    }

    await prisma.chatRoom.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Chat room deleted successfully' });

  } catch (error) {
    console.error('Error deleting chat room:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
