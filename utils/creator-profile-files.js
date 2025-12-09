import prisma from './lib/prisma';
import { uploadFile, deleteFile } from './upload';
import { BadRequestError } from './errors';

/**
 * Tipos de archivos permitidos para creator profiles
 */
const ALLOWED_FILE_TYPES = {
    audio: [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/aiff',
        'audio/x-aiff',
        'audio/flac',
        'audio/ogg',
        'audio/aac',
        'audio/mp4',
        'audio/m4a',
    ],
    video: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
    ],
};

/**
 * Mapeo de campos del formulario a categorías de archivos
 */
const FILE_FIELD_MAPPING = {
    mixExample: { category: 'mix_example', allowedTypes: ALLOWED_FILE_TYPES.audio },
    masterExample: { category: 'master_example', allowedTypes: ALLOWED_FILE_TYPES.audio },
    performanceExample: { category: 'performance_example', allowedTypes: [...ALLOWED_FILE_TYPES.audio, ...ALLOWED_FILE_TYPES.video] },
    tunedVocalsExample: { category: 'tuned_vocals_example', allowedTypes: ALLOWED_FILE_TYPES.audio },
};

/**
 * Valida que el archivo sea del tipo permitido
 */
function validateFileType(file, allowedTypes) {
    if (!allowedTypes.includes(file.type)) {
        throw new BadRequestError(
            `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: ${allowedTypes.join(', ')}`
        );
    }
}

/**
 * Sube múltiples archivos y los registra en la base de datos
 * @param {Object} files - Objeto con los archivos del formulario { mixExample: File, masterExample: File, etc }
 * @param {string} userId - ID del usuario que sube los archivos
 * @param {string} project - Nombre del proyecto/carpeta (ej: 'creator-profile')
 * @returns {Promise<Object>} - Objeto con los IDs de los archivos subidos { mixExample: 'file-id', ... }
 */
export async function uploadCreatorProfileFiles(files, userId, project = 'creator-profile') {
    const uploadedFiles = {};
    const createdFileIds = [];

    try {
        // Procesar cada archivo
        for (const [fieldName, file] of Object.entries(files)) {
            if (!file || !(file instanceof File)) {
                continue; // Saltar si no es un archivo válido
            }

            const mapping = FILE_FIELD_MAPPING[fieldName];
            if (!mapping) {
                console.warn(`Campo de archivo desconocido: ${fieldName}`);
                continue;
            }

            // Validar tipo de archivo
            validateFileType(file, mapping.allowedTypes);

            // Subir archivo al sistema de archivos
            const fileData = await uploadFile(file, {
                username: userId,
                project,
                allowedTypes: mapping.allowedTypes,
            });

            // Guardar metadata en la base de datos
            const fileRecord = await prisma.file.create({
                data: {
                    name: fileData.name,
                    mimeType: fileData.mimeType,
                    extension: fileData.extension,
                    size: fileData.size,
                    path: fileData.path,
                    url: fileData.url,
                    folder: fileData.folder,
                    userId,
                },
            });

            uploadedFiles[fieldName] = {
                fileId: fileRecord.id,
                category: mapping.category,
                url: fileRecord.url,
                name: fileRecord.name,
            };

            createdFileIds.push(fileRecord.id);
        }

        return uploadedFiles;
    } catch (error) {
        // Si hay error, hacer rollback eliminando archivos ya subidos
        console.error('Error uploading creator profile files:', error);

        // Eliminar archivos de la base de datos
        if (createdFileIds.length > 0) {
            try {
                const filesToDelete = await prisma.file.findMany({
                    where: { id: { in: createdFileIds } },
                    select: { url: true },
                });

                // Eliminar archivos del sistema de archivos
                await Promise.all(
                    filesToDelete.map(file => deleteFile(file.url).catch(err => {
                        console.error(`Error deleting file ${file.url}:`, err);
                    }))
                );

                // Eliminar registros de la base de datos
                await prisma.file.deleteMany({
                    where: { id: { in: createdFileIds } },
                });
            } catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
        }

        throw error;
    }
}

/**
 * Crea un creator profile con sus archivos en una transacción
 * @param {Object} profileData - Datos del perfil del creator
 * @param {Object} files - Archivos a subir
 * @returns {Promise<Object>} - Perfil creado con información de archivos
 */
export async function createCreatorProfileWithFiles(profileData, files) {
    let uploadedFiles = null;

    try {
        // 1. Subir archivos primero
        if (files && Object.keys(files).length > 0) {
            uploadedFiles = await uploadCreatorProfileFiles(files, profileData.userId);
        }

        // 2. Crear el perfil con los IDs de archivos en el campo fileExamples
        const profile = await prisma.creatorProfile.create({
            data: {
                ...profileData,
                fileExamples: uploadedFiles || {},
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        return {
            ...profile,
            uploadedFiles,
        };
    } catch (error) {
        // Si falla la creación del perfil, los archivos ya fueron eliminados por uploadCreatorProfileFiles
        // o necesitamos eliminarlos aquí si la creación del perfil falla
        if (uploadedFiles) {
            const fileIds = Object.values(uploadedFiles).map(f => f.fileId);
            try {
                const filesToDelete = await prisma.file.findMany({
                    where: { id: { in: fileIds } },
                    select: { url: true },
                });

                await Promise.all(
                    filesToDelete.map(file => deleteFile(file.url).catch(err => {
                        console.error(`Error deleting file ${file.url}:`, err);
                    }))
                );

                await prisma.file.deleteMany({
                    where: { id: { in: fileIds } },
                });
            } catch (rollbackError) {
                console.error('Error during profile creation rollback:', rollbackError);
            }
        }

        throw error;
    }
}

/**
 * Obtiene los archivos de un creator profile
 * @param {string} profileId - ID del perfil
 * @returns {Promise<Array>} - Array de archivos
 */
export async function getCreatorProfileFiles(profileId) {
    const profile = await prisma.creatorProfile.findUnique({
        where: { id: profileId },
        select: { fileExamples: true },
    });

    if (!profile || !profile.fileExamples) {
        return [];
    }

    const fileIds = Object.values(profile.fileExamples)
        .filter(f => f && f.fileId)
        .map(f => f.fileId);

    if (fileIds.length === 0) {
        return [];
    }

    return await prisma.file.findMany({
        where: { id: { in: fileIds } },
    });
}
