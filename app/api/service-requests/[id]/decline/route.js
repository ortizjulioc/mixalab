import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

/**
 * POST /api/service-requests/:id/decline
 * Decline a service request (creator only)
 */
export async function POST(request, { params }) {
    try {
        // Get authenticated user
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const { id } = params;

        // Verify user is a creator
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId }
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: 'Only creators can decline service requests' },
                { status: 403 }
            );
        }

        // Find service request
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id }
        });

        if (!serviceRequest) {
            return NextResponse.json(
                { error: 'Service request not found' },
                { status: 404 }
            );
        }

        // If this creator was assigned, remove the assignment
        if (serviceRequest.creatorId === creatorProfile.id) {
            await prisma.serviceRequest.update({
                where: { id },
                data: {
                    creator: {
                        disconnect: true
                    },
                    status: 'PENDING'
                }
            });
        }

        return NextResponse.json({
            message: 'Request declined successfully'
        });

    } catch (error) {
        console.error('Error declining service request:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
