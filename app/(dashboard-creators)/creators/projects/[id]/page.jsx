'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft, Music, User, Calendar, Clock, FileAudio, Download,
    Upload, Send, CheckCircle2, MessageSquare, AlertCircle,
    MoreHorizontal, PlayCircle
} from 'lucide-react';
import { openNotification } from '@/utils/open-notification';

export default function CreatorProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Fetch Project Data
    useEffect(() => {
        if (session?.user?.id && params.id) {
            fetchProject();
        }
    }, [params.id, session]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/creators/projects/${params.id}`);
            if (!res.ok) throw new Error('Failed to load project');
            const data = await res.json();
            setProject(data.project);
        } catch (error) {
            console.error(error);
            openNotification('error', 'Error loading project details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus, message = '') => {
        try {
            const res = await fetch(`/api/creators/projects/${params.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus, message })
            });
            if (!res.ok) throw new Error('Failed to update status');

            openNotification('success', `Project status updated to ${newStatus}`);
            fetchProject(); // Refresh
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

            const res = await fetch(`/api/creators/projects/${params.id}/files`, {
                method: 'POST',
                body: JSON.stringify({
                    name: fileData.name,
                    url: 'https://example.com/mock-file.mp3', // Mock URL
                    mimeType: 'audio/mpeg',
                    size: 1024 * 1024 * 5, // 5MB mock
                    category: 'DEMO' // Default for now
                })
            });

            if (!res.ok) throw new Error('Upload failed');

            openNotification('success', 'File uploaded successfully');
            fetchProject();
        } catch (error) {
            openNotification('error', 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-white flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div></div>;
    if (!project) return <div className="p-8 text-white">Project not found</div>;

    return (
        <div className="min-h-screen bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8 md:ml-64">
            {/* Note: md:ml-64 is assuming sidebar width, adjust based on layout */}

            {/* Back & Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </button>

                <div className="bg-gradient-to-r from-gray-900 via-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status)}`}>
                                    {project.status.replace('_', ' ')}
                                </span>
                                <span className="text-gray-500 text-sm flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Due in 5 days
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">{project.projectName}</h1>
                            <p className="text-gray-400 max-w-2xl">{project.description || 'No description provided.'}</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-sm text-gray-400">Client</p>
                                <p className="font-semibold text-white">{project.user?.name}</p>
                            </div>
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
                {/* Main Content: Files & Workspace */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Acceptance Section - Only if IN_REVIEW or PENDING */}
                    {['IN_REVIEW', 'PENDING'].includes(project.status) && (
                        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm shadow-xl animate-pulse-glow">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    New Project Request
                                </h3>
                                <p className="text-gray-300">
                                    You have been matched with this project. Review the details and accept to start working.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleStatusUpdate('REJECTED', 'Creator declined the project')}
                                    className="px-6 py-3 rounded-xl border border-gray-600 hover:bg-gray-800 text-gray-300 font-semibold transition-all"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate('ACCEPTED', 'Creator accepted the project')}
                                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Accept Project
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Center - Only if Active */}
                    {['ACCEPTED', 'IN_PROGRESS', 'UNDER_REVIEW', 'REVISION_REQUESTED'].includes(project.status) && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => document.getElementById('file-upload').click()}
                                disabled={uploading}
                                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 group transition-all"
                            >
                                <div className="p-3 bg-indigo-500/10 rounded-full group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-indigo-400" />
                                </div>
                                <span className="text-gray-300 font-medium text-sm">Upload Deliverable</span>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files[0]) handleFileUpload({ name: e.target.files[0].name });
                                    }}
                                />
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
                    )}

                    {/* Files Section */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <FileAudio className="w-5 h-5 text-indigo-400" /> Project Files
                        </h2>

                        <div className="space-y-3">
                            {project.files?.map((file) => (
                                <div key={file.id} className="flex items-center justify-between bg-black/20 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
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
                            ))}
                            {(!project.files || project.files.length === 0) && (
                                <p className="text-center text-gray-500 py-8">No files uploaded yet.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Sidebar: Details & Timeline */}
                <div className="space-y-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Project Info</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                <span className="text-gray-500">Service</span>
                                <span className="text-white font-medium">{project.services}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                <span className="text-gray-500">Tier</span>
                                <span className="text-amber-400 font-bold">{project.tier}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                <span className="text-gray-500">Type</span>
                                <span className="text-white">{project.projectType}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Activity</h2>
                        <div className="space-y-6 relative ml-2">
                            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-zinc-800" />
                            {project.events?.map((event) => (
                                <div key={event.id} className="relative pl-6">
                                    <div className="absolute left-0 top-1 w-3.5 h-3.5 bg-zinc-900 border-2 border-indigo-500 rounded-full" />
                                    <p className="text-sm text-gray-300 font-medium">{event.description}</p>
                                    <p className="text-xs text-gray-600 mt-1">{new Date(event.createdAt).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getStatusColor(status) {
    const map = {
        PENDING: 'text-gray-400 border-gray-600 bg-gray-500/10',
        ACCEPTED: 'text-blue-400 border-blue-600 bg-blue-500/10',
        IN_PROGRESS: 'text-indigo-400 border-indigo-600 bg-indigo-500/10',
        IN_REVIEW: 'text-purple-400 border-purple-600 bg-purple-500/10', // Added IN_REVIEW
        UNDER_REVIEW: 'text-amber-400 border-amber-600 bg-amber-500/10',
        COMPLETED: 'text-emerald-400 border-emerald-600 bg-emerald-500/10',
        CANCELLED: 'text-red-400 border-red-600 bg-red-500/10',
        PAID: 'text-cyan-400 border-cyan-600 bg-cyan-500/10',
    };
    return map[status] || 'text-gray-400';
}
