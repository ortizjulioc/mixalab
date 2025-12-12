'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import useCreatorProfile from '@/hooks/useCreatorProfile';
import { ArrowLeft, Calendar, FileAudio, Home, User, Mail, Briefcase, Globe, Layers, Music, Mic } from 'lucide-react';
import { openNotification } from '@/utils/open-notification';
import BreadcrumbsTitle from '@/components/Breadcrumbs';
import Button from '@/components/Button';
import Select from '@/components/Select';

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending Review', color: 'text-blue-400' },
    { value: 'APPROVED', label: 'Approved', color: 'text-green-400' },
    { value: 'REJECTED', label: 'Rejected', color: 'text-red-400' },
    { value: 'SUSPENDED', label: 'Suspended', color: 'text-orange-400' },
];

const formatCountry = (code) => {
    const countries = {
        'US': 'United States',
        'GB': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'ES': 'Spain',
        'IT': 'Italy',
        'MX': 'Mexico',
        'BR': 'Brazil',
        'AR': 'Argentina',
        'CL': 'Chile',
        'CO': 'Colombia',
        'PE': 'Peru',
        // Agregar más según necesites
    };
    return countries[code] || code;
};

const formatAvailability = (availability) => {
    const availabilities = {
        'FULL_TIME': 'Full Time',
        'PART_TIME': 'Part Time',
        'ON_DEMAND': 'On Demand',
    };
    return availabilities[availability] || availability?.replace('_', ' ');
};

