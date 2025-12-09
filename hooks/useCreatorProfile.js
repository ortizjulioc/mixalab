'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from './useDebounce';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { openNotification } from '../utils/open-notification';
import { fetchClient } from '../utils/fetchClient';

export default function useCreatorProfile() {
    const [creatorProfiles, setCreatorProfiles] = useState([]);
    const [creatorProfile, setCreatorProfile] = useState(null);
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [filters, setFilters] = useState({
        page: Number(searchParams.get('page')) || 1,
        search: searchParams.get('search') || '',
    });

    const [pagination, setPagination] = useState({
        total: 0,
        currentPage: 1,
        limit: 10,
        totalPages: 1,
    });

    const handleChangeFilter = (name, value, updateParams = true) => {
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        if (updateParams) debouncedUpdateParams(newFilters);
    };

    const debouncedUpdateParamsRef = useRef(null);
    if (!debouncedUpdateParamsRef.current) {
        debouncedUpdateParamsRef.current = debounce((newFilters) => {
            const params = new URLSearchParams();
            Object.entries(newFilters).forEach(([key, value]) => {
                if (value !== '' && value !== null && value !== undefined) params.set(key, value.toString());
            });
            router.push(`?${params.toString()}`, { scroll: false });
        }, 500);
    }
    const debouncedUpdateParams = debouncedUpdateParamsRef.current;

    const debouncedFetchRef = useRef(null);
    if (!debouncedFetchRef.current) {
        debouncedFetchRef.current = debounce(async (filters) => {
            try {
                const res = await fetchClient({ method: 'GET', endpoint: '/creator-profiles', params: filters });
                setCreatorProfiles(res.items || res.creatorProfiles || res.data || []);
                setPagination(res.pagination || {});
                setError(null);
                return res;
            } catch (err) {
                console.error('Error fetching creator profiles:', err);
                setError('Error loading creator profiles');
                openNotification('error', err.message || 'Error loading creator profiles');
                return err;
            } finally {
                setLoading(false);
            }
        }, 500);
    }
    const debouncedFetch = debouncedFetchRef.current;

    const fetchCreatorProfiles = useCallback(async () => {
        setLoading(true);
        debouncedFetch(filters);
    }, [filters, debouncedFetch]);

    const createCreatorProfile = async (data) => {
        try {
            await fetchClient({ method: 'POST', endpoint: '/creator-profiles', data });
            fetchCreatorProfiles();
            openNotification('success', 'Creator profile created successfully');
            return true;
        } catch (err) {
            console.error('Error creating creator profile:', err);
            openNotification('error', err.message || 'Error creating creator profile');
            return err;
        }
    };

    const updateCreatorProfile = async (id, data) => {
        try {
            await fetchClient({ method: 'PUT', endpoint: `/creator-profiles/${id}`, data });
            fetchCreatorProfiles();
            openNotification('success', 'Creator profile updated successfully');
            return true;
        } catch (err) {
            console.error('Error updating creator profile:', err);
            openNotification('error', err.message || 'Error updating creator profile');
            return err;
        }
    };

    const deleteCreatorProfile = async (id) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            padding: '2em',
            background: 'transparent',
        });

        if (result.isConfirmed) {
            try {
                await fetchClient({ method: 'DELETE', endpoint: `/creator-profiles/${id}` });
                fetchCreatorProfiles();
                openNotification('success', 'Creator profile deleted successfully');
                return true;
            } catch (err) {
                console.error('Error deleting creator profile:', err);
                openNotification('error', err.message || 'Error deleting creator profile');
                return err;
            }
        }
    };

    const getCreatorProfileById = useCallback(async (id) => {
        try {
            const res = await fetchClient({ method: 'GET', endpoint: `/creator-profiles/${id}` });
            setCreatorProfile(res);
            return res;
        } catch (err) {
            console.error('Error fetching creator profile:', err);
            openNotification('error', err.message || 'Error loading creator profile');
        }
    }, []);

    const getCreatorProfileByUserId = useCallback(async (userId) => {
        try {
            setLoading(true);
            const res = await fetchClient({ method: 'GET', endpoint: `/creator-profiles/user/${userId}` });
            setCreatorProfile(res);
            setError(null);
            return res;
        } catch (err) {
            console.log('Error object:', err);

            // The error structure from fetchClient is: { success: false, error: { code, message } }
            // But the API returns: { error: "Creator profile not found" }
            // So we need to check both err.error.message and err.error
            const errorMessage = err?.error?.message || err?.error || 'Error loading creator profile';
            const isNotFound =
                typeof errorMessage === 'string' &&
                (errorMessage.toLowerCase().includes('not found') ||
                    errorMessage.toLowerCase().includes('404'));

            if (isNotFound) {
                // User doesn't have a profile yet - this is expected, don't show error
                console.log('Profile not found - user needs to create one');
                setError(null);
                setCreatorProfile(null);
            } else {
                // Actual error - show notification
                console.error('Actual error fetching profile:', errorMessage);
                setError(errorMessage);
                openNotification('error', errorMessage);
                setCreatorProfile(null);
            }

            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCreatorProfileStatus = async (id, status) => {
        try {
            await fetchClient({
                method: 'PATCH',
                endpoint: `/creator-profiles/${id}/status`,
                data: { status }
            });
            fetchCreatorProfiles();
            openNotification('success', `Creator profile status updated to ${status}`);
            return true;
        } catch (err) {
            console.error('Error updating creator profile status:', err);
            openNotification('error', err.message || 'Error updating status');
            return err;
        }
    };

    return {
        handleChangeFilter,
        filters,
        creatorProfiles,
        pagination,
        loading,
        error,
        creatorProfile,
        fetchCreatorProfiles,
        createCreatorProfile,
        updateCreatorProfile,
        deleteCreatorProfile,
        getCreatorProfileById,
        getCreatorProfileByUserId,
        updateCreatorProfileStatus,
    };
}
