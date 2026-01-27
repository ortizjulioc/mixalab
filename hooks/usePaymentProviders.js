'use client';

import { useCallback, useState } from 'react';
import { openNotification } from '../utils/open-notification';
import { fetchClient } from '../utils/fetchClient';

export default function usePaymentProviders() {
    const [providers, setProviders] = useState([]);
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProviders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchClient({ method: 'GET', endpoint: '/payment-providers' });
            setProviders(res.providers || res.data || res || []);
            setError(null);
            return res;
        } catch (err) {
            console.error('Error fetching payment providers:', err);
            setError('Error loading payment providers');
            openNotification('error', err.message || 'Error loading payment providers');
            return err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProviderById = useCallback(async (id) => {
        try {
            const res = await fetchClient({ method: 'GET', endpoint: `/payment-providers/${id}` });
            setProvider(res);
            return res;
        } catch (err) {
            console.error('Error fetching payment provider:', err);
            openNotification('error', err.message || 'Error loading payment provider');
            throw err;
        }
    }, []);

    const updateProvider = async (id, data) => {
        try {
            await fetchClient({ method: 'PUT', endpoint: `/payment-providers/${id}`, data });
            fetchProviders();
            openNotification('success', 'Payment provider updated successfully');
            return true;
        } catch (err) {
            console.error('Error updating payment provider:', err);
            openNotification('error', err.message || 'Error updating payment provider');
            return err;
        }
    };

    const createProvider = async (data) => {
        try {
            await fetchClient({ method: 'POST', endpoint: '/payment-providers', data });
            fetchProviders();
            openNotification('success', 'Payment provider created successfully');
            return true;
        } catch (err) {
            console.error('Error creating payment provider:', err);
            openNotification('error', err.message || 'Error creating payment provider');
            throw err;
        }
    };

    return {
        providers,
        provider,
        loading,
        error,
        fetchProviders,
        fetchProviderById,
        updateProvider,
        createProvider,
    };
}
