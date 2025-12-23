import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET handler to fetch all artist genres with pagination and filters
 * Query params: page, limit, artistId, genreId
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;

        const artistId = searchParams.get('artistId') || undefined;
        const genreId = searchParams.get('genreId') || undefined;

        const where = {
            ...(artistId && { artistId }),
            ...(genreId && { genreId }),
        };

        const [items, total] = await Promise.all([
            prisma.artistGenre.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    artist: {
                        select: {
                            id: true,
                            stageName: true,
                            userId: true,
                        },
                    },
                    genre: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.artistGenre.count({ where }),
        ]);

        return NextResponse.json({
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('GET ArtistGenres Error:', error);
        return NextResponse.json(
            { error: 'Error fetching artist genres' },
            { status: 500 }
        );
    }
}

/**
 * POST handler to create a new artist genre association
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const { artistId, genreId } = body;

        // Validation
        if (!artistId || typeof artistId !== 'string') {
            return NextResponse.json({ error: 'Invalid or missing artistId' }, { status: 400 });
        }

        if (!genreId || typeof genreId !== 'string') {
            return NextResponse.json({ error: 'Invalid or missing genreId' }, { status: 400 });
        }

        // Check if artist exists
        const artistExists = await prisma.artistProfile.findUnique({
            where: { id: artistId },
        });

        if (!artistExists) {
            return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
        }

        // Check if genre exists
        const genreExists = await prisma.genre.findUnique({
            where: { id: genreId },
        });

        if (!genreExists) {
            return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
        }

        // Check if association already exists
        const existingAssociation = await prisma.artistGenre.findUnique({
            where: {
                artistId_genreId: {
                    artistId,
                    genreId,
                },
            },
        });

        if (existingAssociation) {
            return NextResponse.json(
                { error: 'This genre is already associated with this artist' },
                { status: 409 }
            );
        }

        // Create artist genre association
        const artistGenre = await prisma.artistGenre.create({
            data: {
                artistId,
                genreId,
            },
            include: {
                artist: {
                    select: {
                        id: true,
                        stageName: true,
                        userId: true,
                    },
                },
                genre: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(artistGenre, { status: 201 });
    } catch (error) {
        console.error('POST ArtistGenre Error:', error);
        return NextResponse.json(
            { error: 'Error creating artist genre association' },
            { status: 500 }
        );
    }
}
