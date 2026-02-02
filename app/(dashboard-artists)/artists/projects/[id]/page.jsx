'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft, Music, Calendar, Clock, FileAudio, Download,
    CheckCircle2, User
} from 'lucide-react';
import { openNotification } from '@/utils/open-notification';

export default function ArtistProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch Project Data
    useEffect(() => {
        if (session?.user?.id && params.id) {
            fetchProject();
        }
    }, [params.id, session]);

    const fetchProject = async () => {
        try {
            const res = await fetch(`/api/artists/projects/${params.id}`);
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

    return (
        <div className="min-h-screen bg-zinc-950 px-4 sm:px-6 lg:px-8 py-8 md:ml-64">
            {/* Back & Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.push('/artists/my-requests')}
                    className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Requests
                </button>

                <div className="bg-gradient-to-r from-gray-900 via-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold border text-indigo-400 border-indigo-600 bg-indigo-500/10">
                                    IN PROGRESS (Simulated)
                                </span>
                                <span className="text-gray-500 text-sm flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Started: {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">{project.projectName}</h1>
                            <p className="text-gray-400 max-w-2xl">Artist: {project.artistName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Status Banner */}
                    <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6 text-green-400" /> Project Active
                        </h3>
                        <p className="text-gray-300">
                            Your project has been kicked off. The creator will begin working on your files shortly. You will be notified when updates are available.
                        </p>
                    </div>

                    {/* Services Section */}
                    {project.services && project.services.length > 0 && (
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Music className="w-5 h-5 text-indigo-400" /> Services Included
                            </h2>
                            <div className="space-y-3">
                                {project.services.map(service => (
                                    <div key={service.id} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 flex justify-between items-center">
                                        <span className="text-white font-medium">{service.type}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Files Section (Example) */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <FileAudio className="w-5 h-5 text-indigo-400" /> Project Files
                        </h2>

                        <div className="space-y-3">
                            <p className="text-center text-gray-500 py-8">No files delivered yet.</p>
                        </div>
                    </div>

                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Project Details</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                <span className="text-gray-500">Tier</span>
                                <span className="text-amber-400 font-bold">{project.tier}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                <span className="text-gray-500">Type</span>
                                <span className="text-white">{project.projectType}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                <span className="text-gray-500">Genre</span>
                                <span className="text-white">{project.genre || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-800/50">
                                <span className="text-gray-500">BPM</span>
                                <span className="text-white">{project.bpm || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
