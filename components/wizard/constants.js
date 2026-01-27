import { Medal, Award, Trophy, Crown } from 'lucide-react';

export const TIER_ICONS = {
    BRONZE: Medal,
    SILVER: Award,
    GOLD: Trophy,
    PLATINUM: Crown,
};

export const TIER_STYLES = {
    BRONZE: {
        color: 'text-orange-600',
        bgColor: 'bg-gradient-to-br from-orange-900/40 to-orange-800/20',
        borderColor: 'border-orange-600/50',
        badgeBg: 'bg-orange-600/20',
        badgeText: 'text-orange-400',
        badgeBorder: 'border-orange-600/30',
        glowColor: 'shadow-orange-600/20',
        badge: 'Budget Friendly'
    },
    SILVER: {
        color: 'text-gray-300',
        bgColor: 'bg-gradient-to-br from-gray-700/40 to-gray-600/20',
        borderColor: 'border-gray-400/50',
        badgeBg: 'bg-gray-400/20',
        badgeText: 'text-gray-300',
        badgeBorder: 'border-gray-400/30',
        glowColor: 'shadow-gray-400/20',
        badge: 'Popular'
    },
    GOLD: {
        color: 'text-yellow-400',
        bgColor: 'bg-gradient-to-br from-yellow-600/40 to-yellow-500/20',
        borderColor: 'border-yellow-500/50',
        badgeBg: 'bg-yellow-500/20',
        badgeText: 'text-yellow-400',
        badgeBorder: 'border-yellow-500/30',
        glowColor: 'shadow-yellow-500/20',
        badge: 'Recommended'
    },
    PLATINUM: {
        color: 'text-cyan-300',
        bgColor: 'bg-gradient-to-br from-cyan-600/40 to-purple-600/20',
        borderColor: 'border-cyan-400/50',
        badgeBg: 'bg-cyan-400/20',
        badgeText: 'text-cyan-300',
        badgeBorder: 'border-cyan-400/30',
        glowColor: 'shadow-cyan-400/20',
        badge: 'Elite'
    },
};

export const SERVICE_CHECKLISTS = {
    MIXING: [
        "I have exported all stems starting from 0:00.",
        "Stems are 'dry' (no effects) unless the effect is integral to the sound.",
        "Files are correctly labeled and organized.",
        "I have included a reference demo/rough mix."
    ],
    MASTERING: [
        "The mix has between -3dB and -6dB of headroom.",
        "There is no limiter or heavy compression on the master bus.",
        "The file format is high-quality WAV or AIFF (at least 24bit).",
        "I am satisfied with the mix balance."
    ]
};
