import prisma from '@/utils/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { userId } = await params;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Find creator profile by userId
        const creatorProfile = await prisma.creatorProfile.findUnique({
            where: {
                userId: userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        image: true
                    }
                },
                genders: {
                    include: {
                        genre: true
                    }
                },
                services: {
                    where: { deleted: false },
                    include: {
                        service: true
                    }
                },
                CreatorTier: {
                    where: { active: true },
                    include: {
                        tier: true
                    }
                }
            },
        });

        // Check if profile exists and is not deleted
        if (!creatorProfile || creatorProfile.deleted) {
            return NextResponse.json({ error: 'Creator profile not found' }, { status: 404 });
        }

        return NextResponse.json(creatorProfile);
    } catch (error) {
        console.error('CreatorProfile GET by userId Error:', error);
        return NextResponse.json({ error: 'Error fetching creator profile' }, { status: 500 });
    }
}
