'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Home, User, Award, AlertCircle, CheckCircle, Clock, Medal, Trophy, Crown, Gem } from 'lucide-react'

import BreadcrumbsTitle from '@/components/Breadcrumbs'
import Button from '@/components/Button'

// Configuración de tiers con colores, iconos y estilos
const TIER_CONFIG = {
    BRONZE: {
        name: 'Bronze',
        icon: Medal,
        color: 'text-orange-600',
        bgColor: 'bg-gradient-to-br from-orange-900/40 to-orange-800/20',
        borderColor: 'border-orange-600/50',
        badgeBg: 'bg-orange-600/20',
        badgeText: 'text-orange-400',
        badgeBorder: 'border-orange-600/30',
        glowColor: 'shadow-orange-600/20',
    },
    SILVER: {
        name: 'Silver',
        icon: Award,
        color: 'text-gray-300',
        bgColor: 'bg-gradient-to-br from-gray-700/40 to-gray-600/20',
        borderColor: 'border-gray-400/50',
        badgeBg: 'bg-gray-400/20',
        badgeText: 'text-gray-300',
        badgeBorder: 'border-gray-400/30',
        glowColor: 'shadow-gray-400/20',
    },
    GOLD: {
        name: 'Gold',
        icon: Trophy,
        color: 'text-yellow-400',
        bgColor: 'bg-gradient-to-br from-yellow-600/40 to-yellow-500/20',
        borderColor: 'border-yellow-500/50',
        badgeBg: 'bg-yellow-500/20',
        badgeText: 'text-yellow-400',
        badgeBorder: 'border-yellow-500/30',
        glowColor: 'shadow-yellow-500/20',
    },
    PLATINUM: {
        name: 'Platinum',
        icon: Crown,
        color: 'text-cyan-300',
        bgColor: 'bg-gradient-to-br from-cyan-600/40 to-purple-600/20',
        borderColor: 'border-cyan-400/50',
        badgeBg: 'bg-cyan-400/20',
        badgeText: 'text-cyan-300',
        badgeBorder: 'border-cyan-400/30',
        glowColor: 'shadow-cyan-400/20',
    },
}

