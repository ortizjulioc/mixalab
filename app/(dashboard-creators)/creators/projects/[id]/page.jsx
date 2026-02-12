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
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Fetch Project Data and Tiers
    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id && params.id) {
                try {
                    // Fetch project first to handle 403/404 explicitly
                    const res = await fetch(`/api/creators/projects/${params.id}`);
                    const projectRes = await res.json();

                    if (!res.ok) {
                        throw new Error(projectRes.error || 'Failed to load project');
                    }

                    const tiersRes = await fetch('/api/tiers').then(r => r.json());

                    if (projectRes.project) {
                        // Fix for services being a string (enum) instead of array
                        const fixedProject = { ...projectRes.project };
                        if (fixedProject.services && !Array.isArray(fixedProject.services)) {
                            // Convert single enum string to array of objects for UI compatibility
                            fixedProject.services = [{ type: fixedProject.services }];
                        }
                        setProject(fixedProject);
                    }

                    if (tiersRes.tiers) setTiers(tiersRes.tiers);
                } catch (error) {
                    console.error(error);
                    setError(error.message);
                    openNotification('error', error.message);
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

    if (error || !project) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 text-white">
            <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
                <p className="text-gray-400 mb-6">{error || "The project you are looking for does not exist or you don't have permission to view it."}</p>
                <button onClick={() => router.back()} className="px-4 py-2 bg-zinc-800 rounded-lg text-white hover:bg-zinc-700 transition-colors">Go Back</button>
            </div>
        </div>
    );

    const currentTierInfo = tiers.find(t => t.name === project.tier);

    return (
        <>
            <div className="grid grid-cols-12 gap-6 lg:pr-[420px]">
                {/* Back & Header */}
                <div className="col-span-12">
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </button>

                        <div className="bg-gradient-to-r from-gray-900 via-zinc-900 to-black border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status || 'IN_PROGRESS')}`}>
                                            {(project.status || 'IN_PROGRESS').replace('_', ' ')}
                                        </span>
                                        <span className="text-gray-500 text-sm flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Due in 5 days
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white mb-2">{project.projectName}</h1>
                                    <p className="text-gray-400 max-w-2xl">Client: {project.user?.name} • {project.tier} Tier</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {project.user?.image ? (
                                        <img src={project.user.image} className="w-12 h-12 rounded-full border-2 border-zinc-700" alt="Client" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center border-2 border-zinc-600">
                                            <User className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Action Center - Creator Specific */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => document.getElementById('file-upload-creator').click()}
                                    disabled={uploading}
                                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group transition-all"
                                >
                                    <div className="p-3 bg-indigo-500/10 rounded-full group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <span className="text-gray-300 font-medium text-sm">Upload Deliverable</span>
                                </button>

                                <button
                                    onClick={() => handleStatusUpdate('UNDER_REVIEW', 'Sent initial demo for review')}
                                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group transition-all"
                                >
                                    <div className="p-3 bg-amber-500/10 rounded-full group-hover:scale-110 transition-transform">
                                        <Send className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <span className="text-gray-300 font-medium text-sm">Send for Review</span>
                                </button>

                                <button
                                    onClick={() => handleStatusUpdate('COMPLETED', 'Final files delivered')}
                                    className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group transition-all"
                                >
                                    <div className="p-3 bg-emerald-500/10 rounded-full group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <span className="text-gray-300 font-medium text-sm">Mark Complete</span>
                                </button>
                            </div>

                            {/* Files Section */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <FileAudio className="w-5 h-5 text-indigo-400" /> Project Files
                                    </h2>
                                    <input
                                        type="file"
                                        id="file-upload-creator"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files[0]) handleFileUpload({ name: e.target.files[0].name });
                                        }}
                                    />
                                </div>

                                <div className="space-y-3">
                                    {project.files && project.files.length > 0 ? (
                                        project.files.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-zinc-800 rounded-lg">
                                                        <Music className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white">{file.name}</p>
                                                        <p className="text-xs text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <button className="text-indigo-400 hover:text-indigo-300 transition-colors p-2">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
                                            <div className="bg-zinc-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                                <Upload className="w-6 h-6 text-gray-500" />
                                            </div>
                                            <p className="text-gray-400 text-sm">No files uploaded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Services Section */}
                            {project.services && project.services.length > 0 && (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Music className="w-5 h-5 text-indigo-400" /> Services
                                    </h2>
                                    <div className="space-y-3">
                                        {project.services.map((service, idx) => (
                                            <div key={idx} className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50 flex justify-between items-center text-sm">
                                                <span className="text-white font-medium">{service.type}</span>
                                                <span className="text-gray-500 text-xs">Included</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Tier Info Card */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-amber-500" /> Project Specs
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between py-2 border-b border-zinc-800/50 text-sm">
                                        <span className="text-gray-500">Tier Level</span>
                                        <span className={`font-bold ${project.tier === 'PLATINUM' ? 'text-cyan-400' :
                                                project.tier === 'GOLD' ? 'text-yellow-400' :
                                                    project.tier === 'SILVER' ? 'text-gray-300' :
                                                        'text-orange-400'
                                            }`}>{project.tier}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-zinc-800/50 text-sm">
                                        <span className="text-gray-500">Delivery Time</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-gray-400" />
                                            <span className="text-white">
                                                {project.tierDetails?.deliveryDays || currentTierInfo?.deliveryDays || 'N/A'} Days
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-zinc-800/50 text-sm">
                                        <span className="text-gray-500">Revisions</span>
                                        <div className="flex items-center gap-1">
                                            <RefreshCw className="w-3 h-3 text-gray-400" />
                                            <span className="text-white">
                                                {project.tierDetails?.numberOfRevisions !== undefined ? project.tierDetails.numberOfRevisions : (currentTierInfo?.numberOfRevisions || 'Unlimited')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-zinc-800/50 text-sm">
                                        <span className="text-gray-500">Type</span>
                                        <span className="text-white">{project.projectType}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-zinc-800/50 text-sm">
                                        <span className="text-gray-500">Genre</span>
                                        <span className="text-white">{project.genre || 'Not specified'}</span>
                                    </div>
                                    <div className="flex justify-between py-2 text-sm">
                                        <span className="text-gray-500">BPM</span>
                                        <span className="text-white">{project.bpm || 'Not specified'}</span>
                                    </div>
                                </div>

                                {/* Service Features from Tier Details */}
                                {project.tierDetails?.serviceDescriptions && project.services?.[0]?.type && (
                                    <div className="mt-6 pt-6 border-t border-zinc-800/50">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                            {project.tierDetails.serviceDescriptions[project.services[0].type]?.title || 'Package Features'}
                                        </h3>
                                        <div className="space-y-3">
                                            {project.tierDetails.serviceDescriptions[project.services[0].type]?.features?.map((feature, idx) => (
                                                <div key={idx} className="flex gap-2 text-sm">
                                                    <span className="text-green-400 font-bold">✓</span>
                                                    <div>
                                                        <span className="text-white font-medium block">{feature.title}</span>
                                                        <span className="text-gray-500 text-xs block">{feature.desc}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Client Info Card */}
                            {project.user && (
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <User className="w-4 h-4 text-indigo-400" /> Client
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        {project.user.image ? (
                                            <img src={project.user.image} className="w-10 h-10 rounded-full" alt="User" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-semibold text-white">{project.user.name}</p>
                                            <p className="text-xs text-gray-500">{project.user.email}</p>
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
