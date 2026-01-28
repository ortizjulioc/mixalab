'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchClient } from '../utils/fetchClient';
import { useSession } from 'next-auth/react';

export default function useNotifications() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = useCallback(async (options = {}) => {
        if (!session) return;

        // Don't set loading for background polls
        if (!options.background) setLoading(true);

        try {
            const pageToFetch = options.page || 1;
            const res = await fetchClient({
                method: 'GET',
                endpoint: '/notifications',
                params: {
                    page: pageToFetch.toString(),
                    limit: '10'
                }
            });

            if (pageToFetch === 1) {
                setNotifications(res.notifications);
            } else {
                setNotifications(prev => [...prev, ...res.notifications]);
            }

            setUnreadCount(res.unreadCount);
            setHasMore(pageToFetch < res.pagination.pages);
            setPage(pageToFetch);

        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            if (!options.background) setLoading(false);
        }
    }, [session]);

    const markAsRead = async (id) => {
        try {
            await fetchClient({
                method: 'PATCH',
                endpoint: `/notifications/${id}/read`
            });

            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));

        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetchClient({
                method: 'PATCH',
                endpoint: '/notifications/mark-all-read'
            });

            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);

        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (session) {
            fetchNotifications();
        }
    }, [session, fetchNotifications]);

    // Polling every 60 seconds
    useEffect(() => {
        if (!session) return;

        const interval = setInterval(() => {
            fetchNotifications({ background: true, page: 1 });
        }, 60000);

        return () => clearInterval(interval);
    }, [session, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        hasMore,
        fetchNotifications,
        loadMore: () => fetchNotifications({ page: page + 1 }),
        markAsRead,
        markAllAsRead
    };
}
