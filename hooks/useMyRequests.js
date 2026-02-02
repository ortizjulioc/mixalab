'use client';

import { useCallback, useState } from 'react';
import { fetchClient } from '../utils/fetchClient';
import { openNotification } from '../utils/open-notification';

export default function useMyRequests() {
    const [requests, setRequests] = useState([]);
    const [currentRequest, setCurrentRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetch all requests for the authenticated artist
     * @param {string} status - Filter by status (optional)
     */
    const fetchMyRequests = useCallback(async (status = 'ALL') => {
        try {
            setLoading(true);
            const params = status !== 'ALL' ? `?status=${status}` : '';
            const res = await fetchClient({
                method: 'GET',
                endpoint: `/artists/my-requests${params}`
            });
            setRequests(res.requests || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching requests:', err);
            setError('Error loading requests');
            openNotification('error', err.message || 'Error loading requests');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Fetch detailed information for a specific request
     * @param {string} id - Request ID
     */
    const fetchRequestById = useCallback(async (id) => {
        try {
            setLoading(true);
            const res = await fetchClient({
                method: 'GET',
                endpoint: `/artists/my-requests/${id}`,
            });
            setCurrentRequest(res.request);
            setError(null);
            return res.request;
        } catch (err) {
            console.error('Error fetching request details:', err);
            setError('Error loading request details');
            openNotification('error', err.message || 'Error loading request details');
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Cancel a request
     * @param {string} id - Request ID
     * @param {string} reason - Cancellation reason
     */
    const cancelRequest = async (id, reason) => {
        try {
            await fetchClient({
                method: 'PUT',
                endpoint: `/artists/my-requests`,
                data: { requestId: id, action: 'CANCEL', reason }
            });
            openNotification('success', 'Request cancelled successfully');
            // Refresh the list
            fetchMyRequests();
            return true;
        } catch (err) {
            console.error('Error cancelling request:', err);
            openNotification('error', err.message || 'Error cancelling request');
            return false;
        }
    };

    /**
     * Get status badge color
     * @param {string} status - Request status
     */
    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            IN_REVIEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            ACCEPTED: 'bg-green-500/20 text-green-400 border-green-500/30',
            AWAITING_PAYMENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            IN_PROGRESS: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            UNDER_REVIEW: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
            REVISION_REQUESTED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            DELIVERED: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
            COMPLETED: 'bg-green-600/20 text-green-300 border-green-600/30',
            CANCELLED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
            REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    };

    /**
     * Get human-readable status label
     * @param {string} status - Request status
     */
    const getStatusLabel = (status) => {
        const labels = {
            PENDING: 'Pending Match',
            IN_REVIEW: 'Under Review',
            ACCEPTED: 'Awaiting Payment', // Changed from "Accepted" - Creator accepted, now artist must pay
            AWAITING_PAYMENT: 'Awaiting Payment',
            PAID: 'Paid',
            IN_PROGRESS: 'In Progress',
            UNDER_REVIEW: 'Under Review',
            REVISION_REQUESTED: 'Revision Requested',
            DELIVERED: 'Delivered',
            COMPLETED: 'Completed',
            CANCELLED: 'Cancelled',
            REJECTED: 'Rejected',
        };
        return labels[status] || status;
    };

    return {
        requests,
        currentRequest,
        loading,
        error,
        fetchMyRequests,
        fetchRequestById,
        cancelRequest,
        getStatusColor,
        getStatusLabel,
    };
}
