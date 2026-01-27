'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useMyRequests from '@/hooks/useMyRequests';
import {
    Music,
    Clock,
    Eye,
    XCircle,
    Calendar,
    User,
    Sparkles,
    Filter,
    AlertCircle,
} from 'lucide-react';

const STATUS_FILTERS = [
    { value: 'ALL', label: 'All Requests' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_REVIEW', label: 'In Review' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

export default function MyRequestsPage() {
    const router = useRouter();
    const {
        requests,
        loading,
        error,
        fetchMyRequests,
        getStatusColor,
        getStatusLabel,
    } = useMyRequests();

    const [selectedFilter, setSelectedFilter] = useState('ALL');

    useEffect(() => {
        fetchMyRequests(selectedFilter);
    }, [selectedFilter, fetchMyRequests]);

    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
    };

    const handleViewDetails = (requestId) => {
        router.push(`/artists/my-requests/${requestId}`);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">My Requests</h1>
                <p className="text-gray-400 text-lg">
                    Track and manage all your service requests
                </p>
            </div>

            {/* Filters */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        Filter by Status
                    </span>
                </div>
                <div className="flex flex-wrap gap-3">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => handleFilterChange(filter.value)}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${selectedFilter === filter.value
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'bg-zinc-800/60 text-gray-400 hover:bg-zinc-700/60 hover:text-white'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-6 animate-pulse"
                        >
                            <div className="h-6 bg-zinc-700 rounded mb-4"></div>
                            <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                            <div className="h-4 bg-zinc-700 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-16">
                    <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-4">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Error Loading Requests</h3>
                    <p className="text-gray-400">{error}</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-16">
                    <div className="inline-flex p-4 bg-zinc-800/50 rounded-full mb-4">
                        <Sparkles className="w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {selectedFilter === 'ALL'
                            ? 'No requests yet'
                            : `No ${selectedFilter.toLowerCase()} requests`}
                    </h3>
                    <p className="text-gray-400 mb-6">
                        {selectedFilter === 'ALL'
                            ? 'Create your first service request to get started'
                            : 'Try selecting a different filter'}
                    </p>
                    {selectedFilter === 'ALL' && (
                        <button
                            onClick={() => router.push('/artists/order')}
                            className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                        >
                            <Music className="w-5 h-5" />
                            Create New Request
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onView={() => handleViewDetails(request.id)}
                            getStatusColor={getStatusColor}
                            getStatusLabel={getStatusLabel}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function RequestCard({ request, onView, getStatusColor, getStatusLabel }) {
    const statusColor = getStatusColor(request.status);
    const statusLabel = getStatusLabel(request.status);

    return (
        <div
            className="group bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
            onClick={onView}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                        {request.projectName}
                    </h3>
                    <p className="text-sm text-gray-400">{request.artistName}</p>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor} whitespace-nowrap ml-2`}
                >
                    {statusLabel}
                </span>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Music className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                        {request.services} • {request.projectType}
                    </span>
                </div>

                {request.creator && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{request.creator.user.name}</span>
                    </div>
                )}

                {request.genres && request.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {request.genres.slice(0, 2).map((g, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-zinc-700/40 text-gray-300 text-xs rounded-full"
                            >
                                {g.genre?.name}
                            </span>
                        ))}
                        {request.genres.length > 2 && (
                            <span className="px-2 py-0.5 text-gray-500 text-xs">
                                +{request.genres.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <button className="text-amber-400 hover:text-amber-300 text-sm font-semibold flex items-center gap-1 transition-colors">
                    View Details
                    <Eye className="w-4 h-4" />
                </button>
            </div>

            {/* Last Event (if any) */}
            {request.events && request.events.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-700/50">
                    <div className="flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 line-clamp-2">
                                {request.events[0].description}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                {new Date(request.events[0].createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