const formatDAW = (daw) => {
    if (!daw) return 'N/A';
    return daw.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function CreatorProfileDetailPage({ params }) {
    const router = useRouter();
    const { id } = use(params);

    const { updateCreatorProfileStatus } = useCreatorProfile();
    const [profile, setProfile] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const [loading, setLoading] = useState(true);

    // Cargar perfil una sola vez
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/creator-profiles/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                    setSelectedStatus(data.status);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadProfile();
        }
    }, [id]);

    const handleStatusChange = async () => {
        if (!profile || selectedStatus === profile.status) {
            openNotification('info', 'Status is already set to this value');
            return;
        }

        setUpdating(true);
        const result = await updateCreatorProfileStatus(id, selectedStatus);
        setUpdating(false);

        if (result === true) {
            // Recargar el perfil
            const response = await fetch(`/api/creator-profiles/${id}`);
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="text-center py-12 liquid-glass rounded-2xl border border-white/20">
                    <p className="text-gray-400">Creator profile not found</p>
                    <Button
                        onClick={() => router.push('/admin/creator-profiles')}
                        color="blue"
                        size="md"
                        className="mt-4"
                    >
                        Back to List
                    </Button>
                </div>
            </div>
        );
    }

    // Derive roles and files
    const roles = [];
    const files = [];

    if (profile.mixing) {
        roles.push('Mixing Engineer');
        if (profile.mixing.uploadBeforeMix) files.push({ category: 'Before Mix', ...profile.mixing.uploadBeforeMix });
        if (profile.mixing.uploadAfterMix) files.push({ category: 'After Mix', ...profile.mixing.uploadAfterMix });
        if (profile.mixing.uploadExampleTunedVocals) files.push({ category: 'Tuned Vocals Example', ...profile.mixing.uploadExampleTunedVocals });
    }
    if (profile.masteringEngineerProfile) {
        roles.push('Mastering Engineer');
        if (profile.masteringEngineerProfile.uploadBeforeMaster) files.push({ category: 'Before Master', ...profile.masteringEngineerProfile.uploadBeforeMaster });
        if (profile.masteringEngineerProfile.uploadAfterMaster) files.push({ category: 'After Master', ...profile.masteringEngineerProfile.uploadAfterMaster });
    }
    if (profile.instrumentalist) {
        roles.push('Instrumentalist');
        if (profile.instrumentalist.uploadExampleFile) files.push({ category: 'Performance Example', ...profile.instrumentalist.uploadExampleFile });
    }

    // Helper for JSON fields
    const renderList = (items) => {
        if (Array.isArray(items)) {
            return items.map(i => typeof i === 'string' ? i : i.label || i.value || JSON.stringify(i)).join(', ');
        }
        return items || 'N/A';
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Breadcrumbs */}
            <BreadcrumbsTitle
                title="Creator Profile Details"
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Creator Profiles', href: '/admin/creator-profiles' },
                    { label: profile.brandName || 'Profile' },
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Info Card */}
                    <div className="liquid-glass rounded-2xl border border-white/20 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-blue-400" />
                            User Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400">Name</label>
                                <p className="text-white font-medium">{profile.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Email</label>
                                <p className="text-white font-medium">{profile.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Brand Name</label>
                                <p className="text-white font-medium">{profile.brandName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Country</label>
                                <p className="text-white font-medium">{formatCountry(profile.country) || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="liquid-glass rounded-2xl border border-white/20 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                            Professional Information
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-400">Roles</label>
                                <p className="text-white font-medium">{roles.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Years of Experience</label>
                                <p className="text-white font-medium">{profile.yearsOfExperience}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Availability</label>
                                <p className="text-white font-medium">{formatAvailability(profile.availability) || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-400">Main DAW</label>
                                <p className="text-white font-medium">{formatDAW(profile.mainDaw) || 'N/A'}</p>
                            </div>
                            <div className="sm:col-span-2"><label className="text-sm text-gray-400">Plugin Chains</label><p className="text-white font-medium">{renderList(profile.pluginChains)}</p></div>
                            <div className="sm:col-span-2"><label className="text-sm text-gray-400">Gear List</label><p className="text-white font-medium">{profile.gearList || 'N/A'}</p></div>
                        </div>
                    </div>

                    {/* Role Specific Details - Mixing */}
                    {profile.mixing && (
                        <div className="liquid-glass rounded-2xl border border-white/20 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <Layers className="w-5 h-5 mr-2 text-purple-400" /> Mixing Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-400">Years Mixing</label><p className="text-white font-medium">{profile.mixing.yearsMixing}</p></div>
                                <div><label className="text-sm text-gray-400">Turnaround (Days)</label><p className="text-white font-medium">{profile.mixing.averageTurnaroundTimeDays}</p></div>
                                <div><label className="text-sm text-gray-400">Tunes Vocals?</label><p className="text-white font-medium">{profile.mixing.doYouTuneVocals ? 'Yes' : 'No'}</p></div>
                                <div className="sm:col-span-2"><label className="text-sm text-gray-400">Notable Artists</label><p className="text-white font-medium">{profile.mixing.notableArtists || 'N/A'}</p></div>
                            </div>
                        </div>
                    )}

                    {/* Role Specific Details - Mastering */}
                    {profile.masteringEngineerProfile && (
                        <div className="liquid-glass rounded-2xl border border-white/20 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <Music className="w-5 h-5 mr-2 text-pink-400" /> Mastering Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-400">Years Mastering</label><p className="text-white font-medium">{profile.masteringEngineerProfile.yearsMastering}</p></div>
                                <div><label className="text-sm text-gray-400">Turnaround (Days)</label><p className="text-white font-medium">{profile.masteringEngineerProfile.averageTurnaroundTimeDays}</p></div>
                                <div className="sm:col-span-2"><label className="text-sm text-gray-400">Preferred Loudness Range</label><p className="text-white font-medium">{profile.masteringEngineerProfile.preferredLoudnessRange || 'N/A'}</p></div>
                            </div>
                        </div>
                    )}

                    {/* Role Specific Details - Instrumentalist */}
                    {profile.instrumentalist && (
                        <div className="liquid-glass rounded-2xl border border-white/20 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <Mic className="w-5 h-5 mr-2 text-yellow-400" /> Instrumentalist Details
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-400">Years Playing/Recording</label><p className="text-white font-medium">{profile.instrumentalist.yearsRecordingOrPlaying}</p></div>
                                <div className="sm:col-span-2"><label className="text-sm text-gray-400">Instruments</label><p className="text-white font-medium">{renderList(profile.instrumentalist.instruments)}</p></div>
                                <div className="sm:col-span-2"><label className="text-sm text-gray-400">Studio Setup</label><p className="text-white font-medium">{profile.instrumentalist.studioSetupDescription || 'N/A'}</p></div>
                            </div>
                        </div>
                    )}

                    {/* Files */}
                    {files.length > 0 && (
                        <div className="liquid-glass rounded-2xl border border-white/20 p-6">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                                <FileAudio className="w-5 h-5 mr-2 text-blue-400" />
                                Uploaded Files
                            </h2>
                            <div className="space-y-3">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition">
                                        <div className="flex items-center">
                                            <FileAudio className="w-5 h-5 text-blue-400 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-white">{file.name}</p>
                                                <p className="text-xs text-gray-400">{file.category}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-400 hover:text-blue-300 transition"
                                        >
                                            View
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Status Management */}
                <div className="space-y-6">
                    {/* Status Card */}
                    <div className="liquid-glass rounded-2xl border border-white/20 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Status Management</h2>

                        <Select
                            label="Current Status"
                            id="status"
                            name="status"
                            value={selectedStatus}
                            onChange={(newValue) => setSelectedStatus(newValue)}
                            options={STATUS_OPTIONS}
                            className="mb-4"
                        />

                        <Button
                            onClick={handleStatusChange}
                            disabled={updating || selectedStatus === profile.status}
                            color="blue"
                            size="md"
                            loading={updating}
                            className="w-full"
                        >
                            {updating ? 'Updating...' : 'Update Status'}
                        </Button>
                    </div>

                    {/* Timeline */}
                    <div className="liquid-glass rounded-2xl border border-white/20 p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Timeline</h2>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-white">Submitted</p>
                                    <p className="text-xs text-gray-400">
                                        {new Date(profile.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {profile.updatedAt !== profile.createdAt && (
                                <div className="flex items-start">
                                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Last Updated</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(profile.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
