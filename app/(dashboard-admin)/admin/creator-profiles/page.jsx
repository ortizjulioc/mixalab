'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useCreatorProfile from '@/hooks/useCreatorProfile';
import { Search, Filter, Eye, Clock, CheckCircle2, XCircle, ShieldAlert, Home } from 'lucide-react';
import BreadcrumbsTitle from '@/components/Breadcrumbs';
import Button from '@/components/Button';
import Input from '@/components/Input';

const STATUS_CONFIG = {
    PENDING: {
        label: 'Pending',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        icon: Clock,
    },
    APPROVED: {
        label: 'Approved',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        icon: CheckCircle2,
    },
    REJECTED: {
        label: 'Rejected',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        icon: XCircle,
    },
    SUSPENDED: {
        label: 'Suspended',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        icon: ShieldAlert,
    },
};

export default function CreatorProfilesPage() {
    const router = useRouter();
    const {
        creatorProfiles,
        loading,
        filters,
        handleChangeFilter,
        fetchCreatorProfiles,
    } = useCreatorProfile();

    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchCreatorProfiles();
    }, [fetchCreatorProfiles]);

    const handleViewDetails = (id) => {
        router.push(`/admin/creator-profiles/${id}`);
    };

    const filteredProfiles = statusFilter
        ? creatorProfiles.filter(profile => profile.status === statusFilter)
        : creatorProfiles;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Breadcrumbs */}
            <BreadcrumbsTitle
                title="Creator Profiles"
                subtitle="Manage and review creator security pass applications"
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Creator Profiles' },
                ]}
            />

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass w-full">
                <div className="flex-1 w-full">
                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={filters.search}
                        onChange={(e) => handleChangeFilter('search', e.target.value)}
                        className="w-full p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
                    />
                </div>

                <div className="flex-none w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/50 appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-gray-900">All Statuses</option>
                        <option value="PENDING" className="bg-gray-900">Pending</option>
                        <option value="APPROVED" className="bg-gray-900">Approved</option>
                        <option value="REJECTED" className="bg-gray-900">Rejected</option>
                        <option value="SUSPENDED" className="bg-gray-900">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                    const Icon = config.icon;
                    const count = creatorProfiles.filter(p => p.status === status).length;
                    return (
                        <div key={status} className={`p-6 border ${config.borderColor} ${config.bgColor} rounded-2xl liquid-glass`}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-400">{config.label}</p>
                                    <p className={`text-3xl font-bold ${config.color}`}>{count}</p>
                                </div>
                                <Icon className={`w-10 h-10 ${config.color}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-4 p-4 border border-white/20 rounded-2xl liquid-glass">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center p-4 space-x-4">
                            <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
                            <div className="flex space-x-2 ml-auto">
                                <div className="h-8 bg-white/10 rounded w-16 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProfiles.length === 0 ? (
                <div className="p-8 text-center text-gray-400 liquid-glass rounded-2xl border border-white/20">
                    No creator profiles found
                </div>
            ) : (
                <div className="overflow-x-auto border border-white/20 rounded-2xl liquid-glass">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="p-4 text-left text-white font-semibold border-b border-white/20">CREATOR</th>
                                <th className="p-4 text-left text-white font-semibold border-b border-white/20">BRAND NAME</th>
                                <th className="p-4 text-left text-white font-semibold border-b border-white/20">ROLE</th>
                                <th className="p-4 text-left text-white font-semibold border-b border-white/20">STATUS</th>
                                <th className="p-4 text-left text-white font-semibold border-b border-white/20">SUBMITTED</th>
                                <th className="p-4 text-right text-white font-semibold border-b border-white/20">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProfiles.map((profile) => {
                                const statusConfig = STATUS_CONFIG[profile.status] || STATUS_CONFIG.PENDING;
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <tr key={profile.id} className="border-b border-white/10 hover:bg-white/5 transition">
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-medium">
                                                        {profile.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-white">
                                                        {profile.user?.name || 'Unknown'}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {profile.user?.email || 'No email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-white">{profile.brandName || profile.stageName}</td>
                                        <td className="p-4 text-white">{profile.roles || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.borderColor} ${statusConfig.bgColor} ${statusConfig.color}`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-400">
                                            {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                onClick={() => handleViewDetails(profile.id)}
                                                color="blue"
                                                size="sm"
                                                className="px-4 py-2"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
