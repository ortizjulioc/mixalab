'use client';

import { useRouter } from 'next/navigation';
import { User, Clock, AlertCircle, TrendingUp, CheckCircle2, XCircle, ArrowRight, DollarSign } from 'lucide-react';

const STATUS_CONFIG = {
    PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Pending Match' },
    IN_REVIEW: { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'In Review' },
    AWAITING_PAYMENT: { icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Awaiting Payment' },
    PAID: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Paid' },
    IN_PROGRESS: { icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'In Progress' },
    DELIVERED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Delivered' },
    CANCELLED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Cancelled' },
};

export default function MyProjectsSection({ serviceRequests, loading }) {
    const router = useRouter();

    if (loading || !serviceRequests || serviceRequests.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Requests</h2>
                <button
                    onClick={() => router.push('/artists/order')}
                    className="text-sm text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                >
                    New Request
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {serviceRequests.slice(0, 3).map((request) => {
                    const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = status.icon;

                    return (
                        <div
                            key={request.id}
                            className="group relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/70 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                            onClick={() => router.push(`/artists/projects/${request.id}`)}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-600/5 rounded-full blur-2xl group-hover:bg-gray-600/10 transition-all" />

                            <div className="relative flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-1">{request.projectName}</h3>
                                            <p className="text-sm text-gray-400">{request.artistName}</p>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} ${status.border} border`}>
                                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                                            <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2.5 py-1 bg-gray-700/40 text-gray-200 text-xs rounded-full border border-gray-600/40">
                                            {request.services}
                                        </span>
                                        <span className="px-2.5 py-1 bg-gray-700/40 text-gray-200 text-xs rounded-full border border-gray-600/40">
                                            {request.tier}
                                        </span>
                                        <span className="px-2.5 py-1 bg-gray-700/40 text-gray-200 text-xs rounded-full border border-gray-600/40">
                                            {request.projectType}
                                        </span>
                                    </div>

                                    {request.creator && (
                                        <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg border border-gray-700/30">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{request.creator.brandName}</p>
                                                <p className="text-xs text-gray-400">Your Engineer</p>
                                            </div>
                                        </div>
                                    )}

                                    {!request.creator && request.status === 'PENDING' && (
                                        <div className="flex items-center gap-2 text-sm text-amber-400">
                                            <Clock className="w-4 h-4" />
                                            <span>Waiting for engineer assignment...</span>
                                        </div>
                                    )}

                                    {request.status === 'AWAITING_PAYMENT' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/artists/payment/${request.id}`);
                                            }}
                                            className="w-full mt-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center justify-center gap-2"
                                        >
                                            <DollarSign className="w-5 h-5" />
                                            Proceed to Payment
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/artists/projects/${request.id}`);
                                    }}
                                    className="p-2 hover:bg-gray-700/30 rounded-lg transition-colors"
                                >
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {serviceRequests.length > 3 && (
                <button
                    onClick={() => router.push('/artists/projects')}
                    className="w-full py-3 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600/70 rounded-xl text-gray-300 hover:text-white font-semibold transition-all duration-300"
                >
                    View All Requests ({serviceRequests.length})
                </button>
            )}
        </div>
    );
}
