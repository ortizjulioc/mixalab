'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from './useDebounce';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { openNotification } from '../utils/open-notification';
import { fetchClient } from '../utils/fetchClient';

export default function useAddOns() {
    const [addOns, setAddOns] = useState([]);
    const [addOn, setAddOn] = useState(null);
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
                const res = await fetchClient({ method: 'GET', endpoint: '/admin/add-ons', params: filters });
                setAddOns(res.items || res.addOns || res.data || []);
                setPagination(res.pagination || {});
                setError(null);
                return res;
            } catch (err) {
                console.error('Error fetching add-ons:', err);
                setError('Error loading add-ons');
                openNotification('error', err.message || 'Error loading add-ons');
                return err;
            } finally {
                setLoading(false);
            }
        }, 500);
    }
    const debouncedFetch = debouncedFetchRef.current;

    const fetchAddOns = useCallback(async () => {
        setLoading(true);
        debouncedFetch(filters);
    }, [filters, debouncedFetch]);

    const createAddOn = async (data) => {
        try {
            await fetchClient({ method: 'POST', endpoint: '/admin/add-ons', data });
            fetchAddOns();
            openNotification('success', 'Add-on created successfully');
            return true;
        } catch (err) {
            console.error('Error creating add-on:', err);
            openNotification('error', err.message || 'Error creating add-on');
            return err;
        }
    };

    const updateAddOn = async (id, data) => {
        try {
            await fetchClient({ method: 'PUT', endpoint: `/admin/add-ons/${id}`, data });
            fetchAddOns();
            openNotification('success', 'Add-on updated successfully');
            return true;
        } catch (err) {
            console.error('Error updating add-on:', err);
            openNotification('error', err.message || 'Error updating add-on');
            return err;
        }
    };

    const deleteAddOn = async (id) => {
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
                await fetchClient({ method: 'DELETE', endpoint: `/admin/add-ons/${id}` });
                fetchAddOns();
                openNotification('success', 'Add-on deleted successfully');
                return true;
            } catch (err) {
                console.error('Error deleting add-on:', err);
                openNotification('error', err.message || 'Error deleting add-on');
                return err;
            }
        }
    };

    const getAddOnById = useCallback(async (id) => {
        try {
            const res = await fetchClient({ method: 'GET', endpoint: `/admin/add-ons/${id}` });
            setAddOn(res);
            return res;
        } catch (err) {
            console.error('Error fetching add-on:', err);
            openNotification('error', err.message || 'Error loading add-on');
        }
    }, []);

    return {
        handleChangeFilter,
        filters,
        addOns,
        pagination,
        loading,
        error,
        addOn,
        fetchAddOns,
        createAddOn,
        updateAddOn,
        deleteAddOn,
        getAddOnById,
        fetchAddOnById: getAddOnById, // Alias for consistency
    };
}
