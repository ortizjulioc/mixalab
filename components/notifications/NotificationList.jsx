'use client';

import React from 'react';
import useNotifications from '@/hooks/useNotifications';
import { useRouter } from 'next/navigation';
import { Check, Info, FileText, DollarSign, Music, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationIcon = ({ type }) => {
    switch (type) {
        case 'REQUEST_MATCHED':
        case 'REQUEST_ACCEPTED':
            return <CheckCircle className="w-5 h-5 text-green-400" />;
        case 'REQUEST_REJECTED':
            return <AlertCircle className="w-5 h-5 text-red-400" />;
        case 'FILE_UPLOADED':
            return <FileText className="w-5 h-5 text-blue-400" />;
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_COMPLETED':
            return <DollarSign className="w-5 h-5 text-yellow-400" />;
        case 'PROJECT_COMPLETED':
            return <Music className="w-5 h-5 text-purple-400" />;
        case 'STATUS_CHANGED':
        default:
            return <Info className="w-5 h-5 text-gray-400" />;
    }
};

export default function NotificationList({ onClose }) {
    const { notifications, loading, hasMore, loadMore, markAsRead, markAllAsRead } = useNotifications();
    const router = useRouter();

    const handleItemClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
            if (onClose) onClose();
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="p-4 flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400 h-64">
                <BellOffIcon className="w-12 h-12 mb-3 opacity-20" />
                <p>No notifications yet</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col max-h-[450px]">
            {/* Actions Bar */}
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex justify-end">
                <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1 transition-colors"
                >
                    <Check className="w-3 h-3" /> Mark all as read
                </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-2">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        onClick={() => handleItemClick(notification)}
                        className={`
                            relative flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200
                            ${notification.read ? 'bg-transparent opacity-60 hover:opacity-100 hover:bg-white/5' : 'bg-white/10 hover:bg-white/15 border-l-2 border-blue-500'}
                        `}
                    >
                        <div className="flex-shrink-0 mt-1">
                            <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium text-white truncate ${!notification.read && 'font-bold'}`}>
                                {notification.title}
                            </h4>
                            <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                                {notification.message}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                        {!notification.read && (
                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-glow-blue"></div>
                        )}
                    </div>
                ))}

                {/* Load More */}
                {hasMore && (
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="w-full py-3 text-xs text-center text-gray-400 hover:text-white transition-colors border-t border-white/10 mt-2"
                    >
                        {loading ? 'Loading...' : 'Load more notifications'}
                    </button>
                )}
            </div>
        </div>
    );
}

function BellOffIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" />
            <path d="M17 17H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            <path d="m2 2 20 20" />
        </svg>
    )
}
