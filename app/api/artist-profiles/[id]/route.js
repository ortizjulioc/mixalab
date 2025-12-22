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
 * GET handler to fetch a single artist profile by ID
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const artistProfile = await prisma.artistProfile.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true, name: true } },
                genres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        if (!artistProfile) {
            return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
        }

        return NextResponse.json(artistProfile);
    } catch (error) {
        console.error('GET ArtistProfile by ID Error:', error);
        return NextResponse.json(
            { error: 'Error fetching artist profile' },
            { status: 500 }
        );
    }
}

/**
 * PUT handler to update an artist profile
 */
export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { stageName, bio, website, socials, mixaPoints, genreIds } = body;

        // Check if artist profile exists
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { id },
        });

        if (!artistProfile) {
            return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
        }

        // Prepare update data
        const updateData = {};

        if (stageName !== undefined) {
            if (typeof stageName !== 'string' || stageName.trim().length === 0) {
                return NextResponse.json({ error: 'Invalid stageName' }, { status: 400 });
            }
            updateData.stageName = stageName.trim();
        }

        if (bio !== undefined) {
            updateData.bio = bio?.trim() || null;
        }

        if (website !== undefined) {
            updateData.website = website?.trim() || null;
        }

        if (socials !== undefined) {
            updateData.socials = typeof socials === 'string' ? JSON.parse(socials) : socials;
        }

        if (mixaPoints !== undefined) {
            if (typeof mixaPoints !== 'number' || mixaPoints < 0) {
                return NextResponse.json({ error: 'Invalid mixaPoints' }, { status: 400 });
            }
            updateData.mixaPoints = mixaPoints;
        }

        // Update artist profile
        const updatedProfile = await prisma.artistProfile.update({
            where: { id },
            data: updateData,
            include: {
                user: { select: { id: true, email: true, name: true } },
                genres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        // Update genres if provided
        if (Array.isArray(genreIds)) {
            // Delete existing genres
            await prisma.artistGenre.deleteMany({
                where: { artistId: id },
            });

            // Create new genres
            if (genreIds.length > 0) {
                await Promise.all(
                    genreIds.map((genreId) =>
                        prisma.artistGenre.create({
                            data: {
                                artistId: id,
                                genreId,
                            },
                        })
                    )
                );
            }

            // Fetch updated profile with new genres
            return NextResponse.json(
                await prisma.artistProfile.findUnique({
                    where: { id },
                    include: {
                        user: { select: { id: true, email: true, name: true } },
                        genres: {
                            include: {
                                genre: true,
                            },
                        },
                    },
                })
            );
        }

        return NextResponse.json(updatedProfile);
    } catch (error) {
        console.error('PUT ArtistProfile Error:', error);
        return NextResponse.json(
            { error: 'Error updating artist profile' },
            { status: 500 }
        );
    }
}

/**
 * DELETE handler to soft delete an artist profile
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Check if artist profile exists
        const artistProfile = await prisma.artistProfile.findUnique({
            where: { id },
        });

        if (!artistProfile) {
            return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
        }

        // Soft delete
        const deletedProfile = await prisma.artistProfile.update({
            where: { id },
            data: { deleted: true },
            include: {
                user: { select: { id: true, email: true, name: true } },
                genres: {
                    include: {
                        genre: true,
                    },
                },
            },
        });

        return NextResponse.json(deletedProfile);
    } catch (error) {
        console.error('DELETE ArtistProfile Error:', error);
        return NextResponse.json(
            { error: 'Error deleting artist profile' },
            { status: 500 }
        );
    }
}
