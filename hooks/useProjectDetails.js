import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Custom hook to fetch project details for both Artists and Creators.
 * It automatically determines the endpoint based on the user's role found in the session, 
 * or can be overridden by passing a role.
 * 
 * @param {string} projectId - The ID of the project to fetch.
 * @param {string} [roleOverride] - Optional. Force 'ARTIST' or 'CREATOR' role.
 * @returns {Object} { project, loading, error, refreshProject }
 */
export default function useProjectDetails(projectId, roleOverride = null) {
    const { data: session } = useSession();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProject = useCallback(async () => {
        if (!projectId) return;
        if (!session?.user) return;

        setLoading(true);
        setError(null);

        try {
            // Determine role to use
            const userRole = roleOverride || session.user.role; // Expecting 'ARTIST' or 'CREATOR'

            let endpoint = '';

            if (userRole === 'ARTIST') {
                endpoint = `/api/artists/projects/${projectId}`;
            } else if (userRole === 'CREATOR') {
                endpoint = `/api/creators/projects/${projectId}`;
            } else {
                // Fallback: try artist endpoint or default behavior? 
                // Mostly likely logic based on where they are. 
                // Defaulting to artist if role is unclear or assuming the path implies the role in page
                endpoint = `/api/artists/projects/${projectId}`;
            }

            const res = await fetch(endpoint);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to fetch project details');
            }

            if (data.project) {
                setProject(data.project);
            } else {
                setProject(null);
                throw new Error('Project not found in response');
            }

        } catch (err) {
            console.error('Error in useProjectDetails:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [projectId, session, roleOverride]);

    useEffect(() => {
        if (projectId && session) {
            fetchProject();
        } else if (!projectId) {
            setLoading(false);
        }
    }, [fetchProject, projectId, session]);

    return {
        project,
        loading,
        error,
        refreshProject: fetchProject
    };
}
