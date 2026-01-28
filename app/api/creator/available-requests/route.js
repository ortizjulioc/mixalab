import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

/**
 * GET /api/creator/available-requests
 * Get service requests available for the logged-in creator
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
        const filter = searchParams.get('filter') || 'AVAILABLE';

        // Get creator profile
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                CreatorTier: {
                    where: { active: true },
                    include: { tier: true }
                },
                genders: true,
                mixing: true,
                masteringEngineerProfile: true,
                instrumentalist: true
            }
        });

        if (!creatorProfile) {
            return NextResponse.json(
                { error: 'Creator profile not found' },
                { status: 404 }
            );
        }

        // Check if creator has tiers assigned
        const creatorTiers = creatorProfile.CreatorTier.map(ct => ct.tier.name);

        let whereClause = {};

        if (filter === 'AVAILABLE') {
            if (creatorTiers.length === 0) {
                return NextResponse.json({ requests: [], total: 0 });
            }

            // Show requests that match creator's tier and don't have a creator assigned
            whereClause = {
                creatorId: null,
                status: 'PENDING',
                tier: {
                    in: creatorTiers
                }
            };
        } else if (filter === 'ACCEPTED') {
            // Show requests accepted by this creator (exclude PENDING which are rejected/unassigned)
            whereClause = {
                creatorId: creatorProfile.id,
                status: {
                    not: 'PENDING' // Exclude rejected requests that went back to PENDING
                }
            };
        } else if (filter === 'ALL') {
            // Show all requests matching tier (both available and accepted by this creator)
            const orConditions = [
                { creatorId: creatorProfile.id }
            ];

            // Only add available requests if creator has tiers
            if (creatorTiers.length > 0) {
                orConditions.push({
                    creatorId: null,
                    status: 'PENDING',
                    tier: { in: creatorTiers }
                });
            }

            whereClause = {
                OR: orConditions
            };
        }

        // Get service requests
        const requests = await prisma.serviceRequest.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                genres: {
                    include: {
                        genre: true
                    }
                },
                files: true,
                creator: {
                    select: {
                        id: true,
                        brandName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('=== DEBUG INFO ===');
        console.log('Creator:', creatorProfile.brandName);
        console.log('Creator Tiers:', creatorTiers);
        console.log('Filter:', filter);
        console.log('Where Clause:', JSON.stringify(whereClause, null, 2));
        console.log('Requests found:', requests.length);
        console.log('Requests:', requests.map(r => ({
            id: r.id,
            projectName: r.projectName,
            tier: r.tier,
            creatorId: r.creatorId,
            status: r.status
        })));
        console.log('==================');

        return NextResponse.json({
            requests,
            total: requests.length
        });

    } catch (error) {
        console.error('Error fetching available requests:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
