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

    // ===== CAMPOS REQUERIDOS =====
    formData.append('userId', userId);
    formData.append('brandName', values.stageName || '');
    formData.append('availability', values.availability || '');
    formData.append('yearsOfExperience', values.yearsExperience || '0');

    // ===== CAMPOS OPCIONALES DE TEXTO =====
    if (values.country) formData.append('country', values.country);
    if (values.portfolioLink) formData.append('portfolio', values.portfolioLink);
    if (values.stageName) formData.append('stageName', values.stageName);

    // ===== CAMPOS JSON (arrays y objetos) =====
    // Convertir a JSON string antes de agregar a FormData
    if (values.mainDAWs && values.mainDAWs.length > 0) {
        formData.append('mainDawProject', JSON.stringify(values.mainDAWs));
    }

    if (values.pluginChains && values.pluginChains.length > 0) {
        formData.append('pluginChains', JSON.stringify(values.pluginChains));
    }

    if (values.generalGenres && values.generalGenres.length > 0) {
        formData.append('generalGenres', JSON.stringify(values.generalGenres));
    }

    if (values.socialLinks && values.socialLinks.length > 0) {
        formData.append('socialLinks', JSON.stringify(values.socialLinks));
    }

    // ===== ROLES =====
    // Determinar el rol principal (el primero seleccionado)
    const selectedRoles = [];
    if (values.roles.mixing) selectedRoles.push('MIXING');
    if (values.roles.mastering) selectedRoles.push('MASTERING');
    if (values.roles.recording) selectedRoles.push('RECORDING');

    if (selectedRoles.length > 0) {
        formData.append('roles', selectedRoles[0]); // El schema solo acepta un rol
    }

    // ===== DATOS ESPECÍFICOS DE MIXING =====
    if (values.roles.mixing) {
        if (values.yearsMixing) formData.append('mixing', JSON.stringify({
            years: values.yearsMixing,
            turnaround: values.mixingTurnaround,
            genres: values.mixingGenresList,
            notableArtists: values.notableArtists,
            tunesVocals: values.tunedVocalExampleNeeded,
        }));
    }

    // ===== DATOS ESPECÍFICOS DE MASTERING =====
    if (values.roles.mastering) {
        if (values.yearsMastering) formData.append('mastering', JSON.stringify({
            years: values.yearsMastering,
            turnaround: values.masteringTurnaround,
            genres: values.masteringGenresList,
            loudnessRange: values.loudnessRange,
        }));
    }

    // ===== DATOS ESPECÍFICOS DE RECORDING =====
    if (values.roles.recording) {
        if (values.yearsRecording) formData.append('recording', JSON.stringify({
            years: values.yearsRecording,
            instruments: values.instrumentsPlayed,
            genres: values.recordingGenresList,
            studioSetup: values.studioSetup,
        }));
    }

    // ===== ARCHIVOS =====
    // Agregar archivos si existen
    if (files.mixExampleFile) {
        formData.append('mixExample', files.mixExampleFile);
    }

    if (files.masterExampleFile) {
        formData.append('masterExample', files.masterExampleFile);
    }

    if (files.performanceExampleFile) {
        formData.append('performanceExample', files.performanceExampleFile);
    }

    if (files.tunedVocalsExampleFile) {
        formData.append('tunedVocalsExample', files.tunedVocalsExampleFile);
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
            // NO incluir Content-Type header, el browser lo configura automáticamente con boundary
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error creating creator profile');
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
