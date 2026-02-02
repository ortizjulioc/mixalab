'use client';

import { useState, useCallback } from 'react';
import { openNotification } from '@/utils/open-notification';

export default function useCreatorProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getCreatorProjectsByUserId = useCallback(async (userId) => {
        if (!userId) return;
        setLoading(true);
        setError(null);

        try {
            // New endpoint to fetch all projects for the creator
            const res = await fetch(`/api/creators/projects?userId=${userId}`);
            if (!res.ok) throw new Error('Failed to load projects');

            const data = await res.json();
            setProjects(data.projects || []);
        } catch (err) {
            console.error('Error fetching creator projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        projects,
        loading,
        error,
        getCreatorProjectsByUserId
    };
}
