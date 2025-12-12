// utils/submit-creator-profile.js
/**
 * Helper para enviar el formulario de Creator Profile con archivos
 */

/**
 * Convierte los valores del formulario Formik a FormData para enviar al API
 * @param {Object} values - Valores del formulario Formik
 * @param {Object} files - Objeto con los archivos seleccionados { mixExampleFile: File, ... }
 * @param {string} userId - ID del usuario
 * @returns {FormData}
 */
export function createCreatorProfileFormData(values, files, userId) {
    const formData = new FormData();

    // 1. Preparar objetos de datos
    // Perfil Principal
    const profileData = {
        userId: userId,
        brandName: values.stageName,
        country: values.country,
        yearsOfExperience: parseInt(values.yearsExperience) || 0,
        availability: values.availability,
        portfolio: values.portfolioLink,
        mainDaw: values.mainDAWs?.[0]?.label || values.mainDAWs?.[0]?.value || values.mainDAWs?.[0],
        pluginChains: values.pluginChains?.map(p => p.label || p.value || p) || [],
        gearList: (values.pluginChains?.map(p => p.label || p.value || p) || [])[0] || "",
        socials: values.socialLinks || [],
        genders: values.generalGenres || [], // Array de IDs
        // CreatorTier se maneja en backend o por defecto
    };

    // Datos Mixing
    const mixingData = values.roles.mixing ? {
        yearsMixing: parseInt(values.yearsMixing) || 0,
        averageTurnaroundTimeDays: parseInt(values.mixingTurnaround) || 0,
        mixingGenres: values.mixingGenresList || [],
        notableArtists: values.notableArtists,
        doYouTuneVocals: values.tunedVocalExampleNeeded,
    } : {};

    // Datos Mastering
    const masteringData = values.roles.mastering ? {
        yearsMastering: parseInt(values.yearsMastering) || 0,
        averageTurnaroundTimeDays: parseInt(values.masteringTurnaround) || 0,
        masteringGenres: values.masteringGenresList || [],
        preferredLoudnessRange: values.loudnessRange,
    } : {};

    // Datos Instrumentalist (Recording)
    const instrumentalistData = values.roles.recording ? {
        yearsRecordingOrPlaying: parseInt(values.yearsRecording) || 0, // Ajustado nombre de campo
        instruments: values.instrumentsPlayed?.map(i => i.label || i.value || i) || [],
        instrumentalistGenres: values.recordingGenresList || [],
        studioSetupDescription: values.studioSetup, // Ajustado nombre de campo
    } : {};

    // 2. Agregar JSON strings al FormData
    formData.append('profileData', JSON.stringify(profileData));
    formData.append('mixingData', JSON.stringify(mixingData));
    formData.append('masteringData', JSON.stringify(masteringData));
    formData.append('instrumentalistData', JSON.stringify(instrumentalistData));

    // 3. Agregar Archivos con las claves esperadas por el endpoint
    if (files.tunedVocalsExampleFile) {
        formData.append('uploadExampleTunedVocals', files.tunedVocalsExampleFile);
    }

    // Mapeo de archivos de mezcla
    if (files.mixExampleFile) {
        formData.append('uploadAfterMix', files.mixExampleFile);
    }

    // Mapeo de archivos de mastering
    if (files.masterExampleFile) {
        formData.append('uploadAfterMaster', files.masterExampleFile);
    }

    // Mapeo de archivo de instrumentista
    if (files.performanceExampleFile) {
        formData.append('uploadExampleFile', files.performanceExampleFile);
    }

    return formData;
}

/**
 * Envía el formulario de Creator Profile al API
 * @param {FormData} formData - FormData con todos los campos y archivos
 * @returns {Promise<Object>} - Respuesta del API
 */
export async function submitCreatorProfile(formData) {
    try {
        const response = await fetch('/api/creator-profiles', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.error || 'Error creating creator profile');
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Error submitting creator profile:', error);
        throw error;
    }
}

/**
 * Valida que los archivos requeridos estén presentes según los roles seleccionados
 * @param {Object} roles - Objeto con roles { mixing: boolean, mastering: boolean, recording: boolean }
 * @param {Object} files - Objeto con archivos { mixExampleFile: File, ... }
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateRequiredFiles(roles, files) {
    const errors = [];

    if (roles.mixing && !files.mixExampleFile) {
        errors.push('Mix example file is required for Mixing Engineer role');
    }

    if (roles.mastering && !files.masterExampleFile) {
        errors.push('Master example file is required for Mastering Engineer role');
    }

    if (roles.recording && !files.performanceExampleFile) {
        errors.push('Performance example file is required for Recording Session role');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
