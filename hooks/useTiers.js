'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from './useDebounce';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { openNotification } from '../utils/open-notification';
import { fetchClient } from '../utils/fetchClient';

export default function useTiers() {
  const [tiers, setTiers] = useState([]);
  const [tier, setTier] = useState(null);
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
        const res = await fetchClient({ method: 'GET', endpoint: '/tiers', params: filters });
        setTiers(res.items || res.tiers || res.data || []);
        setPagination(res.pagination || {});
        setError(null);
        return res;
      } catch (err) {
        console.error('Error fetching tiers:', err);
        setError('Error loading tiers');
        openNotification('error', err.message || 'Error loading tiers');
        return err;
      } finally {
        setLoading(false);
      }
    }, 500);
  }
  const debouncedFetch = debouncedFetchRef.current;

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    debouncedFetch(filters);
  }, [filters, debouncedFetch]);

  const createTier = async (data) => {
    try {
      await fetchClient({ method: 'POST', endpoint: '/tiers', data });
      fetchTiers();
      openNotification('success', 'Tier created successfully');
      return true;
    } catch (err) {
      console.error('Error creating tier:', err);
      openNotification('error', err.message || 'Error creating tier');
      return err;
    }
  };

  const updateTier = async (id, data) => {
    try {
      await fetchClient({ method: 'PUT', endpoint: `/tiers/${id}`, data });
      fetchTiers();
      openNotification('success', 'Tier updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating tier:', err);
      openNotification('error', err.message || 'Error updating tier');
      return err;
    }
  };

  const deleteTier = async (id) => {
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
        await fetchClient({ method: 'DELETE', endpoint: `/tiers/${id}` });
        fetchTiers();
        openNotification('success', 'Tier deleted successfully');
        return true;
      } catch (err) {
        console.error('Error deleting tier:', err);
        openNotification('error', err.message || 'Error deleting tier');
        return err;
      }
    }
  };

  const getTierById = useCallback(async (id) => {
    try {
      const res = await fetchClient({ method: 'GET', endpoint: `/tiers/${id}` });
      setTier(res);
      return res;
    } catch (err) {
      console.error('Error fetching tier:', err);
      openNotification('error', err.message || 'Error loading tier');
    }
  }, []);

  return {
    handleChangeFilter,
    filters,
    tiers,
    pagination,
    loading,
    error,
    tier,
    fetchTiers,
    createTier,
    updateTier,
    deleteTier,
    getTierById,
  };
}
