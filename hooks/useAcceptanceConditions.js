'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from './useDebounce';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { openNotification } from '../utils/open-notification';
import { fetchClient } from '../utils/fetchClient';

export default function useAcceptanceConditions() {
    const [conditions, setConditions] = useState([]);
    const [condition, setCondition] = useState(null);
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [filters, setFilters] = useState({
        page: Number(searchParams.get('page')) || 1,
        search: searchParams.get('search') || '',
        serviceType: searchParams.get('serviceType') || '',
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
                // Use public endpoint if only filtering by serviceType (for artists)
                // Use admin endpoint if using search or pagination (for admin)
                const isPublicRequest = filters.serviceType && !filters.search && filters.page === 1;
                const endpoint = isPublicRequest ? '/acceptance-conditions' : '/admin/acceptance-conditions';

                const res = await fetchClient({ method: 'GET', endpoint, params: filters });

                // Handle both response formats (public returns array, admin returns object with items)
                const items = Array.isArray(res) ? res : (res.items || res.conditions || res.data || []);
                setConditions(items);
                setPagination(res.pagination || {});
                setError(null);
                return res;
            } catch (err) {
                console.error('Error fetching acceptance conditions:', err);
                setError('Error loading acceptance conditions');
                openNotification('error', err.message || 'Error loading acceptance conditions');
                return err;
            } finally {
                setLoading(false);
            }
        }, 500);
    }
    const debouncedFetch = debouncedFetchRef.current;

    const fetchConditions = useCallback(async () => {
        setLoading(true);
        debouncedFetch(filters);
    }, [filters, debouncedFetch]);

    const createCondition = async (data) => {
        try {
            await fetchClient({ method: 'POST', endpoint: '/admin/acceptance-conditions', data });
            fetchConditions();
            openNotification('success', 'Acceptance condition created successfully');
            return true;
        } catch (err) {
            console.error('Error creating acceptance condition:', err);
            openNotification('error', err.message || 'Error creating acceptance condition');
            return err;
        }
    };

    const updateCondition = async (id, data) => {
        try {
            await fetchClient({ method: 'PUT', endpoint: `/admin/acceptance-conditions/${id}`, data });
            fetchConditions();
            openNotification('success', 'Acceptance condition updated successfully');
            return true;
        } catch (err) {
            console.error('Error updating acceptance condition:', err);
            openNotification('error', err.message || 'Error updating acceptance condition');
            return err;
        }
    };

    const deleteCondition = async (id) => {
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
                await fetchClient({ method: 'DELETE', endpoint: `/admin/acceptance-conditions/${id}` });
                fetchConditions();
                openNotification('success', 'Acceptance condition deleted successfully');
                return true;
            } catch (err) {
                console.error('Error deleting acceptance condition:', err);
                openNotification('error', err.message || 'Error deleting acceptance condition');
                return err;
            }
        }
    };

    const getConditionById = useCallback(async (id) => {
        try {
            const res = await fetchClient({ method: 'GET', endpoint: `/admin/acceptance-conditions/${id}` });
            setCondition(res);
            return res;
        } catch (err) {
            console.error('Error fetching acceptance condition:', err);
            openNotification('error', err.message || 'Error loading acceptance condition');
        }
    }, []);

    return {
        handleChangeFilter,
        filters,
        conditions,
        pagination,
        loading,
        error,
        condition,
        fetchConditions,
        createCondition,
        updateCondition,
        deleteCondition,
        getConditionById,
        fetchConditionById: getConditionById, // Alias for consistency
    };
}
