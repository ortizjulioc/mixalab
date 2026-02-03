'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft, Music, User, Calendar, Clock, FileAudio, Download,
    Upload, Send, CheckCircle2, MessageSquare, AlertCircle,
    MoreHorizontal, PlayCircle, Info, RefreshCw
} from 'lucide-react';
import { openNotification } from '@/utils/open-notification';
import ProjectChat from '@/components/ProjectChat';

export default function CreatorProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState(null);
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Fetch Project Data and Tiers
    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id && params.id) {
                try {
                    const [projectRes, tiersRes] = await Promise.all([
                        fetch(`/api/creators/projects/${params.id}`).then(res => res.json()),
                        fetch('/api/tiers').then(res => res.json())
                    ]);

                    if (projectRes.project) setProject(projectRes.project);
                    if (tiersRes.tiers) setTiers(tiersRes.tiers);
                } catch (error) {
                    console.error(error);
                    openNotification('error', 'Error loading project details');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [params.id, session]);

    const handleStatusUpdate = async (newStatus, message = '') => {
        try {
            // Note: API might need update to support status change on Project model if different from ServiceRequest
            // For now, assuming API handles it or we use the old endpoint pattern if needed.
            // But we switched to Project model. Project model might not have status field accessible this way.
            // Ideally we would PUT to /api/creators/projects/[id].
            openNotification('info', `Status update to ${newStatus} (Simulation)`);

            // Re-fetch or update local state
        } catch (error) {
            console.error(error);
            openNotification('error', 'Failed to update status');
        }
    };

    const handleFileUpload = async (fileData) => {
        setUploading(true);
        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            openNotification('success', 'File uploaded successfully (Simulation)');
        } catch (error) {
            openNotification('error', 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );

    if (!project) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
                <button onClick={() => router.back()} className="text-indigo-400 hover:text-indigo-300">Go Back</button>
            </div>
        </div>
    );

    const currentTierInfo = tiers.find(t => t.name === project.tier);

    return (
        <>
            <div className="grid grid-cols-12 gap-6 lg:pr-[420px]">
                {/* Back & Header */}
                <div className="col-span-12">

                    {/* ===================== HEADER ===================== */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </button>

                        <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-zinc-900 to-black border border-zinc-800 rounded-xl p-6">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                {/* Project Info */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                                                project.status || 'IN_PROGRESS'
                                            )}`}
                                        >
                                            {(project.status || 'IN_PROGRESS').replace('_', ' ')}
                                        </span>

                                        <span className="text-gray-500 text-sm flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Due in 5 days
                                        </span>
                                    </div>

                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        {project.projectName}
                                    </h1>

                                    <p className="text-gray-400">
                                        Client: {project.user?.name} • {project.tier} Tier
                                    </p>
                                </div>

                                {/* Client Avatar */}
                                <div className="flex items-center">
                                    {project.user?.image ? (
                                        <img
                                            src={project.user.image}
                                            alt="Client"
                                            className="w-12 h-12 rounded-full border-2 border-zinc-700"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center border-2 border-zinc-600">
                                            <User className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===================== MAIN GRID ===================== */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* ===================== MAIN CONTENT ===================== */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Action Center */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Upload */}
                                <button
                                    onClick={() => document.getElementById('file-upload-creator').click()}
                                    disabled={uploading}
                                    className="action-card"
                                >
                                    <div className="icon-wrapper bg-indigo-500/10">
                                        <Upload className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <span>Upload Deliverable</span>
                                </button>

                                {/* Review */}
                                <button
                                    onClick={() =>
                                        handleStatusUpdate('UNDER_REVIEW', 'Sent initial demo for review')
                                    }
                                    className="action-card"
                                >
                                    <div className="icon-wrapper bg-amber-500/10">
                                        <Send className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <span>Send for Review</span>
                                </button>

                                {/* Complete */}
                                <button
                                    onClick={() =>
                                        handleStatusUpdate('COMPLETED', 'Final files delivered')
                                    }
                                    className="action-card"
                                >
                                    <div className="icon-wrapper bg-emerald-500/10">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <span>Mark Complete</span>
                                </button>
                            </div>

                            {/* Files */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                <h2 className="section-title">
                                    <FileAudio className="w-5 h-5 text-indigo-400" />
                                    Project Files
                                </h2>

                                <input
                                    type="file"
                                    id="file-upload-creator"
                                    className="hidden"
                                    onChange={(e) =>
                                        e.target.files?.[0] &&
                                        handleFileUpload({ name: e.target.files[0].name })
                                    }
                                />

                                <div className="space-y-3">
                                    {project.files?.length ? (
                                        project.files.map((file) => (
                                            <div key={file.id} className="file-row">
                                                <div className="flex items-center gap-3">
                                                    <div className="file-icon">
                                                        <Music className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{file.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(file.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Download className="w-4 h-4 text-indigo-400" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <Upload className="w-6 h-6 text-gray-500" />
                                            <p>No files uploaded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Services */}
                            {project.services?.length > 0 && (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                    <h2 className="section-title">
                                        <Music className="w-5 h-5 text-indigo-400" />
                                        Services
                                    </h2>

                                    <div className="space-y-3">
                                        {project.services.map((service, idx) => (
                                            <div key={idx} className="service-row">
                                                <span>{service.type}</span>
                                                <span className="text-xs text-gray-500">Included</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ===================== SIDEBAR ===================== */}
                        <div className="space-y-6">

                            {/* Project Specs */}
                            <div className="sidebar-card">
                                <h2 className="sidebar-title">
                                    <Info className="w-4 h-4 text-amber-500" />
                                    Project Specs
                                </h2>

                                <Spec label="Tier" value={project.tier} highlight />
                                <Spec label="Delivery" value={`${currentTierInfo?.deliveryDays || 'N/A'} Days`} />
                                <Spec label="Revisions" value={currentTierInfo?.numberOfRevisions || 'Unlimited'} />
                                <Spec label="Type" value={project.projectType} />
                                <Spec label="Genre" value={project.genre || 'N/A'} />
                                <Spec label="BPM" value={project.bpm || 'N/A'} />
                            </div>

                            {/* Client */}
                            {project.user && (
                                <div className="sidebar-card">
                                    <h2 className="sidebar-title">
                                        <User className="w-4 h-4 text-indigo-400" />
                                        Client
                                    </h2>

                                    <div className="flex items-center gap-4">
                                        {project.user.image ? (
                                            <img src={project.user.image} className="w-10 h-10 rounded-full" />
                                        ) : (
                                            <div className="avatar-fallback">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {project.user.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {project.user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


            </div>
            {/* Fixed Chat */}
            <div
                className="
                          fixed
                          top-25
                          right-6
                          h-[calc(90vh-3rem)]
                          w-[360px]
                          xl:w-[380px]
                          2xl:w-[420px]
                          z-50
                        "

            >
                <ProjectChat project={project} currentUser={session?.user} />
            </div>
        </>
    );
}

function getStatusColor(status) {
    const map = {
        PENDING: 'text-gray-400 border-gray-600 bg-gray-500/10',
        ACCEPTED: 'text-blue-400 border-blue-600 bg-blue-500/10',
        IN_PROGRESS: 'text-indigo-400 border-indigo-600 bg-indigo-500/10',
        IN_REVIEW: 'text-purple-400 border-purple-600 bg-purple-500/10',
        UNDER_REVIEW: 'text-amber-400 border-amber-600 bg-amber-500/10',
        COMPLETED: 'text-emerald-400 border-emerald-600 bg-emerald-500/10',
        CANCELLED: 'text-red-400 border-red-600 bg-red-500/10',
        PAID: 'text-cyan-400 border-cyan-600 bg-cyan-500/10',
    };
    return map[status] || 'text-gray-400';
}
