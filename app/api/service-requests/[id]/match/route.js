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

        const { id } = await params;

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

        console.log('----- MATCHING PROCESS START -----');
        console.log('Request ID:', id);
        console.log('Required Tier:', serviceRequest.tier);
        console.log('Service Type:', serviceRequest.services);
        console.log('Genre IDs:', genreIds);

        // Build the query to find matching creators

        // --- DEBUG START: Log ALL creators to see why they don't match ---
        const debugCreators = await prisma.creatorProfile.findMany({
            where: { status: 'APPROVED', deleted: false },
            include: {
                genders: { include: { genre: true } },
                CreatorTier: { include: { tier: true } },
                mixing: true,
                masteringEngineerProfile: true,
                instrumentalist: true
            }
        });
        console.log('--- DEBUG DUMP: ALL APPROVED CREATORS ---');
        debugCreators.forEach(c => {
            console.log(`[${c.brandName}] ID: ${c.id}`);
            console.log(`  - Tiers: ${c.CreatorTier.map(t => t.active ? t.tier.name : t.tier.name + '(Inactive)').join(', ')}`);
            console.log(`  - Genres: ${c.genders.map(g => `${g.genre.name} (${g.genreId})`).join(', ')}`);
            console.log(`  - Services: Mixing:${!!c.mixing} Mastering:${!!c.masteringEngineerProfile} Inst:${!!c.instrumentalist}`);
        });
        console.log('--- END DEBUG DUMP ---');
        // --- DEBUG END ---

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

        console.log(`Found ${matchingCreators.length} potential candidates matching criteria.`);
        matchingCreators.forEach(c => console.log(`- Candidate: ${c.brandName} (ID: ${c.id})`));

        if (matchingCreators.length === 0) {
            console.log('No candidates found matching criteria.');
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

            console.log(`Creator ${creator.brandName}: Active Projects = ${activeProjects}`);

            // RELAXED CONSTRAINT: Allow up to 5 concurrent projects
            // TODO: Make this limit configurable per creator tier or profile settings
            if (activeProjects < 5) {
                // Calculate genre match score
                const creatorGenreIds = creator.genders?.map(cg => cg.genreId) || [];
                const matchCount = genreIds.filter(id => creatorGenreIds.includes(id)).length;

                availableCreators.push({
                    ...creator,
                    matchScore: matchCount
                });

                console.log(`-> ${creator.brandName} is AVAILABLE. (Match Score: ${matchCount}/${genreIds.length})`);
            } else {
                console.log(`-> ${creator.brandName} is BUSY.`);
            }
        }

        if (availableCreators.length === 0) {
            return NextResponse.json({
                matched: false,
                creator: null,
                message: 'All matching creators are currently busy. Please try again later.'
            });
        }

        // Sort by match score descending (Best match first)
        availableCreators.sort((a, b) => b.matchScore - a.matchScore);

        // Select the best available creator
        const selectedCreator = availableCreators[0];
        console.log(`Selected Best Match: ${selectedCreator.brandName} (Score: ${selectedCreator.matchScore})`);

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
