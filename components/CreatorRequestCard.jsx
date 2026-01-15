'use client';

import { Music, Clock, Eye, Sparkles, CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';

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

const STATUS_CONFIG = {
    PENDING: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Pending' },
    IN_REVIEW: { icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'In Review' },
    AWAITING_PAYMENT: { icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Awaiting Payment' },
    PAID: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Paid' },
    IN_PROGRESS: { icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', label: 'In Progress' },
    DELIVERED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Delivered' },
    CANCELLED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Cancelled' },
};

export default function CreatorRequestCard({ request, onView }) {
    const tierStyle = TIER_STYLES[request.tier] || TIER_STYLES.BRONZE;
    const status = STATUS_CONFIG[request.status] || STATUS_CONFIG.PENDING;
    const StatusIcon = status.icon;

    // Only show "Accepted" badge if creator has actually accepted (AWAITING_PAYMENT or later)
    const isAccepted = request.status === 'AWAITING_PAYMENT' || request.status === 'PAID' || request.status === 'IN_PROGRESS';

    return (
        <div
            className="group bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-all duration-300 cursor-pointer"
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
                <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tierStyle.bg} ${tierStyle.color} ${tierStyle.border} border`}>
                        {request.tier}
                    </span>
                    {isAccepted && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            ✓ Accepted
                        </span>
                    )}
                </div>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${status.bg} ${status.border} border mb-4`}>
                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
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
