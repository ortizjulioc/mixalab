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

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const skip = (page - 1) * limit;

        const search = searchParams.get('search') || undefined; // search brandName
        const availability = searchParams.get('availability') || undefined;
        const role = searchParams.get('role') || undefined;
        const userId = searchParams.get('userId') || undefined;

        const where = {
            ...(search && { brandName: { contains: search } }),
            ...(availability && { availability }),
            ...(role && { roles: role }),
            ...(userId && { userId }),
            deleted: false,
        };

        const [items, total] = await Promise.all([
            prisma.creatorProfile.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, email: true, name: true } } },
            }),
            prisma.creatorProfile.count({ where }),
        ]);

        return NextResponse.json({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        console.error('CreatorProfile GET Error:', error);
        return NextResponse.json({ error: 'Error fetching creator profiles' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type');
        const isFormData = contentType?.includes('multipart/form-data');

        let body;
        let files = {};

        if (isFormData) {
            // Procesar FormData (con archivos)
            const formData = await request.formData();
            body = {};

            // Extraer campos de texto y archivos
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    // Es un archivo
                    files[key] = value;
                } else {
                    // Es un campo de texto
                    body[key] = value;
                }
            }
        } else {
            // Procesar JSON (sin archivos)
            body = await request.json();
        }

        // Validaciones
        if (!body.userId || typeof body.userId !== 'string') {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        if (!body.brandName || typeof body.brandName !== 'string' || body.brandName.trim().length === 0) {
            return NextResponse.json({ error: 'brandName is required' }, { status: 400 });
        }

        const yearsOfExperience = Number(body.yearsOfExperience ?? 0);
        if (!Number.isInteger(yearsOfExperience) || yearsOfExperience < 0) {
            return NextResponse.json({ error: 'yearsOfExperience must be a non-negative integer' }, { status: 400 });
        }

        const availability = body.availability;
        if (!AVAILABILITIES.includes(availability)) {
            return NextResponse.json({ error: `availability must be one of ${AVAILABILITIES.join(', ')}` }, { status: 400 });
        }

        const socials = parseJSON(body.socials);
        const mainDawProject = parseJSON(body.mainDawProject);
        const pluginChains = parseJSON(body.pluginChains);
        const generalGenres = parseJSON(body.generalGenres);
        const socialLinks = parseJSON(body.socialLinks);
        const porfolioLinks = parseJSON(body.porfolioLinks);
        const roles = body.roles ?? null;

        if (roles !== null && !CREATOR_ROLES.includes(roles)) {
            return NextResponse.json({ error: `roles must be one of ${CREATOR_ROLES.join(', ')}` }, { status: 400 });
        }

        const profileData = {
            userId: body.userId,
            brandName: body.brandName,
            country: body.country ?? null,
            portfolio: body.portfolio ?? null,
            socials: socials ?? null,
            yearsOfExperience,
            mainDaw: body.mainDaw ?? null,
            gearList: body.gearList ?? null,
            availability,
            // optional new fields
            stageName: body.stageName ?? null,
            mainDawProject: mainDawProject ?? null,
            pluginChains: pluginChains ?? null,
            generalGenres: generalGenres ?? null,
            socialLinks: socialLinks ?? null,
            roles: roles ?? null,
            mixing: body.mixing ?? null,
            mastering: body.mastering ?? null,
            recording: body.recording ?? null,
            porfolioLinks: porfolioLinks ?? null,
        };

        // Crear perfil con archivos usando el servicio de transacción
        const { createCreatorProfileWithFiles } = await import('@/utils/creator-profile-files');
        const result = await createCreatorProfileWithFiles(profileData, files);

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('CreatorProfile POST Error:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'CreatorProfile for this user already exists' }, { status: 409 });
        }
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
        }
        if (error.message?.includes('Tipo de archivo no permitido')) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error creating creator profile' }, { status: 500 });
    }
}
