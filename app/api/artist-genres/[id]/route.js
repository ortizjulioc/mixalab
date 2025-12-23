import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET handler to fetch a single artist genre by ID
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const artistGenre = await prisma.artistGenre.findUnique({
            where: { id },
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

        if (!artistGenre) {
            return NextResponse.json({ error: 'Artist genre not found' }, { status: 404 });
        }

        return NextResponse.json(artistGenre);
    } catch (error) {
        console.error('GET ArtistGenre by ID Error:', error);
        return NextResponse.json(
            { error: 'Error fetching artist genre' },
            { status: 500 }
        );
    }
}

/**
 * PUT handler to update an artist genre association
 * Note: Since artistId and genreId form a unique pair, updates are limited
 */
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if artist genre exists
        const artistGenre = await prisma.artistGenre.findUnique({
            where: { id },
        });

        if (!artistGenre) {
            return NextResponse.json({ error: 'Artist genre not found' }, { status: 404 });
        }

        // Since artistId_genreId is unique, we can only update createdAt/updatedAt
        // which are auto-managed. For practical purposes, updating a genre association
        // would mean deleting the old one and creating a new one.
        // For now, we return the existing record as updates don't make sense for this model.

        const updatedArtistGenre = await prisma.artistGenre.findUnique({
            where: { id },
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

        return NextResponse.json(updatedArtistGenre);
    } catch (error) {
        console.error('PUT ArtistGenre Error:', error);
        return NextResponse.json(
            { error: 'Error updating artist genre' },
            { status: 500 }
        );
    }
}

/**
 * DELETE handler to remove an artist genre association
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Check if artist genre exists
        const artistGenre = await prisma.artistGenre.findUnique({
            where: { id },
        });

        if (!artistGenre) {
            return NextResponse.json({ error: 'Artist genre not found' }, { status: 404 });
        }

        // Delete the association
        const deletedArtistGenre = await prisma.artistGenre.delete({
            where: { id },
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

        return NextResponse.json(deletedArtistGenre);
    } catch (error) {
        console.error('DELETE ArtistGenre Error:', error);
        return NextResponse.json(
            { error: 'Error deleting artist genre' },
            { status: 500 }
        );
    }
}
