import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

function parseJSON(value) {
    if (value === undefined) return undefined;
    if (typeof value === 'object') return value;
    try {
        return JSON.parse(value);
    } catch (e) {
        return undefined;
    }
}

/**
 * GET handler to fetch all artist profiles with pagination and filters
 * Query params: page, limit, search, userId
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;

        const search = searchParams.get('search') || undefined; // search stageName
        const userId = searchParams.get('userId') || undefined;

        const where = {
            ...(search && { stageName: { contains: search } }),
            ...(userId && { userId }),
            deleted: false,
        };

        const [items, total] = await Promise.all([
            prisma.artistProfile.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, email: true, name: true } },
                    genres: {
                        include: {
                            genre: true,
                        },
                    },
                },
            }),
            prisma.artistProfile.count({ where }),
        ]);

        return NextResponse.json({
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('GET ArtistProfiles Error:', error);
        return NextResponse.json(
            { error: 'Error fetching artist profiles' },
            { status: 500 }
        );
    }
}

/**
 * POST handler to create a new artist profile
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const { userId, stageName, bio, website, socials, genreIds } = body;

        // Validation
        if (!userId || typeof userId !== 'string') {
            return NextResponse.json({ error: 'Invalid or missing userId' }, { status: 400 });
        }

        if (!stageName || typeof stageName !== 'string' || stageName.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid or missing stageName' }, { status: 400 });
        }

        if (bio && bio.length > 500) {
            return NextResponse.json({ error: 'Bio must be 500 characters or less' }, { status: 400 });
        }

        // Check if user exists
        const userExists = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!userExists) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if artist profile already exists for this user
        const existingProfile = await prisma.artistProfile.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            return NextResponse.json(
                { error: 'Artist profile already exists for this user' },
                { status: 409 }
            );
        }

        // Parse socials if provided
        let parsedSocials = null;
        if (socials) {
            parsedSocials = typeof socials === 'string' ? JSON.parse(socials) : socials;
        }

        // Create artist profile
        const artistProfile = await prisma.artistProfile.create({
            data: {
                userId,
                stageName: stageName.trim(),
                bio: bio?.trim() || null,
                website: website?.trim() || null,
                socials: parsedSocials,
                mixaPoints: 0,
            },
            include: {
                user: { select: { id: true, email: true, name: true } },
                genres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        // Associate genres if provided
        if (Array.isArray(genreIds) && genreIds.length > 0) {
            await Promise.all(
                genreIds.map((genreId) =>
                    prisma.artistGenre.create({
                        data: {
                            artistId: artistProfile.id,
                            genreId,
                        },
                    })
                )
            );

            // Fetch updated profile with genres
            return NextResponse.json(
                await prisma.artistProfile.findUnique({
                    where: { id: artistProfile.id },
                    include: {
                        user: { select: { id: true, email: true, name: true } },
                        genres: {
                            include: {
                                genre: true,
                            },
                        },
                    },
                }),
                { status: 201 }
            );
        }

        return NextResponse.json(artistProfile, { status: 201 });
    } catch (error) {
        console.error('POST ArtistProfile Error:', error);

        // Handle Prisma-specific errors
        if (error.code === 'P2000') {
            return NextResponse.json(
                { error: { message: 'One or more fields exceed the maximum allowed length', code: error.code } },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: { message: 'Error creating artist profile', code: 'INTERNAL_ERROR' } },
            { status: 500 }
        );
    }
}
