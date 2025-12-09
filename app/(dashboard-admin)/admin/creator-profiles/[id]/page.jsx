'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import useCreatorProfile from '@/hooks/useCreatorProfile';
import { ArrowLeft, User, Mail, Calendar, Music, Award, FileAudio } from 'lucide-react';
import { openNotification } from '@/utils/open-notification';

const STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending Review', color: 'bg-blue-600' },
    { value: 'APPROVED', label: 'Approved', color: 'bg-green-600' },
    { value: 'REJECTED', label: 'Rejected', color: 'bg-red-600' },
    { value: 'SUSPENDED', label: 'Suspended', color: 'bg-orange-600' },
];

export default function CreatorProfileDetailPage({ params }) {
    const router = useRouter();
    // Unwrap params promise
    const { id } = use(params);

    const { creatorProfile, getCreatorProfileById, updateCreatorProfileStatus, loading } = useCreatorProfile();
    const [selectedStatus, setSelectedStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (id) {
            getCreatorProfileById(id);
        }
    }, [id, getCreatorProfileById]);

    useEffect(() => {
        if (creatorProfile) {
            setSelectedStatus(creatorProfile.status);
        }
    }, [creatorProfile]);

    const handleStatusChange = async () => {
        if (selectedStatus === creatorProfile.status) {
            openNotification('info', 'Status is already set to this value');
            return;
        }

        setUpdating(true);
        const result = await updateCreatorProfileStatus(id, selectedStatus);
        setUpdating(false);

        if (result === true) {
            // Recargar el perfil
            getCreatorProfileById(id);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!creatorProfile) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-500">Creator profile not found</p>
                    <button
                        onClick={() => router.push('/admin/creator-profiles')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push('/admin/creator-profiles')}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to List
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Creator Profile Details</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Info Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Name</label>
                                <p className="text-gray-900 font-medium">{creatorProfile.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Email</label>
                                <p className="text-gray-900 font-medium">{creatorProfile.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Brand Name</label>
                                <p className="text-gray-900 font-medium">{creatorProfile.brandName || creatorProfile.stageName}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Country</label>
                                <p className="text-gray-900 font-medium">{creatorProfile.country || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600">Role</label>
                                <p className="text-gray-900 font-medium">{creatorProfile.roles || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Years of Experience</label>
                                <p className="text-gray-900 font-medium">{creatorProfile.yearsOfExperience}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Availability</label>
                                <p className="text-gray-900 font-medium">{creatorProfile.availability?.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Main DAW</label>
                                <p className="text-gray-900 font-medium">{creatorProfile.mainDaw || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Files */}
                    {creatorProfile.fileExamples && Object.keys(creatorProfile.fileExamples).length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Uploaded Files</h2>
                            <div className="space-y-3">
                                {Object.entries(creatorProfile.fileExamples).map(([key, file]) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <FileAudio className="w-5 h-5 text-gray-600 mr-3" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                <p className="text-xs text-gray-500">{file.category?.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-700"
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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Management</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleStatusChange}
                            disabled={updating || selectedStatus === creatorProfile.status}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {updating ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
                        <div className="space-y-3">
                            <div className="flex items-start">
                                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Submitted</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(creatorProfile.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            {creatorProfile.updatedAt !== creatorProfile.createdAt && (
                                <div className="flex items-start">
                                    <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Last Updated</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(creatorProfile.updatedAt).toLocaleString()}
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
