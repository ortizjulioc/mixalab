import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

/**
 * GET /api/service-requests/[id]/match
 * Find and assign a matching creator for a service request
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

        // Get the service request
        const serviceRequest = await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                genres: {
                    include: {
                        genre: true
                    }
                }
            }
        });

        if (!serviceRequest) {
            return NextResponse.json(
                { error: 'Service request not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (serviceRequest.userId !== session.user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Find matching creators based on:
        // 1. Service type (mixing, mastering, recording)
        // 2. Tier availability
        // 3. Genre match
        // 4. Availability status
        // 5. Rating and performance

        const genreIds = serviceRequest.genres.map(g => g.genreId);

        // Build the query to find matching creators
        const matchingCreators = await prisma.creatorProfile.findMany({
            where: {
                status: 'APPROVED',
                deleted: false,
                // Match tier
                CreatorTier: {
                    some: {
                        active: true,
                        tier: {
                            name: serviceRequest.tier
                        }
                    }
                },
                // Match genres
                ...(genreIds.length > 0 && {
                    genders: {
                        some: {
                            genreId: {
                                in: genreIds
                            }
                        }
                    }
                }),
                // Match service type
                ...(serviceRequest.services === 'MIXING' && {
                    mixing: {
                        isNot: null
                    }
                }),
                ...(serviceRequest.services === 'MASTERING' && {
                    masteringEngineerProfile: {
                        isNot: null
                    }
                }),
                ...(serviceRequest.services === 'RECORDING' && {
                    instrumentalist: {
                        isNot: null
                    }
                })
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                mixing: true,
                masteringEngineerProfile: true,
                instrumentalist: true,
                CreatorTier: {
                    where: {
                        active: true
                    },
                    include: {
                        tier: true
                    }
                }
            },
            take: 10 // Get top 10 matches
        });

        if (matchingCreators.length === 0) {
            // No creators available
            return NextResponse.json({
                matched: false,
                creator: null,
                message: 'No creators available at this time'
            });
        }

        // Select the best match (for now, just pick the first one)
        // TODO: Implement more sophisticated matching algorithm
        const selectedCreator = matchingCreators[0];

        // Update the service request with the matched creator
        await prisma.serviceRequest.update({
            where: { id },
            data: {
                creator: {
                    connect: { id: selectedCreator.id }
                },
                status: 'IN_REVIEW'
            }
        });

        // Return the matched creator
        return NextResponse.json({
            matched: true,
            creator: {
                id: selectedCreator.id,
                brandName: selectedCreator.brandName,
                country: selectedCreator.country,
                yearsOfExperience: selectedCreator.yearsOfExperience,
                availability: selectedCreator.availability,
                tier: selectedCreator.CreatorTier[0]?.tier?.name,
                rating: 4.9, // TODO: Calculate from actual reviews
                projectsCompleted: 150, // TODO: Get from actual data
                specialization: 'Hybrid Analog', // TODO: Get from profile
                user: selectedCreator.user
            }
        });

    } catch (error) {
        console.error('Error matching creator:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
