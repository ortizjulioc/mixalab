'use client';

import { useState, useCallback } from 'react';
import { openNotification } from '@/utils/open-notification';

export default function useArtistProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getArtistProjectsByUserId = useCallback(async (userId) => {
        if (!userId) return;
        setLoading(true);
        setError(null);

        try {
            // New endpoint to fetch all projects for the artist
            const res = await fetch(`/api/artists/projects?userId=${userId}`);
            if (!res.ok) throw new Error('Failed to load projects');

            const data = await res.json();
            setProjects(data.projects || []);
        } catch (err) {
            console.error('Error fetching artist projects:', err);
            setError(err.message);
            // Don't show notification on initial load if just empty
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        projects,
        loading,
        error,
        getArtistProjectsByUserId
    };
}
