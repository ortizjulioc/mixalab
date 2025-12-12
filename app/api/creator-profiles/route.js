import prisma from '@/utils/lib/prisma';
import { uploadFile } from '@/utils/upload';
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
    // 1. Procesar la solicitud multipart/form-data con request.formData()
    let formData;
    try {
        // Next.js handles the stream and parses multipart/form-data into a FormData object
        formData = await request.formData();
    } catch (error) {
        console.error("Error al leer form data:", error);
        return NextResponse.json({ message: "Error al procesar los datos de la solicitud" }, { status: 500 });
    }

    // 2. Extraer y parsear datos JSON y archivos
    let profileData, mixingData, masteringData, instrumentalistData;

    try {
        // Los datos complejos se envían como strings JSON desde el frontend
        profileData = parseJSON(formData.get('profileData') || "{}");
        mixingData = parseJSON(formData.get('mixingData') || "{}");
        masteringData = parseJSON(formData.get('masteringData') || "{}");
        instrumentalistData = parseJSON(formData.get('instrumentalistData') || "{}");
    } catch (error) {
        return NextResponse.json({ message: "Formato de datos JSON inválido en profileData, mixingData, masteringData o instrumentalistData" }, { status: 400 });
    }

    console.log('profileData', profileData);
    console.log('mixingData', mixingData);
    console.log('masteringData', masteringData);
    console.log('instrumentalistData', instrumentalistData);

    // Datos cruciales para la subida de archivos
    const { userId } = profileData;

    if (!userId) {
        return NextResponse.json({ message: "Faltan datos de usuario (userId)." }, { status: 400 });
    }

    // 3. Función para subir y registrar archivos
    const fileUploadPromises = [];

    // Mapeo de archivos y sus campos en DB
    const fileFieldsMap = {
        // Mixing Engineer Files
        uploadExampleTunedVocals: "mixingData",
        uploadBeforeMix: "mixingData",
        uploadAfterMix: "mixingData",
        // Mastering Engineer Files
        uploadBeforeMaster: "masteringData",
        uploadAfterMaster: "masteringData",
        // Instrumentalist Files
        uploadExampleFile: "instrumentalistData",
    };

    // 3.1. Iterar sobre las claves de archivo esperadas y crear las promesas de subida
    for (const fileKey of Object.keys(fileFieldsMap)) {
        // formData.get() returns the first matching value, which is a File object if uploaded.
        const fileObject = formData.get(fileKey);

        // Check if the item is a valid file object (instanceof File and has content)
        if (fileObject instanceof File && fileObject.size > 0) {
            // Usamos el nombre de la KEY del archivo (ej: 'uploadBeforeMix') como nombre de proyecto temporal
            const project = fileKey;

            // uploadFile must be able to handle the Web API File object (which supports methods like .stream() or .arrayBuffer())
            fileUploadPromises.push(
                uploadFile(fileObject, userId, project).then(metadata => ({
                    fileKey,
                    metadata,
                }))
            );
        }
    }

    let uploadedFileMetadata = {};
    try {
        const results = await Promise.all(fileUploadPromises);
        results.forEach(({ fileKey, metadata }) => {
            uploadedFileMetadata[fileKey] = metadata;
        });
    } catch (error) {
        console.error("Error durante la subida de archivos:", error);
        return NextResponse.json({ message: "Error al subir archivos: " + error.message }, { status: 500 });
    }

    // 4. Iniciar la Transacción de Prisma
    try {
        const transactionResult = await prisma.$transaction(async (tx) => {
            // 4.1. Registrar archivos en la tabla File
            const fileRecords = {};
            for (const [fileKey, metadata] of Object.entries(uploadedFileMetadata)) {
                // Ensure the file data is properly sanitized/validated before creation
                const fileRecord = await tx.file.create({
                    data: {
                        // Assuming metadata contains necessary fields like fileName, mimeType, size, url, etc.
                        ...metadata,
                        userId: userId,
                        serviceRequestId: null,
                    },
                });
                fileRecords[fileKey] = fileRecord;
            }

            // 4.2. Crear CreatorProfile
            // Extraemos los datos del CreatorProfile
            const {
                genders: creatorGenders,
                CreatorTier: creatorTiers,
                ...creatorData
            } = profileData;

            // Aseguramos que los campos JSON sean arrays o parseados correctamente (Prisma lo maneja si son JSON nativo)
            const pluginChains = Array.isArray(creatorData.pluginChains)
                ? creatorData.pluginChains
                : JSON.parse(creatorData.pluginChains || "[]");

            const socials = Array.isArray(creatorData.socials)
                ? creatorData.socials
                : JSON.parse(creatorData.socials || "[]");

            const newCreatorProfile = await tx.creatorProfile.create({
                data: {
                    ...creatorData,
                    userId: userId,
                    pluginChains: pluginChains,
                    socials: socials,
                    // Las demás relaciones se crearán a continuación
                },
            });
            const creatorId = newCreatorProfile.id;

            // 4.3. Crear relaciones CreatorGenre
            if (Array.isArray(creatorGenders) && creatorGenders.length > 0) {
                await tx.creatorGenre.createMany({
                    data: creatorGenders.map(genreId => ({
                        creatorId: creatorId,
                        genreId: genreId,
                    })),
                });
            }

            // 4.4. Crear CreatorTier (asumiendo que creatorTiers es un array de tierIds)
            if (Array.isArray(creatorTiers) && creatorTiers.length > 0) {
                await tx.creatorTier.createMany({
                    data: creatorTiers.map(tierId => ({
                        creatorId: creatorId,
                        tierId: tierId,
                    }))
                });
            }


            // 4.5. Crear perfiles de rol (Mixing, Mastering, Instrumentalist) si existen
            const results = {
                creatorProfile: newCreatorProfile,
                mixing: null,
                mastering: null,
                instrumentalist: null,
            };

            // A) Mixing Engineer Profile
            if (Object.keys(mixingData).length > 0) {
                const { mixingGenres: genres, ...data } = mixingData;

                // IDs de archivos subidos
                const uploadExampleTunedVocalsId = fileRecords.uploadExampleTunedVocals?.id;
                const uploadBeforeMixId = fileRecords.uploadBeforeMix?.id;
                const uploadAfterMixId = fileRecords.uploadAfterMix?.id;

                const newMixingProfile = await tx.mixingEngineerProfile.create({
                    data: {
                        ...data,
                        creatorId: creatorId,
                        uploadExampleTunedVocalsId: uploadExampleTunedVocalsId,
                        uploadBeforeMixId: uploadBeforeMixId,
                        uploadAfterMixId: uploadAfterMixId,
                    },
                });
                results.mixing = newMixingProfile;

                if (Array.isArray(genres) && genres.length > 0) {
                    await tx.mixingGenre.createMany({
                        data: genres.map(genreId => ({
                            mixingId: newMixingProfile.id,
                            genreId: genreId,
                        })),
                    });
                }
            }

            // B) Mastering Engineer Profile
            if (Object.keys(masteringData).length > 0) {
                const { masteringGenres: genres, ...data } = masteringData;

                // IDs de archivos subidos
                const uploadBeforeMasterId = fileRecords.uploadBeforeMaster?.id;
                const uploadAfterMasterId = fileRecords.uploadAfterMaster?.id;

                const newMasteringProfile = await tx.masteringEngineerProfile.create({
                    data: {
                        ...data,
                        creatorId: creatorId,
                        uploadBeforeMasterId: uploadBeforeMasterId,
                        uploadAfterMasterId: uploadAfterMasterId,
                    },
                });
                results.mastering = newMasteringProfile;

                if (Array.isArray(genres) && genres.length > 0) {
                    await tx.masteringGenre.createMany({
                        data: genres.map(genreId => ({
                            masteringId: newMasteringProfile.id,
                            genreId: genreId,
                        })),
                    });
                }
            }

            // C) Instrumentalist Profile
            if (Object.keys(instrumentalistData).length > 0) {
                const { instrumentalistGenres: genres, ...data } = instrumentalistData;

                // ID del archivo subido
                const uploadExampleFileId = fileRecords.uploadExampleFile?.id;

                const instruments = Array.isArray(data.instruments)
                    ? data.instruments
                    : JSON.parse(data.instruments || "[]");

                const newInstrumentalistProfile = await tx.instrumentalistProfile.create({
                    data: {
                        ...data,
                        creatorId: creatorId,
                        instruments: instruments, // Guardar como JSON
                        uploadExampleFileId: uploadExampleFileId,
                    },
                });
                results.instrumentalist = newInstrumentalistProfile;

                if (Array.isArray(genres) && genres.length > 0) {
                    await tx.instrumentalistGenre.createMany({
                        data: genres.map(genreId => ({
                            instrumentalistId: newInstrumentalistProfile.id,
                            genreId: genreId,
                        })),
                    });
                }
            }

            return results;
        });

        return NextResponse.json({
            message: "Perfiles de creador y archivos guardados exitosamente.",
            data: transactionResult,
        }, { status: 200 });
    } catch (error) {
        console.error("Error en la transacción de Prisma:", error);
        return NextResponse.json({
            message: "Error interno del servidor al guardar los perfiles.",
            error: error.message,
        }, { status: 500 });
    }
}
