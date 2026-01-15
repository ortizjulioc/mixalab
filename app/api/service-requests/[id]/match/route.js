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

        // Filter out creators who are currently busy with other projects
        const availableCreators = [];

        for (const creator of matchingCreators) {
            // Check if creator has any active projects (IN_REVIEW, AWAITING_PAYMENT, or IN_PROGRESS)
            // EXCLUDING the current request being matched
            const activeProjects = await prisma.serviceRequest.count({
                where: {
                    creatorId: creator.id,
                    status: {
                        in: ['IN_REVIEW', 'AWAITING_PAYMENT', 'IN_PROGRESS']
                    },
                    // Exclude the current request
                    id: {
                        not: id
                    }
                }
            });

            // If creator has no OTHER active projects, they're available
            if (activeProjects === 0) {
                availableCreators.push(creator);
            }
        }

        if (availableCreators.length === 0) {
            return NextResponse.json({
                matched: false,
                creator: null,
                message: 'All matching creators are currently busy. Please try again later.'
            });
        }

        // Select the best available creator (for now, just pick the first one)
        // TODO: Implement more sophisticated matching algorithm (rating, completion rate, etc.)
        const selectedCreator = availableCreators[0];

        // Assign the creator to the request with IN_REVIEW status
        // Creator will need to accept/decline from their dashboard
        await prisma.serviceRequest.update({
            where: { id },
            data: {
                creator: {
                    connect: { id: selectedCreator.id }
                },
                status: 'IN_REVIEW'
            }
        });

        // Return the matched creator with real data
        return NextResponse.json({
            matched: true,
            creator: {
                id: selectedCreator.id,
                brandName: selectedCreator.brandName,
                country: selectedCreator.country,
                yearsOfExperience: selectedCreator.yearsOfExperience,
                availability: selectedCreator.availability,
                bio: selectedCreator.bio,
                tier: selectedCreator.CreatorTier[0]?.tier?.name,
                // Get specialization from mixing/mastering/instrumentalist profiles
                specialization: selectedCreator.mixing?.specialization ||
                    selectedCreator.masteringEngineerProfile?.specialization ||
                    selectedCreator.instrumentalist?.specialization ||
                    'Audio Engineer',
                // TODO: Calculate from actual reviews when review system is implemented
                rating: 4.9,
                // TODO: Get from actual completed projects
                projectsCompleted: 150,
                // TODO: Calculate from actual project data
                onTimePercentage: 98,
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
