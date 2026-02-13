'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft, Music, Calendar, Clock, FileAudio, Download,
    CheckCircle2, User, Upload, Info, RefreshCw, Zap,
    AlertCircle, XCircle, Loader2, Tags
} from 'lucide-react';
import { openNotification } from '@/utils/open-notification';
import ProjectChat from '@/components/ProjectChat';

import useProjectDetails from '@/hooks/useProjectDetails';

export default function ArtistProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    // Use the new hook to fetch project details (works for ARTIST and CREATOR)
    const { project, loading: projectLoading, error: projectError, refreshProject } = useProjectDetails(params.id);

    const [tiers, setTiers] = useState([]);
    const [tiersLoading, setTiersLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Review Logic
    const [reviewAction, setReviewAction] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

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

    const handleProjectStatusUpdate = async (message) => {
        if (!project?.id || !reviewAction) return;

        setUpdatingStatus(true);
        try {
            const res = await fetch(`/api/creators/projects/${project.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: reviewAction.type,
                    message
                })
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.code === 'REVISION_LIMIT_REACHED') {
                    throw new Error(data.error || "You have reached the revision limit.");
                }
                throw new Error(data.error || "Failed to update project status");
            }

            // Success
            setReviewAction(null);
            refreshProject(); // Refresh project data using SWR mutate from hook
            openNotification('success', `Project marked as ${reviewAction.type === 'COMPLETED' ? 'Completed' : 'Changes Requested'}`);

        } catch (err) {
            console.error(err);
            openNotification('error', err.message);
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
        </div>
    );

    if (projectError) {
        console.error("Project Error:", projectError);
    }

    if (!project) return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8 text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
                <button onClick={() => router.back()} className="text-indigo-400 hover:text-indigo-300">Go Back</button>
            </div>
        </div>
    );

    const currentTierInfo = tiers.find(t => t.name === project.tier);

    // Calculate revisions
    const revisionLimit = project.revisionLimit ?? currentTierInfo?.numberOfRevisions ?? '∞';
    const revisionCount = project.revisionCount ?? 0;

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

                        <div className="bg-gradient-to-r from-gray-900 via-zinc-900 to-black border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${project.currentPhase === 'COMPLETED' ? 'text-emerald-400 border-emerald-600 bg-emerald-500/10' :
                                            project.currentPhase === 'CHANGES_REQUESTED' ? 'text-orange-400 border-orange-600 bg-orange-500/10' :
                                                project.currentPhase === 'IN_REVIEW' ? 'text-amber-400 border-amber-600 bg-amber-500/10' :
                                                    'text-indigo-400 border-indigo-600 bg-indigo-500/10'
                                            }`}>
                                            {project.currentPhase?.replace('_', ' ') || 'IN PROGRESS'}
                                        </span>
                                        <span className="text-gray-500 text-sm flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Started: {new Date(project.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white mb-1">{project.projectName}</h1>
                                    <p className="text-gray-400">Concept by You • <span className="text-indigo-400">{project.projectType}</span></p>
                                </div>
                                <div className="flex gap-3 mt-4 md:mt-0">
                                    <div className="bg-black/40 p-3 rounded-lg border border-zinc-800 text-center min-w-[100px]">
                                        <span className="block text-2xl font-bold text-white">{revisionCount}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Revisions Used</span>
                                    </div>
                                    <div className="bg-black/40 p-3 rounded-lg border border-zinc-800 text-center min-w-[100px]">
                                        <span className="block text-2xl font-bold text-white">{revisionLimit}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Limit</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REVIEW ACTIONS (When Project is IN_REVIEW) */}
                    {project.currentPhase === 'IN_REVIEW' && (
                        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="w-6 h-6 text-amber-500" />
                                <div>
                                    <h3 className="text-lg font-bold text-white">Review Required</h3>
                                    <p className="text-sm text-gray-400">The creator has submitted work for your review.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setReviewAction({ type: 'CHANGES_REQUESTED' })}
                                    className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-5 h-5 text-gray-400" />
                                    Request Revisions
                                </button>
                                <button
                                    onClick={() => setReviewAction({ type: 'COMPLETED' })}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Accept & Complete
                                </button>
                            </div>
                        </div>
                    )}

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
                                </div>
                            </div>
                        </div>


                        {/* PROJECT BRIEF */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <FileAudio className="w-5 h-5 text-indigo-400" /> Project Brief
                            </h2>

                            <div className="space-y-8">
                                {/* Description */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Description</h3>
                                    <div className="bg-zinc-800/40 p-5 rounded-xl text-gray-300 text-sm leading-relaxed whitespace-pre-wrap border border-zinc-800/50">
                                        {project.serviceRequest?.description || 'No description provided.'}
                                    </div>
                                </div>

                                {/* Client Files */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Client Files (Reference)</h3>
                                    {project.serviceRequest?.files?.length > 0 ? (
                                        <div className="grid gap-3">
                                            {project.serviceRequest.files.map((file) => (
                                                <div key={file.id} className="group flex justify-between items-center bg-zinc-800/40 p-4 rounded-xl border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-800 transition-all">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="p-2.5 bg-zinc-900 rounded-lg group-hover:bg-black transition-colors">
                                                            <FileAudio className="w-5 h-5 text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white truncate max-w-[250px]">{file.name}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.extension?.toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <a href={file.url} download target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white hover:bg-zinc-700 p-2 rounded-lg transition-colors">
                                                        <Download className="w-5 h-5" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic p-4 bg-zinc-800/20 rounded-lg border border-dashed border-zinc-800 text-center">No files uploaded by client.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* TECHNICAL CONFIFURATION (READ ONLY) */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Music className="w-5 h-5 text-indigo-400" /> Technical Details
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">BPM</label>
                                        <p className="text-white font-medium">{project.bpm || 'N/A'}</p>
                                    </div>
                                    <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Key</label>
                                        <p className="text-white font-medium">{project.key || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Time Sig</label>
                                        <p className="text-white font-medium">{project.timeSignature || 'N/A'}</p>
                                    </div>
                                    <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</label>
                                        <p className="text-white font-medium">{project.durationSeconds ? `${project.durationSeconds}s` : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Quality</label>
                                        <p className="text-white font-medium">{project.recordingQuality || 'N/A'}</p>
                                    </div>
                                    <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Stems</label>
                                        <p className="text-white font-medium">{project.stemsIncluded ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>
                                <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Technical Notes</label>
                                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{project.notes || 'No notes provided by creator.'}</p>
                                </div>
                            </div>
                        </div>


                        {/* Detailed Info Grid (Genre / Project Type) */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-indigo-400" /> Basic Info
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Genre</p>
                                    <p className="text-white font-medium">{project.genre || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Type</p>
                                    <p className="text-white font-medium">{project.projectType || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Vocal Tracks</p>
                                    <p className="text-white font-medium">{project.vocalTracksCount || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Instrumental</p>
                                    <p className="text-white font-medium">{project.instrumentalType || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* ADD-ONS */}
                        {project.addOnDetails?.length > 0 && (
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Tags className="w-5 h-5 text-indigo-400" /> Selected Add-ons
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {project.addOnDetails.map((addon) => (
                                        <span key={addon.id} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium rounded-lg flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            {addon.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Files Section */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <FileAudio className="w-5 h-5 text-indigo-400" /> All Project Files
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
                                                    <p className="text-sm font-medium text-white">{file.fileName}</p>
                                                    <p className="text-xs text-gray-500">{new Date(file.createdAt).toLocaleDateString()} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <a href={file.filePath} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors p-2">
                                                <Download className="w-4 h-4" />
                                            </a>
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

                    </div>

                </div>

            </div>

            {/* Review Action Modal */}
            {reviewAction && (
                <ReviewModal
                    action={reviewAction}
                    onClose={() => setReviewAction(null)}
                    onConfirm={handleProjectStatusUpdate}
                    loading={updatingStatus}
                />
            )}

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

function ReviewModal({ action, onClose, onConfirm, loading }) {
    const [message, setMessage] = useState("");
    const isRejection = action?.type === 'CHANGES_REQUESTED';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">
                    {isRejection ? 'Request Revisions' : 'Accept & Complete'}
                </h3>
                <p className="text-gray-400 mb-6 text-sm">
                    {isRejection
                        ? 'Please describe exactly what needs to be changed. This will count towards the revision limit.'
                        : 'Are you satisfied with the work? This will mark the project as completed and release payment to the creator.'}
                </p>

                {isRejection && (
                    <textarea
                        className="w-full bg-black/40 border border-zinc-700 rounded-lg p-3 text-white mb-6 focus:outline-none focus:border-amber-500"
                        placeholder="Detailed feedback..."
                        rows={4}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                    />
                )}

                <div className="flex gap-3 justify-end">
                    <button onClick={onClose} disabled={loading} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(message)}
                        disabled={loading || (isRejection && !message.trim())}
                        className={`px-6 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-2 ${isRejection ? 'bg-amber-600 hover:bg-amber-500' : 'bg-emerald-600 hover:bg-emerald-500'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isRejection ? 'Submit Request' : 'Confirm Acceptance'}
                    </button>
                </div>
            </div>
        </div>
    );
}
