'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useMyRequests from '@/hooks/useMyRequests';
import {
    ArrowLeft,
    Music,
    User,
    Calendar,
    Clock,
    FileAudio,
    Download,
    XCircle,
    AlertCircle,
    CheckCircle2,
    Loader2,
    CreditCard,
} from 'lucide-react';

export default function RequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const {
        currentRequest,
        loading,
        error,
        fetchRequestById,
        cancelRequest,
        getStatusColor,
        getStatusLabel,
    } = useMyRequests();

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [addOns, setAddOns] = useState([]);
    const [tiers, setTiers] = useState([]);

    useEffect(() => {
        if (params.id) {
            fetchRequestById(params.id);
        }
        // Fetch tiers for dynamic pricing
        fetch('/api/tiers')
            .then(res => res.json())
            .then(data => {
                if (data.tiers) setTiers(data.tiers);
            })
            .catch(err => console.error('Error fetching tiers:', err));
    }, [params.id, fetchRequestById]);

    useEffect(() => {
        if (currentRequest && currentRequest.addOns) {
            fetchAddOnsDetails(currentRequest.addOns, currentRequest.services);
        }
    }, [currentRequest]);

    const fetchAddOnsDetails = async (selectedAddOns, serviceType) => {
        try {
            // Check if there are any add-ons to fetch
            if (!selectedAddOns || Object.keys(selectedAddOns).length === 0) {
                setAddOns([]);
                return;
            }

            const response = await fetch(`/api/add-ons?serviceType=${serviceType}`);
            const data = await response.json();

            const addOnsArray = Array.isArray(data) ? data : (data.addOns || []);

            if (addOnsArray.length > 0) {
                const selectedAddOnsWithDetails = Object.entries(selectedAddOns).map(([addOnId, config]) => {
                    const addOnDetails = addOnsArray.find(a => a.id === addOnId);
                    if (addOnDetails) {
                        return {
                            ...addOnDetails,
                            quantity: config.quantity || 1,
                            selectedOptions: config.selectedOptions || [],
                        };
                    }
                    return null;
                }).filter(Boolean);
                setAddOns(selectedAddOnsWithDetails);
            }
        } catch (error) {
            console.error('Error fetching add-ons:', error);
        }
    };

    const getBasePrice = () => {
        if (!currentRequest || tiers.length === 0) return 0;
        const tierObj = tiers.find(t => t.name === currentRequest.tier);
        if (!tierObj) return 0;

        // Try to find specific service price
        if (tierObj.prices && tierObj.prices[currentRequest.services]) {
            return Number(tierObj.prices[currentRequest.services]);
        }

        // Fallback to default price
        return Number(tierObj.price || 0);
    };

    const calculateTotal = () => {
        const basePrice = getBasePrice();
        const addOnsPrice = addOns.reduce((total, addOn) => {
            const unitPrice = addOn.pricePerUnit || addOn.price || 0;
            const quantity = addOn.quantity || 1;
            return total + (unitPrice * quantity);
        }, 0);
        return basePrice + addOnsPrice;
    };

    useEffect(() => {
        if (params.id) {
            fetchRequestById(params.id);
        }
    }, [params.id, fetchRequestById]);

    const handleCancel = async () => {
        setCancelling(true);
        const success = await cancelRequest(params.id, cancellationReason);
        setCancelling(false);
        if (success) {
            setShowCancelModal(false);
            // Refresh the request data
            fetchRequestById(params.id);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (error || !currentRequest) {
        return (
            <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
                <div className="text-center py-16">
                    <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-4">
                        <AlertCircle className="w-12 h-12 text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Error Loading Request</h3>
                    <p className="text-gray-400 mb-6">{error || 'Request not found'}</p>
                    <button
                        onClick={() => router.push('/artists/my-requests')}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-lg transition-all"
                    >
                        Back to My Requests
                    </button>
                </div>
            </div>
        );
    }

    const statusColor = getStatusColor(currentRequest.status);
    const statusLabel = getStatusLabel(currentRequest.status);
    const canCancel = ['PENDING', 'IN_REVIEW'].includes(currentRequest.status);
    const canPay = ['ACCEPTED', 'AWAITING_PAYMENT'].includes(currentRequest.status);

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => router.push('/artists/my-requests')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Back to My Requests</span>
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 rounded-xl p-8 mb-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white mb-2">
                            {currentRequest.projectName}
                        </h1>
                        <p className="text-xl text-gray-400">{currentRequest.artistName}</p>
                    </div>
                    <span
                        className={`px-4 py-2 rounded-lg text-sm font-bold border ${statusColor}`}
                    >
                        {statusLabel}
                    </span>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoCard
                        icon={Music}
                        label="Service"
                        value={currentRequest.services}
                    />
                    <InfoCard
                        icon={Music}
                        label="Project Type"
                        value={currentRequest.projectType}
                    />
                    <InfoCard
                        icon={Music}
                        label="Tier"
                        value={currentRequest.tier}
                    />
                    <InfoCard
                        icon={Calendar}
                        label="Created"
                        value={new Date(currentRequest.createdAt).toLocaleDateString()}
                    />
                </div>

                {/* Actions */}
                {canCancel && (
                    <div className="mt-6 pt-6 border-t border-zinc-700/50">
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                        >
                            <XCircle className="w-5 h-5" />
                            Cancel Request
                        </button>
                    </div>
                )}
                {canPay && (
                    <div className="mt-6 pt-6 border-t border-zinc-700/50">
                        <button
                            onClick={() => router.push(`/artists/payment/${params.id}`)}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <CreditCard className="w-5 h-5" />
                            Proceed to Payment
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    {currentRequest.description && (
                        <Section title="Description">
                            <p className="text-gray-300 leading-relaxed">
                                {currentRequest.description}
                            </p>
                        </Section>
                    )}

                    {/* Genres */}
                    {currentRequest.genres && currentRequest.genres.length > 0 && (
                        <Section title="Genres">
                            <div className="flex flex-wrap gap-2">
                                {currentRequest.genres.map((g, idx) => (
                                    <span
                                        key={idx}
                                        className="px-4 py-2 bg-zinc-700/40 text-gray-200 rounded-lg border border-zinc-600/40"
                                    >
                                        {g.genre?.name}
                                    </span>
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Files */}
                    <Section title="Files">
                        {currentRequest.files && currentRequest.files.length > 0 ? (
                            <div className="space-y-2">
                                {currentRequest.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileAudio className="w-5 h-5 text-amber-400" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(file.createdAt).toLocaleDateString()} • {file.owner?.name || 'Unknown'} ({file.owner?.role || 'User'})
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-amber-400 hover:text-amber-300 text-sm font-semibold flex items-center gap-1"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm italic">No files attached to this request.</p>
                        )}
                    </Section>

                    {/* Creator Info */}
                    {currentRequest.creator && (
                        <Section title="Assigned Creator">
                            <div className="flex items-center gap-4 bg-zinc-800/40 rounded-lg p-4 border border-zinc-700/50">
                                {currentRequest.creator.user.image ? (
                                    <img
                                        src={currentRequest.creator.user.image}
                                        alt={currentRequest.creator.user.name}
                                        className="w-16 h-16 rounded-full"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-400">
                                            {currentRequest.creator.user.name?.[0] ||
                                                currentRequest.creator.user.email?.[0]}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-white text-lg">
                                        {currentRequest.creator.user.name || 'Anonymous'}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {currentRequest.creator.user.email}
                                    </p>
                                </div>
                            </div>
                        </Section>
                    )}
                </div>

                {/* Financial Summary Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Section title="Financial Details">
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-300">
                                <span>{currentRequest.tier} Tier ({currentRequest.services})</span>
                                <span>${getBasePrice()}</span>
                            </div>

                            {addOns.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-zinc-700/50">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Add-ons</p>
                                    {addOns.map((addOn, idx) => {
                                        const unitPrice = addOn.pricePerUnit || addOn.price || 0;
                                        const quantity = addOn.quantity || 1;
                                        return (
                                            <div key={idx} className="flex justify-between text-gray-400 text-sm">
                                                <span>{addOn.name} {quantity > 1 && `(x${quantity})`}</span>
                                                <span>${(unitPrice * quantity).toFixed(2)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="pt-3 border-t-2 border-amber-500/20 mt-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-white">Total Estimate</span>
                                    <span className="text-xl font-bold text-amber-400">${calculateTotal()}</span>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section title="Timeline">
                        {currentRequest.events && currentRequest.events.length > 0 ? (
                            <div className="space-y-4">
                                {currentRequest.events.map((event, idx) => (
                                    <TimelineEvent
                                        key={event.id}
                                        event={event}
                                        isLast={idx === currentRequest.events.length - 1}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No events yet</p>
                        )}
                    </Section>
                </div>
            </div>

            {/* Cancel Modal */}
            {
                showCancelModal && (
                    <CancelModal
                        onClose={() => setShowCancelModal(false)}
                        onConfirm={handleCancel}
                        reason={cancellationReason}
                        setReason={setCancellationReason}
                        cancelling={cancelling}
                    />
                )
            }
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
            {children}
        </div>
    );
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                    {label}
                </span>
            </div>
            <p className="text-white font-semibold">{value}</p>
        </div>
    );
}

function TimelineEvent({ event, isLast }) {
    const getEventIcon = (type) => {
        switch (type) {
            case 'STATUS_CHANGED':
                return CheckCircle2;
            case 'FILE_UPLOADED':
                return FileAudio;
            case 'CREATOR_ASSIGNED':
            case 'CREATOR_ACCEPTED':
                return User;
            case 'CREATOR_REJECTED':
                return XCircle;
            default:
                return Clock;
        }
    };

    const Icon = getEventIcon(event.type);

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className="p-2 bg-amber-500/20 rounded-full border border-amber-500/30">
                    <Icon className="w-4 h-4 text-amber-400" />
                </div>
                {!isLast && <div className="w-0.5 h-full bg-zinc-700 mt-2"></div>}
            </div>
            <div className="flex-1 pb-6">
                <p className="text-sm text-white font-medium mb-1">
                    {event.description}
                </p>
                <p className="text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleString()}
                </p>
                {event.user && (
                    <p className="text-xs text-gray-600 mt-1">by {event.user.name}</p>
                )}
            </div>
        </div>
    );
}

function CancelModal({ onClose, onConfirm, reason, setReason, cancelling }) {
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700 rounded-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-bold text-white mb-4">Cancel Request</h3>
                <p className="text-gray-400 mb-6">
                    Are you sure you want to cancel this request? This action cannot be undone.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                        Reason (Optional)
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Let us know why you're cancelling..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={cancelling}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50"
                    >
                        Keep Request
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={cancelling}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {cancelling ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Cancelling...
                            </>
                        ) : (
                            <>
                                <XCircle className="w-5 h-5" />
                                Cancel Request
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
