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

/**
 * Handler for updating an existing CreatorProfile, including file uploads and nested role data.
 * @param {Request} request - The incoming Next.js request object.
 */
export async function PUT(request) {
    // 1. Procesar la solicitud multipart/form-data
    let formData;
    try {
        formData = await request.formData();
    } catch (error) {
        console.error("Error al leer form data:", error);
        return NextResponse.json({ message: "Error al procesar los datos de la solicitud" }, { status: 500 });
    }

    // 2. Extraer y parsear datos JSON y archivos
    let profileData, mixingData, masteringData, instrumentalistData;

    try {
        profileData = parseJSON(formData.get('profileData'));
        mixingData = parseJSON(formData.get('mixingData'));
        masteringData = parseJSON(formData.get('masteringData'));
        instrumentalistData = parseJSON(formData.get('instrumentalistData'));
    } catch (error) {
        return NextResponse.json({ message: "Formato de datos JSON inválido" }, { status: 400 });
    }

    // Validación crucial: userId es necesario para identificar el perfil a actualizar
    const { userId } = profileData;

    if (!userId) {
        return NextResponse.json({ message: "Faltan datos de usuario (userId)." }, { status: 400 });
    }

    // 3. Función para subir y registrar archivos (Subimos los archivos nuevos que reemplazan a los viejos)
    const fileUploadPromises = [];
    const fileFieldsMap = {
        uploadExampleTunedVocals: "mixingData",
        uploadBeforeMix: "mixingData",
        uploadAfterMix: "mixingData",
        uploadBeforeMaster: "masteringData",
        uploadAfterMaster: "masteringData",
        uploadExampleFile: "instrumentalistData",
    };

    // 3.1. Iterar sobre las claves de archivo esperadas y crear las promesas de subida
    for (const fileKey of Object.keys(fileFieldsMap)) {
        const fileObject = formData.get(fileKey);

        if (fileObject instanceof File && fileObject.size > 0) {
            const project = fileKey;

            // Se asume que uploadFile gestiona el almacenamiento y devuelve metadatos
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

    // 4. Iniciar la Transacción de Prisma para la actualización
    try {
        const transactionResult = await prisma.$transaction(async (tx) => {
            // 4.0. Encontrar el perfil existente para obtener el creatorId
            const existingCreatorProfile = await tx.creatorProfile.findUnique({
                where: { userId: userId },
                select: { id: true }
            });

            if (!existingCreatorProfile) {
                // Si el perfil no existe, el PUT falla. Se debe usar POST para crear.
                throw new Error("Creator Profile not found for this userId. Cannot perform update.");
            }

            const creatorId = existingCreatorProfile.id;

            // 4.1. Registrar nuevos archivos subidos
            // (Si se sube un archivo nuevo, creamos un registro File nuevo, y luego actualizamos el campo
            // de ID en el perfil de rol correspondiente. El archivo viejo queda huérfano para su posterior limpieza).
            const fileRecords = {};
            for (const [fileKey, metadata] of Object.entries(uploadedFileMetadata)) {
                const fileRecord = await tx.file.create({
                    data: {
                        ...metadata,
                        userId: userId,
                        serviceRequestId: null,
                    },
                });
                fileRecords[fileKey] = fileRecord;
            }

            // --- 4.2. Actualizar CreatorProfile ---
            const {
                genders: creatorGenders,
                CreatorTier: creatorTiers,
                userId: profileUserId, // Excluimos userId para evitar re-asignación
                ...creatorData
            } = profileData;

            // Asegurar que los campos JSON sean arrays o parseados correctamente
            const pluginChains = Array.isArray(creatorData.pluginChains)
                ? creatorData.pluginChains
                : parseJSON(creatorData.pluginChains).plugins || [];

            const socials = Array.isArray(creatorData.socials)
                ? creatorData.socials
                : parseJSON(creatorData.socials).socials || [];


            const updatedCreatorProfile = await tx.creatorProfile.update({
                where: { id: creatorId },
                data: {
                    ...creatorData,
                    pluginChains: pluginChains,
                    socials: socials,
                },
            });

            // --- 4.3. Actualizar relaciones CreatorGenre (Borrar existentes y Crear nuevas) ---
            await tx.creatorGenre.deleteMany({
                where: { creatorId: creatorId }
            });

            if (Array.isArray(creatorGenders) && creatorGenders.length > 0) {
                await tx.creatorGenre.createMany({
                    data: creatorGenders.map(genreId => ({
                        creatorId: creatorId,
                        genreId: genreId,
                    })),
                });
            }

            // --- 4.4. Actualizar CreatorTier (Borrar existentes y Crear nuevas) ---
            await tx.creatorTier.deleteMany({
                where: { creatorId: creatorId }
            });

            if (Array.isArray(creatorTiers) && creatorTiers.length > 0) {
                await tx.creatorTier.createMany({
                    data: creatorTiers.map(tierId => ({
                        creatorId: creatorId,
                        tierId: tierId,
                    }))
                });
            }


            // --- 4.5. Actualizar/Crear perfiles de rol (Upsert Lógico) ---
            const results = {
                creatorProfile: updatedCreatorProfile,
                mixing: null,
                mastering: null,
                instrumentalist: null,
            };

            // A) Mixing Engineer Profile (Upsert)
            if (Object.keys(mixingData).length > 0) {
                const { mixingGenres: genres, ...data } = mixingData;

                const uploadExampleTunedVocalsId = fileRecords.uploadExampleTunedVocals?.id;
                const uploadBeforeMixId = fileRecords.uploadBeforeMix?.id;
                const uploadAfterMixId = fileRecords.uploadAfterMix?.id;

                const existingMixingProfile = await tx.mixingEngineerProfile.findUnique({
                    where: { creatorId: creatorId },
                    select: { id: true }
                });

                let newMixingProfile;
                if (existingMixingProfile) {
                    newMixingProfile = await tx.mixingEngineerProfile.update({
                        where: { id: existingMixingProfile.id },
                        data: {
                            ...data,
                            // Solo actualiza el ID del archivo si se subió uno nuevo en este request
                            ...(uploadExampleTunedVocalsId && { uploadExampleTunedVocalsId }),
                            ...(uploadBeforeMixId && { uploadBeforeMixId }),
                            ...(uploadAfterMixId && { uploadAfterMixId }),
                        },
                    });
                } else {
                    // Si la data viene en el payload pero el perfil no existía, lo creamos
                    newMixingProfile = await tx.mixingEngineerProfile.create({
                        data: {
                            ...data,
                            creatorId: creatorId,
                            uploadExampleTunedVocalsId: uploadExampleTunedVocalsId,
                            uploadBeforeMixId: uploadBeforeMixId,
                            uploadAfterMixId: uploadAfterMixId,
                        },
                    });
                }
                results.mixing = newMixingProfile;

                // Actualizar Mixing Genres (Borrar y Crear)
                await tx.mixingGenre.deleteMany({
                    where: { mixingId: newMixingProfile.id }
                });
                if (Array.isArray(genres) && genres.length > 0) {
                    await tx.mixingGenre.createMany({
                        data: genres.map(genreId => ({
                            mixingId: newMixingProfile.id,
                            genreId: genreId,
                        })),
                    });
                }
            }


            // B) Mastering Engineer Profile (Upsert)
            if (Object.keys(masteringData).length > 0) {
                const { masteringGenres: genres, ...data } = masteringData;

                const uploadBeforeMasterId = fileRecords.uploadBeforeMaster?.id;
                const uploadAfterMasterId = fileRecords.uploadAfterMaster?.id;

                const existingMasteringProfile = await tx.masteringEngineerProfile.findUnique({
                    where: { creatorId: creatorId },
                    select: { id: true }
                });

                let newMasteringProfile;
                if (existingMasteringProfile) {
                    newMasteringProfile = await tx.masteringEngineerProfile.update({
                        where: { id: existingMasteringProfile.id },
                        data: {
                            ...data,
                            ...(uploadBeforeMasterId && { uploadBeforeMasterId }),
                            ...(uploadAfterMasterId && { uploadAfterMasterId }),
                        },
                    });
                } else {
                    newMasteringProfile = await tx.masteringEngineerProfile.create({
                        data: {
                            ...data,
                            creatorId: creatorId,
                            uploadBeforeMasterId: uploadBeforeMasterId,
                            uploadAfterMasterId: uploadAfterMasterId,
                        },
                    });
                }
                results.mastering = newMasteringProfile;

                // Actualizar Mastering Genres (Borrar y Crear)
                await tx.masteringGenre.deleteMany({
                    where: { masteringId: newMasteringProfile.id }
                });
                if (Array.isArray(genres) && genres.length > 0) {
                    await tx.masteringGenre.createMany({
                        data: genres.map(genreId => ({
                            masteringId: newMasteringProfile.id,
                            genreId: genreId,
                        })),
                    });
                }
            }

            // C) Instrumentalist Profile (Upsert)
            if (Object.keys(instrumentalistData).length > 0) {
                const { instrumentalistGenres: genres, ...data } = instrumentalistData;

                const uploadExampleFileId = fileRecords.uploadExampleFile?.id;

                const instruments = Array.isArray(data.instruments)
                    ? data.instruments
                    : parseJSON(data.instruments).instruments || [];

                const existingInstrumentalistProfile = await tx.instrumentalistProfile.findUnique({
                    where: { creatorId: creatorId },
                    select: { id: true }
                });

                let newInstrumentalistProfile;
                if (existingInstrumentalistProfile) {
                    newInstrumentalistProfile = await tx.instrumentalistProfile.update({
                        where: { id: existingInstrumentalistProfile.id },
                        data: {
                            ...data,
                            instruments: instruments, // Guardar como JSON
                            ...(uploadExampleFileId && { uploadExampleFileId }),
                        },
                    });
                } else {
                    newInstrumentalistProfile = await tx.instrumentalistProfile.create({
                        data: {
                            ...data,
                            creatorId: creatorId,
                            instruments: instruments, // Guardar como JSON
                            uploadExampleFileId: uploadExampleFileId,
                        },
                    });
                }
                results.instrumentalist = newInstrumentalistProfile;

                // Actualizar Instrumentalist Genres (Borrar y Crear)
                await tx.instrumentalistGenre.deleteMany({
                    where: { instrumentalistId: newInstrumentalistProfile.id }
                });
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
            message: "Perfiles de creador y archivos actualizados exitosamente.",
            data: transactionResult,
        }, { status: 200 });

    } catch (error) {
        console.error("Error en la transacción de Prisma durante la actualización:", error);
        if (error.message.includes("Creator Profile not found")) {
             return NextResponse.json({ message: error.message }, { status: 404 });
        }
        return NextResponse.json({
            message: "Error interno del servidor al actualizar los perfiles.",
            error: error.message,
        }, { status: 500 });
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