export default function CreatorProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user?.id) return

            try {
                const response = await fetch(`/api/creator-profiles/user/${session.user.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setProfile(data)
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
            } finally {
                setLoading(false)
            }
        }

        if (status === 'authenticated') {
            fetchProfile()
        }
    }, [session, status])

    // Helper functions para formatear datos
    const formatCountry = (countryCode) => {
        const countries = {
            'AR': 'Argentina',
            'US': 'United States',
            'MX': 'Mexico',
            'ES': 'Spain',
            'CO': 'Colombia',
            'CL': 'Chile',
            'PE': 'Peru',
            'BR': 'Brazil',
            // Agregar más países según sea necesario
        }
        return countries[countryCode] || countryCode
    }

    const formatDAW = (daw) => {
        const daws = {
            'fl_studio': 'FL Studio',
            'ableton_live': 'Ableton Live',
            'logic_pro': 'Logic Pro',
            'pro_tools': 'Pro Tools',
            'cubase': 'Cubase',
            'studio_one': 'Studio One',
            'reaper': 'Reaper',
            // Agregar más DAWs según sea necesario
        }
        return daws[daw] || daw
    }

    const formatAvailability = (availability) => {
        if (!availability) return 'Not specified'
        return availability.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="space-y-8">
                <BreadcrumbsTitle
                    title="My Profile"
                    items={[
                        { label: 'Dashboard', href: '/creators/home', icon: <Home size={18} /> },
                        { label: 'Profile' },
                    ]}
                />
                <div className="p-8 rounded-2xl liquid-glass text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10"></div>
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-indigo-500/50" />
                    <h2 className="text-2xl font-bold text-white mb-2">No Profile Found</h2>
                    <p className="text-gray-400 mb-6">You haven't created a creator profile yet.</p>
                    <Button color="blue" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => router.push('/creators/profile/create')}>
                        Create Profile
                    </Button>
                </div>

            </div>
        )
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'PENDING':
                return <Clock className="w-5 h-5 text-yellow-500" />
            case 'REJECTED':
                return <AlertCircle className="w-5 h-5 text-red-500" />
            case 'SUSPENDED':
                return <AlertCircle className="w-5 h-5 text-orange-500" />
            default:
                return null
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED':
                return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            case 'REJECTED':
                return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'SUSPENDED':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
    }

    const currentTier = profile.CreatorTier?.find(ct => ct.active)?.tier
    const tierConfig = currentTier ? TIER_CONFIG[currentTier.name] : null
    const TierIcon = tierConfig?.icon || Award

    return (
        <div className="space-y-8">
            <BreadcrumbsTitle
                title="My Profile"
                items={[
                    { label: 'Dashboard', href: '/creators/home', icon: <Home size={18} /> },
                    { label: 'Profile' },
                ]}
            />

            {/* Status Banner */}
            <div className={`p-6 border rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden group ${getStatusColor(profile.status)}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] blur-3xl rounded-full -mr-10 -mt-10"></div>

                <div className="flex items-center gap-3">
                    {getStatusIcon(profile.status)}
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">Profile Status: {profile.status}</h3>
                        {profile.status === 'PENDING' && (
                            <p className="text-sm opacity-80 mt-1">
                                Your profile is under review. You'll be notified once it's approved.
                            </p>
                        )}
                        {profile.status === 'APPROVED' && (
                            <p className="text-sm opacity-80 mt-1">
                                Your profile is active and visible to clients.
                            </p>
                        )}
                        {profile.status === 'REJECTED' && (
                            <p className="text-sm opacity-80 mt-1">
                                Your profile was rejected. Please contact support for more information.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tier Information */}
            {currentTier && tierConfig && (
                <div className={`p-8 border-2 rounded-2xl liquid-glass shadow-2xl relative overflow-hidden group transition-all duration-500 hover:shadow-indigo-500/10 ${tierConfig.borderColor} ${tierConfig.bgColor} ${tierConfig.glowColor}`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all duration-500 group-hover:bg-white/10"></div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${tierConfig.badgeBg} border ${tierConfig.badgeBorder}`}>
                            <TierIcon className={`w-8 h-8 ${tierConfig.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Your Membership Tier</p>
                            <h2 className={`text-3xl font-bold ${tierConfig.color}`}>{tierConfig.name} Tier</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className={`p-5 rounded-xl border ${tierConfig.badgeBorder} ${tierConfig.badgeBg} backdrop-blur-sm`}>
                            <p className="text-sm text-gray-400 mb-2">Base Price</p>
                            <p className={`text-3xl font-bold ${tierConfig.badgeText}`}>${currentTier.price}</p>
                        </div>
                        <div className={`p-5 rounded-xl border ${tierConfig.badgeBorder} ${tierConfig.badgeBg} backdrop-blur-sm`}>
                            <p className="text-sm text-gray-400 mb-2">Revisions Included</p>
                            <p className={`text-3xl font-bold ${tierConfig.badgeText}`}>{currentTier.numberOfRevisions}</p>
                        </div>
                        <div className={`p-5 rounded-xl border ${tierConfig.badgeBorder} ${tierConfig.badgeBg} backdrop-blur-sm`}>
                            <p className="text-sm text-gray-400 mb-2">Max Stems</p>
                            <p className={`text-3xl font-bold ${tierConfig.badgeText}`}>{currentTier.stems}</p>
                        </div>
                        <div className={`p-5 rounded-xl border ${tierConfig.badgeBorder} ${tierConfig.badgeBg} backdrop-blur-sm`}>
                            <p className="text-sm text-gray-400 mb-2">Delivery Time</p>
                            <p className={`text-3xl font-bold ${tierConfig.badgeText}`}>{currentTier.deliveryDays} days</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Information */}
            <div className="rounded-2xl liquid-glass shadow-2xl shadow-indigo-500/5 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 transition-all duration-500 group-hover:bg-indigo-500/10"></div>
                <div className="p-8">

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <User className="w-6 h-6 text-blue-400" />
                            <h2 className="text-xl font-bold text-white">Profile Information</h2>
                        </div>
                        <Button
                            color="blue"
                            onClick={() => router.push(`/creators/profile/edit`)}
                            disabled={profile.status === 'SUSPENDED'}
                        >
                            Edit Profile
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm text-gray-400">Brand Name</label>
                            <p className="text-white font-medium mt-1">{profile.brandName}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Country</label>
                            <p className="text-white font-medium mt-1">{formatCountry(profile.country) || 'Not specified'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Years of Experience</label>
                            <p className="text-white font-medium mt-1">{profile.yearsOfExperience} {profile.yearsOfExperience === 1 ? 'year' : 'years'}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Main DAW</label>
                            <p className="text-white font-medium mt-1">{formatDAW(profile.mainDaw)}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Availability</label>
                            <p className="text-white font-medium mt-1">{formatAvailability(profile.availability)}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400">Portfolio</label>
                            {profile.portfolio ? (
                                <a
                                    href={profile.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 mt-1 block"
                                >
                                    View Portfolio
                                </a>
                            ) : (
                                <p className="text-gray-500 mt-1">Not specified</p>
                            )}
                        </div>
                    </div>

                    {/* Genres */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <label className="text-sm text-gray-400 block mb-3">Genres & Styles</label>
                        <div className="flex flex-wrap gap-2">
                            {profile.genders?.map((g) => (
                                <span key={g.id || Math.random()} className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-sm border border-blue-500/20">
                                    {g.genre?.name || 'Unknown'}
                                </span>
                            ))}
                            {(!profile.genders || profile.genders.length === 0) && (
                                <p className="text-gray-500 italic">No genres specified</p>
                            )}
                        </div>
                    </div>

                    {profile.gearList && (
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <label className="text-sm text-gray-400">Gear List</label>
                            <p className="text-white mt-1">{profile.gearList}</p>
                        </div>
                    )}
                </div>
            </div>


            {/* Services */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {profile.mixing && (
                    <div className="p-6 rounded-2xl liquid-glass relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12"></div>

                        <h3 className="text-lg font-bold text-white mb-4">Mixing Services</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-400">Experience</p>
                                <p className="text-white">{profile.mixing.yearsMixing} years</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Turnaround Time</p>
                                <p className="text-white">{profile.mixing.averageTurnaroundTimeDays} days</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Vocal Tuning</p>
                                <p className="text-white">{profile.mixing.doYouTuneVocals ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {profile.masteringEngineerProfile && (
                    <div className="p-6 rounded-2xl liquid-glass relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12"></div>

                        <h3 className="text-lg font-bold text-white mb-4">Mastering Services</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-400">Experience</p>
                                <p className="text-white">{profile.masteringEngineerProfile.yearsMastering} years</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Turnaround Time</p>
                                <p className="text-white">{profile.masteringEngineerProfile.averageTurnaroundTimeDays} days</p>
                            </div>
                        </div>
                    </div>
                )}

                {profile.instrumentalist && (
                    <div className="p-6 rounded-2xl liquid-glass relative overflow-hidden group hover:translate-y-[-2px] transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full -mr-12 -mt-12"></div>

                        <h3 className="text-lg font-bold text-white mb-4">Recording Services</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-400">Experience</p>
                                <p className="text-white">{profile.instrumentalist.yearsRecordingOrPlaying} years</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">Instruments</p>
                                <p className="text-white">
                                    {Array.isArray(profile.instrumentalist.instruments)
                                        ? profile.instrumentalist.instruments.join(', ')
                                        : 'Not specified'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Warning about editing */}
            {profile.status === 'APPROVED' && (
                <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-xl">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-400 font-medium">Important Notice</p>
                            <p className="text-yellow-400/80 text-sm mt-1">
                                If you edit your profile, it will be set to PENDING status and will need to be approved again by an administrator.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
