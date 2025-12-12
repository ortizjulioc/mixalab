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

const AVAILABILITIES = ['FULL_TIME', 'PART_TIME', 'ON_DEMAND'];
const CREATOR_ROLES = ['MIXING', 'MASTERING', 'RECORDING'];

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        const item = await prisma.creatorProfile.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, email: true, name: true } },
                genders: {
                    include: {
                        genre: true
                    }
                },
                CreatorTier: {
                    where: { active: true },
                    include: {
                        tier: true
                    }
                },
                mixing: {
                    include: {
                        uploadExampleTunedVocals: true,
                        uploadBeforeMix: true,
                        uploadAfterMix: true,
                    }
                },
                masteringEngineerProfile: {
                    include: {
                        uploadBeforeMaster: true,
                        uploadAfterMaster: true,
                    }
                },
                instrumentalist: {
                    include: {
                        uploadExampleFile: true,
                    }
                },
            },
        });

        if (!item) return NextResponse.json({ error: 'CreatorProfile not found' }, { status: 404 });

        return NextResponse.json(item);
    } catch (error) {
        console.error('CreatorProfile GET by id Error:', error);
        return NextResponse.json({ error: 'Error fetching creator profile' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();

        const update = {};

        if (body.userId !== undefined) {
            if (typeof body.userId !== 'string') return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
            update.userId = body.userId;
        }

        if (body.brandName !== undefined) {
            if (typeof body.brandName !== 'string' || body.brandName.trim().length === 0) return NextResponse.json({ error: 'brandName must be a non-empty string' }, { status: 400 });
            update.brandName = body.brandName;
        }

        if (body.yearsOfExperience !== undefined) {
            const v = Number(body.yearsOfExperience);
            if (!Number.isInteger(v) || v < 0) return NextResponse.json({ error: 'yearsOfExperience must be a non-negative integer' }, { status: 400 });
            update.yearsOfExperience = v;
        }

        if (body.availability !== undefined) {
            if (!AVAILABILITIES.includes(body.availability)) return NextResponse.json({ error: `availability must be one of ${AVAILABILITIES.join(', ')}` }, { status: 400 });
            update.availability = body.availability;
        }

        if (body.country !== undefined) update.country = body.country === null ? null : String(body.country);
        if (body.portfolio !== undefined) update.portfolio = body.portfolio === null ? null : String(body.portfolio);
        if (body.mainDaw !== undefined) update.mainDaw = body.mainDaw === null ? null : String(body.mainDaw);
        if (body.gearList !== undefined) update.gearList = body.gearList === null ? null : String(body.gearList);

        if (body.socials !== undefined) {
            const s = parseJSON(body.socials);
            if (s === undefined && body.socials !== null) return NextResponse.json({ error: 'socials must be a valid JSON object or null' }, { status: 400 });
            update.socials = s ?? null;
        }

        // New optional fields
        if (body.stageName !== undefined) update.stageName = body.stageName === null ? null : String(body.stageName);
        if (body.mainDawProject !== undefined) {
            const v = parseJSON(body.mainDawProject);
            if (v === undefined && body.mainDawProject !== null) return NextResponse.json({ error: 'mainDawProject must be valid JSON or null' }, { status: 400 });
            update.mainDawProject = v ?? null;
        }
        if (body.pluginChains !== undefined) {
            const v = parseJSON(body.pluginChains);
            if (v === undefined && body.pluginChains !== null) return NextResponse.json({ error: 'pluginChains must be valid JSON or null' }, { status: 400 });
            update.pluginChains = v ?? null;
        }
        if (body.generalGenres !== undefined) {
            const v = parseJSON(body.generalGenres);
            if (v === undefined && body.generalGenres !== null) return NextResponse.json({ error: 'generalGenres must be valid JSON or null' }, { status: 400 });
            update.generalGenres = v ?? null;
        }
        if (body.socialLinks !== undefined) {
            const v = parseJSON(body.socialLinks);
            if (v === undefined && body.socialLinks !== null) return NextResponse.json({ error: 'socialLinks must be valid JSON or null' }, { status: 400 });
            update.socialLinks = v ?? null;
        }
        if (body.roles !== undefined) {
            if (body.roles === null) {
                update.roles = null;
            } else if (!CREATOR_ROLES.includes(body.roles)) {
                return NextResponse.json({ error: `roles must be one of ${CREATOR_ROLES.join(', ')}` }, { status: 400 });
            } else {
                update.roles = body.roles;
            }
        }
        if (body.mixing !== undefined) update.mixing = body.mixing === null ? null : String(body.mixing);
        if (body.mastering !== undefined) update.mastering = body.mastering === null ? null : String(body.mastering);
        if (body.recording !== undefined) update.recording = body.recording === null ? null : String(body.recording);
        if (body.porfolioLinks !== undefined) {
            const v = parseJSON(body.porfolioLinks);
            if (v === undefined && body.porfolioLinks !== null) return NextResponse.json({ error: 'porfolioLinks must be valid JSON or null' }, { status: 400 });
            update.porfolioLinks = v ?? null;
        }
        if (body.fileExamples !== undefined) {
            const v = parseJSON(body.fileExamples);
            if (v === undefined && body.fileExamples !== null) return NextResponse.json({ error: 'fileExamples must be valid JSON or null' }, { status: 400 });
            update.fileExamples = v ?? null;
        }

        const item = await prisma.creatorProfile.update({
            where: { id },
            data: update,
            include: { user: { select: { id: true, email: true, name: true } } },
        });

        return NextResponse.json(item);
    } catch (error) {
        console.error('CreatorProfile PUT Error:', error);
        if (error.code === 'P2025') return NextResponse.json({ error: 'CreatorProfile not found' }, { status: 404 });
        if (error.code === 'P2003') return NextResponse.json({ error: 'Invalid foreign key' }, { status: 400 });
        if (error.code === 'P2002') return NextResponse.json({ error: 'Unique constraint violation' }, { status: 409 });
        return NextResponse.json({ error: 'Error updating creator profile' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        // Soft delete: set `deleted` to true to preserve relations
        const item = await prisma.creatorProfile.update({
            where: { id },
            data: { deleted: true },
        });

        return NextResponse.json({ message: 'CreatorProfile marked as deleted', id: item.id });
    } catch (error) {
        console.error('CreatorProfile DELETE Error:', error);
        if (error.code === 'P2025') return NextResponse.json({ error: 'CreatorProfile not found' }, { status: 404 });
        return NextResponse.json({ error: 'Error deleting creator profile' }, { status: 500 });
    }
}
