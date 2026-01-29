import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

/**
 * POST /api/chat-rooms
 * Create a new chat room for a service request
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { serviceRequestId } = body;

    if (!serviceRequestId) {
      return NextResponse.json(
        { error: 'Missing required field: serviceRequestId' },
        { status: 400 }
      );
    }

    // Check if ServiceRequest exists and has a creator assigned
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        creator: true // To verify creator existence
      }
    });

    if (!serviceRequest) {
      return NextResponse.json(
        { error: 'Service Request not found' },
        { status: 404 }
      );
    }

    if (!serviceRequest.creatorId) {
      return NextResponse.json(
        { error: 'Service Request does not have an assigned creator yet' },
        { status: 400 }
      );
    }

    // Check if user is authorized (must be the artist or the creator)
    const isArtist = serviceRequest.userId === session.user.id;
    // Creator check: session user ID must match the user ID of the creator profile
    // We already fetched 'creator' relation which is the CreatorProfile
    const isCreator = serviceRequest.creator?.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isArtist && !isCreator && !isAdmin) {
      return NextResponse.json(
        { error: 'You are not authorized to create a chat for this request' },
        { status: 403 }
      );
    }

    // Check if chat room already exists
    const existingChat = await prisma.chatRoom.findUnique({
      where: { serviceRequestId: serviceRequestId }
    });

    if (existingChat) {
      return NextResponse.json({
        message: 'Chat room already exists',
        data: existingChat
      }, { status: 200 });
    }

    // Create Chat Room
    const chatRoom = await prisma.chatRoom.create({
      data: {
        serviceRequestId: serviceRequest.id,
        artistId: serviceRequest.userId,
        creatorId: serviceRequest.creatorId,
      }
    });

    return NextResponse.json({
      message: 'Chat room created successfully',
      data: chatRoom
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating chat room:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat-rooms
 * Get chat rooms for the current user
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const serviceRequestId = searchParams.get('serviceRequestId');

    // If serviceRequestId is provided, return that specific chat room (if authorized)
    if (serviceRequestId) {
      const chatRoom = await prisma.chatRoom.findUnique({
        where: { serviceRequestId },
        include: {
          serviceRequest: {
            select: {
              projectName: true,
              projectType: true,
              userId: true, // Artist User ID
              creator: {
                select: {
                  userId: true, // Creator User ID
                  brandName: true
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1, // Get last message
          }
        }
      });

      if (!chatRoom) {
        return NextResponse.json({ data: null }, { status: 404 });
      }

      // Authorization check
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
    }

    // List all chat rooms for the user
    // We need to find chats where the user is either the artist or the creator
    // artistId in ChatRoom is strict User ID.
    // creatorId in ChatRoom is strict CreatorProfile ID.
    
    // First, find if the user has a creator profile
    const userCreatorProfile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id }
    });

    const whereClause = {
      OR: [
        { artistId: session.user.id }, // User is the artist
        ...(userCreatorProfile ? [{ creatorId: userCreatorProfile.id }] : []) // User is the creator
      ]
    };

    const chatRooms = await prisma.chatRoom.findMany({
      where: whereClause,
      include: {
        serviceRequest: {
          select: {
            id: true,
            projectName: true,
            artistName: true,
            tier: true,
            user: {
                select: {
                    name: true,
                    image: true
                }
            },
            creator: {
                select: {
                    brandName: true,
                    user: {
                        select: {
                            image: true
                        }
                    }
                }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
            select: {
                 messages: {
                     where: {
                         isRead: false,
                         senderId: { not: session.user.id }
                     }
                 }
            }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      data: chatRooms
    });

  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
