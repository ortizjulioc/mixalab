import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * PATCH /api/messages/[id]
 * Update message status (e.g. mark as read)
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        chatRoom: {
            include: {
                serviceRequest: {
                    include: {
                        creator: true
                    }
                }
            }
        }
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Access check
    const isArtist = message.chatRoom.serviceRequest.userId === session.user.id;
    const isCreator = message.chatRoom.serviceRequest.creator?.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isArtist && !isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update message
    // Allowed updates: isRead
    const updateData = {};
    if (typeof body.isRead === 'boolean') {
      updateData.isRead = body.isRead;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
         { message: 'No valid fields to update' },
         { status: 400 }
      );
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
        message: 'Message updated',
        data: updatedMessage
    });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages/[id]
 * Delete a message
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
  
      const message = await prisma.message.findUnique({
        where: { id },
        include: {
          chatRoom: {
              include: {
                  serviceRequest: {
                      include: {
                          creator: true
                      }
                  }
              }
          }
        }
      });
  
      if (!message) {
        return NextResponse.json(
          { error: 'Message not found' },
          { status: 404 }
        );
      }
  
      // Access check: only sender or admin can delete?
      // Or maybe receiver too? Let's say sender or Admin.
      const isSender = message.senderId === session.user.id;
      const isAdmin = session.user.role === 'ADMIN';
  
      if (!isSender && !isAdmin) {
        return NextResponse.json(
          { error: 'Unauthorized to delete this message' },
          { status: 403 }
        );
      }
  
      await prisma.message.delete({
        where: { id }
      });
  
      return NextResponse.json({ message: 'Message deleted successfully' });
  
    } catch (error) {
      console.error('Error deleting message:', error);
      return NextResponse.json(
        { error: 'Internal server error: ' + error.message },
        { status: 500 }
      );
    }
  }
