'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft, Music, Calendar, Clock, FileAudio, Download,
    CheckCircle2, User, Upload, Info, RefreshCw, Zap
} from 'lucide-react';
import { openNotification } from '@/utils/open-notification';
import ProjectChat from '@/components/ProjectChat';

import useProjectDetails from '@/hooks/useProjectDetails';

export default function ArtistProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    // Use the new hook to fetch project details (works for ARTIST and CREATOR)
    const { project, loading: projectLoading, error: projectError } = useProjectDetails(params.id);

    const [tiers, setTiers] = useState([]);
    const [tiersLoading, setTiersLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Fetch Tiers separately
    useEffect(() => {
        const fetchTiers = async () => {
            try {
                const res = await fetch('/api/tiers');
                const data = await res.json();
                if (data.tiers) setTiers(data.tiers);
            } catch (error) {
                console.error("Error fetching tiers:", error);
            } finally {
                setTiersLoading(false);
            }
        };
        fetchTiers();
    }, []);

    const loading = projectLoading || tiersLoading;

    if (projectError) {
        // Handle error state gracefully or let the user try again
        // For now, we can just log it or show the error message in the UI if desired
        console.error("Project Error:", projectError);
    }

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
                {/* Back & Header & Main Content */}
                <div className="col-span-12">
                    <div className="mb-6">
                        <button
                            onClick={() => router.push('/artists/my-requests')}
                            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to My Requests
                        </button>

                        <div className="bg-gradient-to-r from-gray-900 via-zinc-900 to-black border border-zinc-800 rounded-xl p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold border text-indigo-400 border-indigo-600 bg-indigo-500/10">
                                            IN PROGRESS
                                        </span>
                                        <span className="text-gray-500 text-sm flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Started: {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white mb-1">{project.projectName}</h1>
                                    <p className="text-gray-400">Artist: {project.artistName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Status & Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-5 backdrop-blur-sm">
                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" /> Project Active
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Your project has been kicked off. The creator will begin working on your files shortly.
                                </p>
                            </div>
                            {/* Tier Summary Card */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-amber-500" /> Tier Specs
                                </h3>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-bold text-lg">{project.tier}</span>
                                    <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">{project.projectType}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {currentTierInfo?.deliveryDays || 'N/A'} Days</span>
                                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {currentTierInfo?.numberOfRevisions || 'Unlimited'} Revs</span>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Info Grid */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-indigo-400" /> Project Details
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Genre</p>
                                    <p className="text-white font-medium">{project.genre || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">BPM</p>
                                    <p className="text-white font-medium">{project.bpm || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Revisions</p>
                                    <p className="text-white font-medium">{currentTierInfo?.numberOfRevisions || 'Unlimited'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Delivery Time</p>
                                    <p className="text-white font-medium">{currentTierInfo?.deliveryDays || 'N/A'} Days</p>
                                </div>
                            </div>
                        </div>

                        {/* Files Section */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <FileAudio className="w-5 h-5 text-indigo-400" /> Project Files
                                </h2>
                                <button
                                    onClick={() => document.getElementById('file-upload-artist').click()}
                                    disabled={uploading}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors border border-zinc-700"
                                >
                                    {uploading ? <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent" /> : <Upload className="w-4 h-4" />}
                                    Upload File
                                </button>
                                <input
                                    type="file"
                                    id="file-upload-artist"
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
                                        <p className="text-gray-600 text-xs mt-1">Files shared by you or the creator will appear here.</p>
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
                                    {project.services.map(service => (
                                        <div key={service.id} className="p-3 bg-zinc-800/30 rounded-lg border border-zinc-700/50 flex justify-between items-center text-sm">
                                            <span className="text-white font-medium">{service.type}</span>
                                            <span className="text-gray-500 text-xs">Included in Tier</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
