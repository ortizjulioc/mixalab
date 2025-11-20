'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { debounce } from './useDebounce';
import { useCallback, useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { openNotification } from '../utils/open-notification';
import { fetchClient } from '../utils/fetchClient';

export default function useUpgradeRequirements() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const [filters, setFilters] = useState({
    page: Number(searchParams.get('page')) || 1,
    search: searchParams.get('search') || '',
   
  });

  const [pagination, setPagination] = useState({ total: 0, currentPage: 1, limit: 10, totalPages: 1 });

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
        const res = await fetchClient({ method: 'GET', endpoint: '/upgrade-requirements', params: filters });
        setItems(res.items || res.upgradeRequirements || res.data || []);
        setPagination(res.pagination || {});
        setError(null);
        return res;
      } catch (err) {
        console.error('Error fetching upgrade requirements:', err);
        setError('Error loading upgrade requirements');
        openNotification('error', err.message || 'Error loading upgrade requirements');
        return err;
      } finally {
        setLoading(false);
      }
    }, 500);
  }
  const debouncedFetch = debouncedFetchRef.current;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    debouncedFetch(filters);
  }, [filters, debouncedFetch]);

  const createItem = async (data) => {
    try {
      await fetchClient({ method: 'POST', endpoint: '/upgrade-requirements', data });
      fetchItems();
      openNotification('success', 'UpgradeRequirements created successfully');
      return true;
    } catch (err) {
      console.error('Error creating upgrade requirements:', err);
      openNotification('error', err.message || 'Error creating upgrade requirements');
      return err;
    }
  };

  const updateItem = async (id, data) => {
    try {
      await fetchClient({ method: 'PUT', endpoint: `/upgrade-requirements/${id}`, data });
      fetchItems();
      openNotification('success', 'UpgradeRequirements updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating upgrade requirements:', err);
      openNotification('error', err.message || 'Error updating upgrade requirements');
      return err;
    }
  };

  const deleteItem = async (id) => {
    const result = await Swal.fire({ icon: 'warning', title: 'Are you sure?', text: "You won't be able to revert this!", showCancelButton: true, confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel', allowOutsideClick: false, padding: '2em', background: 'transparent' });
    if (result.isConfirmed) {
      try {
        await fetchClient({ method: 'DELETE', endpoint: `/upgrade-requirements/${id}` });
        fetchItems();
        openNotification('success', 'UpgradeRequirements deleted successfully');
        return true;
      } catch (err) {
        console.error('Error deleting upgrade requirements:', err);
        openNotification('error', err.message || 'Error deleting upgrade requirements');
        return err;
      }
    }
  };

  const getById = useCallback(async (id) => {
    try {
      const res = await fetchClient({ method: 'GET', endpoint: `/upgrade-requirements/${id}` });
      setItem(res);
      return res;
    } catch (err) {
      console.error('Error fetching upgrade requirement:', err);
      openNotification('error', err.message || 'Error loading upgrade requirement');
    }
  }, []);

  return { handleChangeFilter, filters, items, pagination, loading, error, item, fetchItems, createItem, updateItem, deleteItem, getById };
}
