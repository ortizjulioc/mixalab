'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
    Music,
    MapPin,
    Clock,
    Award,
    CheckCircle2,
    XCircle,
    Eye,
    Filter,
    Search,
    Sparkles,
    Calendar,
    DollarSign,
    AlertCircle
} from 'lucide-react';
import { openNotification } from '@/utils/open-notification';
import CreatorRequestCard from '@/components/CreatorRequestCard';

const TIER_STYLES = {
    BRONZE: {
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
    },
    SILVER: {
        color: 'text-gray-300',
        bg: 'bg-gray-400/10',
        border: 'border-gray-400/30',
    },
    GOLD: {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
    },
    PLATINUM: {
        color: 'text-cyan-300',
        bg: 'bg-cyan-400/10',
        border: 'border-cyan-400/30',
    },
};

export default function CreatorRequestsPage() {
    const { data: session } = useSession();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ACCEPTED'); // Show My Projects by default
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (session?.user?.id) {
            fetchAvailableRequests();
        }
    }, [session, filter]);

    const fetchAvailableRequests = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/creator/available-requests?filter=${filter}`);
            const data = await response.json();
            setRequests(data.requests || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
            openNotification('error', 'Error loading requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await fetch(`/api/service-requests/${requestId}/accept`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to accept request');
            }

            openNotification('success', 'Request accepted successfully!');
            fetchAvailableRequests();
            setShowDetails(false);
        } catch (error) {
            console.error('Error accepting request:', error);
            openNotification('error', 'Error accepting request');
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            const response = await fetch(`/api/service-requests/${requestId}/decline`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to decline request');
            }

            openNotification('info', 'Request declined');
            fetchAvailableRequests();
            setShowDetails(false);
        } catch (error) {
            console.error('Error declining request:', error);
            openNotification('error', 'Error declining request');
        }
    };

    const openRequestDetails = (request) => {
        setSelectedRequest(request);
        setShowDetails(true);
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Available Projects</h1>
                <p className="text-gray-400">Review and accept projects that match your expertise</p>
            </div>

            {/* Alert for Pending Matches */}
            {!loading && requests.filter(r => r.status === 'IN_REVIEW' && r.creatorId).length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-400/50 rounded-xl p-6 shadow-lg shadow-amber-500/10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-amber-500/30 rounded-full animate-pulse">
                            <AlertCircle className="w-7 h-7 text-amber-300" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-amber-200 mb-2">
                                🎯 You have {requests.filter(r => r.status === 'IN_REVIEW' && r.creatorId).length} project(s) waiting for your response!
                            </h3>
                            <p className="text-gray-200 mb-4 text-base">
                                A project has been matched to you. Please review and accept or decline to help the artist move forward.
                            </p>
                            <button
                                onClick={() => setFilter('ACCEPTED')}
                                className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
                            >
                                <Eye className="w-5 h-5" />
                                View Pending Projects
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Simplified Filters */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setFilter('ACCEPTED')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'ACCEPTED'
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-zinc-800/60 text-gray-400 hover:bg-zinc-700/60'
                        }`}
                >
                    My Projects
                </button>
                <button
                    onClick={() => setFilter('AVAILABLE')}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${filter === 'AVAILABLE'
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                        : 'bg-zinc-800/60 text-gray-400 hover:bg-zinc-700/60'
                        }`}
                >
                    Available
                </button>
            </div>

            {/* Requests Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-6 animate-pulse">
                            <div className="h-6 bg-zinc-700 rounded mb-4"></div>
                            <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                            <div className="h-4 bg-zinc-700 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-16">
                    <div className="inline-flex p-4 bg-zinc-800/50 rounded-full mb-4">
                        <Sparkles className="w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No projects available</h3>
                    <p className="text-gray-400">Check back later for new opportunities</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requests.map((request) => (
                        <CreatorRequestCard
                            key={request.id}
                            request={request}
                            onView={() => openRequestDetails(request)}
                        />
                    ))}
                </div>
            )}

            {/* Request Details Modal */}
            {showDetails && selectedRequest && (
                <RequestDetailsModal
                    request={selectedRequest}
                    onClose={() => setShowDetails(false)}
                    onAccept={() => handleAcceptRequest(selectedRequest.id)}
                    onDecline={() => handleDeclineRequest(selectedRequest.id)}
                />
            )}
        </div>
    );
}

function RequestCard({ request, onView }) {
    const tierStyle = TIER_STYLES[request.tier] || TIER_STYLES.BRONZE;

    return (
        <div className="group bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
            onClick={onView}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                        {request.projectName}
                    </h3>
                    <p className="text-sm text-gray-400">{request.artistName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tierStyle.bg} ${tierStyle.color} ${tierStyle.border} border`}>
                    {request.tier}
                </span>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Music className="w-4 h-4" />
                    <span>{request.services} • {request.projectType}</span>
                </div>
                {request.genres && request.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {request.genres.slice(0, 3).map((g, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-zinc-700/40 text-gray-300 text-xs rounded-full">
                                {g.genre?.name}
                            </span>
                        ))}
                        {request.genres.length > 3 && (
                            <span className="px-2 py-0.5 text-gray-500 text-xs">
                                +{request.genres.length - 3}
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
        </div>
    );
}

function RequestDetailsModal({ request, onClose, onAccept, onDecline }) {
    const tierStyle = TIER_STYLES[request.tier] || TIER_STYLES.BRONZE;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-700 p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{request.projectName}</h2>
                            <p className="text-gray-400">by {request.artistName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <XCircle className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Quick Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/50">
                            <p className="text-xs text-gray-500 mb-1">Tier</p>
                            <p className={`font-bold ${tierStyle.color}`}>{request.tier}</p>
                        </div>
                        <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/50">
                            <p className="text-xs text-gray-500 mb-1">Service</p>
                            <p className="font-bold text-white">{request.services}</p>
                        </div>
                        <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/50">
                            <p className="text-xs text-gray-500 mb-1">Type</p>
                            <p className="font-bold text-white">{request.projectType}</p>
                        </div>
                        <div className="bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/50">
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <p className="font-bold text-amber-400">{request.status}</p>
                        </div>
                    </div>

                    {/* Description */}
                    {request.description && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Description</h3>
                            <p className="text-gray-300 leading-relaxed">{request.description}</p>
                        </div>
                    )}

                    {/* Genres */}
                    {request.genres && request.genres.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {request.genres.map((g, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-zinc-700/40 text-gray-200 text-sm rounded-full border border-zinc-600/40">
                                        {g.genre?.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Files */}
                    {request.files && request.files.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Files</h3>
                            <div className="space-y-2">
                                {request.files.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/50">
                                        <span className="text-sm text-gray-300">{file.name}</span>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-400 hover:text-amber-300 text-sm font-semibold"
                                        >
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Artist Info */}
                    {request.user && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Artist</h3>
                            <div className="flex items-center gap-4 bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/50">
                                {request.user.image ? (
                                    <img src={request.user.image} alt={request.user.name} className="w-12 h-12 rounded-full" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                                        <span className="text-xl font-bold text-gray-400">
                                            {request.user.name?.[0] || request.user.email?.[0]}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-white">{request.user.name || 'Anonymous'}</p>
                                    <p className="text-sm text-gray-400">{request.user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-zinc-900/95 backdrop-blur-sm border-t border-zinc-700 p-6">
                    {['PENDING', 'IN_REVIEW'].includes(request.status) ? (
                        <div className="flex gap-3">
                            <button
                                onClick={onDecline}
                                className="flex-1 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                Decline
                            </button>
                            <button
                                onClick={onAccept}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Accept Project
                            </button>
                        </div>
                    ) : ['ACCEPTED', 'AWAITING_PAYMENT'].includes(request.status) ? (
                        <div className="flex items-center justify-between w-full gap-4">
                            <div className="flex items-center gap-2 text-amber-500 font-medium px-4 py-3 bg-amber-500/10 rounded-xl border border-amber-500/20 flex-1">
                                <Clock className="w-5 h-5" />
                                Waiting for Artist Payment
                            </div>
                            <button
                                onClick={onDecline}
                                className="px-6 py-3 rounded-xl border border-zinc-700 hover:border-red-500/50 hover:bg-red-500/10 text-gray-400 hover:text-red-400 font-medium transition-all flex items-center gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                Cancel Request
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-end">
                            <a
                                href={`/creators/projects/${request.id}`}
                                className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Manage Project
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
