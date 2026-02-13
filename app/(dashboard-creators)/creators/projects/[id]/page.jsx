'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    ArrowLeft,
    Music,
    User,
    Clock,
    FileAudio,
    Download,
    Upload,
    Send,
    CheckCircle2,
    AlertCircle,
    Info,
    Tags,
    Save,
    Lock,
    Zap,
    RefreshCw,
    MoreHorizontal
} from 'lucide-react';

import Modal from '@/components/Modal';
import { openNotification } from '@/utils/open-notification';
import ProjectChat from '@/components/ProjectChat';

export default function CreatorProjectPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    // Editable Technical Fields
    const [techDetails, setTechDetails] = useState({
        key: '',
        bpm: '',
        timeSignature: '',
        durationSeconds: '',
        recordingQuality: '',
        stemsIncluded: false,
        vocalTracksCount: '',
        instrumentalType: '',
        notes: ''
    });

    const [internalNotes, setInternalNotes] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            if (session?.user?.id && params.id) {
                try {
                    const res = await fetch(`/api/creators/projects/${params.id}`);
                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.error || 'Failed to load project');
                    }

                    setProject(data.project);

                    // Initialize state
                    if (data.project) {
                        setTechDetails({
                            key: data.project.key || '',
                            bpm: data.project.bpm || '',
                            timeSignature: data.project.timeSignature || '',
                            durationSeconds: data.project.durationSeconds || '',
                            recordingQuality: data.project.recordingQuality || '',
                            stemsIncluded: data.project.stemsIncluded || false,
                            vocalTracksCount: data.project.vocalTracksCount || '',
                            instrumentalType: data.project.instrumentalType || '',
                            notes: data.project.notes || ''
                        });
                        setInternalNotes(data.project.internalNotes || '');
                    }

                } catch (err) {
                    console.error(err);
                    setError(err.message);
                    openNotification('error', err.message);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProject();
    }, [params.id, session]);

    const handleSaveTechnicalDetails = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/creators/projects/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...techDetails,
                    internalNotes
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save');

            openNotification('success', 'Project details saved successfully');

            // Update local project state to reflect changes if needed
            setProject(prev => ({ ...prev, ...techDetails, internalNotes }));

        } catch (err) {
            console.error(err);
            openNotification('error', 'Failed to save details');
        } finally {
            setSaving(false);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('label', 'Deliverable');

        try {
            const res = await fetch(`/api/creators/projects/${params.id}/files`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            openNotification('success', 'File uploaded successfully');

            // Refresh project data to show new file
            // Ideally we'd just append to state, but fetching ensures sync
            const projectRes = await fetch(`/api/creators/projects/${params.id}`);
            const projectData = await projectRes.json();
            if (projectData.project) setProject(projectData.project);

        } catch (err) {
            console.error(err);
            openNotification('error', err.message);
        } finally {
            setUploading(false);
            e.target.value = null; // Reset input
        }
    };

    const handleFileUploadClick = () => {
        document.getElementById('file-upload-input').click();
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            const res = await fetch(`/api/creators/projects/${params.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Status update failed');

            openNotification('success', `Status updated to ${newStatus}`);
            setProject(prev => ({ ...prev, currentPhase: newStatus })); // Optimistic-ish update

        } catch (err) {
            console.error(err);
            openNotification('error', err.message);
        }
    };

    if (loading)
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-indigo-500 rounded-full" />
            </div>
        );

    if (error || !project)
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white p-8">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );

    return (
        <>
            <div className="grid grid-cols-12 gap-6 lg:mr-[400px] text-white min-h-screen">

                {/* 1. HEADER */}
                <div className="col-span-12">
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
                        </button>

                        <div className="bg-gradient-to-r from-gray-900 via-zinc-900 to-black border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 text-xs rounded-full border uppercase font-bold tracking-wider ${project.currentPhase === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                project.currentPhase === 'IN_REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    project.currentPhase === 'CHANGES_REQUESTED' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                        project.currentPhase === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                            'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                            }`}>
                                            {project.currentPhase?.replace('_', ' ') || 'IN PROGRESS'}
                                        </span>
                                        <span className="text-gray-500 text-sm flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Due: <span className="text-white">{project.deliveryDeadline ? new Date(project.deliveryDeadline).toLocaleDateString() : 'N/A'}</span>
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-white mb-1">{project.projectName}</h1>
                                    <p className="text-gray-400 flex items-center gap-2">
                                        <User className="w-4 h-4" /> {project.artistName} • <Music className="w-4 h-4" /> {project.projectType}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    {/* Placeholder for top-right actions if needed */}
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* STATUS & QUICK STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="md:col-span-2 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-xl p-5 backdrop-blur-sm">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-400" /> Project Workspace
                            </h3>
                            <p className="text-gray-300 text-sm">
                                You are the assigned creator. Manage files, update status, and communicate with the artist here.
                            </p>
                        </div>
                        {/* Tier Summary Card */}
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" /> Tier Specs
                            </h3>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white font-bold text-lg">{project.tier}</span>
                                <span className={`text-xs px-2 py-1 rounded border ${project.tier === 'PLATINUM' ? 'bg-cyan-900/20 text-cyan-400 border-cyan-800' :
                                        project.tier === 'GOLD' ? 'bg-amber-900/20 text-amber-400 border-amber-800' :
                                            'bg-zinc-800 text-gray-300 border-zinc-700'
                                    }`}>{project.projectType}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Revs: <span className="text-white font-bold">{project.revisionCount ?? 0}</span> / {project.revisionLimit ?? project.tierDetails?.numberOfRevisions ?? '∞'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LEFT COLUMN: Main Content */}
                <div className="col-span-12 lg:col-span-7 space-y-6">

                    {/* 2. CLIENT INFO */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center gap-4 bg-zinc-800/40 p-4 rounded-xl border border-zinc-800/50">
                            {project.user?.image ? (
                                <img src={project.user.image} className="w-12 h-12 rounded-full border-2 border-zinc-700 object-cover" alt={project.user.name} />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700">
                                    <User className="w-6 h-6 text-gray-400" />
                                </div>
                            )}
                            <div>
                                <p className="text-white font-bold text-lg">{project.user?.name || 'Unknown Client'}</p>
                                <p className="text-gray-400 text-sm">{project.user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. PROJECT BRIEF */}
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

                            {/* Checklist */}
                            {project.serviceRequest?.acceptance?.checklistItems?.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Client Checklist</h3>
                                    <div className="bg-zinc-800/40 p-5 rounded-xl border border-zinc-800/50 space-y-3">
                                        {project.serviceRequest.acceptance.checklistItems.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 text-sm text-gray-300 items-start">
                                                <div className="mt-0.5 min-w-[16px]">
                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                </div>
                                                <span className="leading-snug">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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

                    {/* 4. SELECTED ADD-ONS */}
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
                </div>

                {/* RIGHT COLUMN: Actions & Tech Specs */}
                <div className="col-span-12 lg:col-span-5 space-y-6">

                    {/* ACTIONS CARD */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Project Actions</h2>

                        {/* HiddenFileInput */}
                        <input
                            type="file"
                            id="file-upload-input"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                                onClick={handleFileUploadClick}
                                disabled={uploading}
                                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed h-24"
                            >
                                <Upload className={`w-6 h-6 text-indigo-400 ${uploading ? 'animate-bounce' : ''}`} />
                                <span className="text-sm text-white font-medium">{uploading ? 'Uploading...' : 'Upload Deliverable'}</span>
                            </button>
                            <button
                                onClick={() => setStatusModalOpen(true)}
                                disabled={project.currentPhase === 'IN_REVIEW' || project.currentPhase === 'COMPLETED' || project.currentPhase === 'CANCELLED'}
                                className={`rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed h-24 border ${project.currentPhase === 'IN_REVIEW' ? 'bg-amber-900/20 border-amber-800/50' : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700'
                                    }`}
                            >
                                <Send className={`w-6 h-6 ${project.currentPhase === 'IN_REVIEW' ? 'text-amber-500' : 'text-green-500'}`} />
                                <span className="text-sm text-white font-medium">
                                    {project.currentPhase === 'IN_REVIEW' ? 'In Review' :
                                        project.currentPhase === 'COMPLETED' ? 'Completed' :
                                            project.currentPhase === 'CANCELLED' ? 'Cancelled' :
                                                'Send for Review'}
                                </span>
                            </button>
                        </div>

                        {/* Deliverables List */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Deliverables</h3>
                            </div>

                            {project.files && project.files.length > 0 ? (
                                <div className="space-y-2">
                                    {project.files.map((file) => (
                                        <div key={file.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-zinc-800 rounded-lg">
                                                    <FileAudio className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-medium truncate max-w-[150px]">{file.fileName}</p>
                                                    <p className="text-[10px] text-gray-500">{(file.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                                                </div>
                                            </div>
                                            <a href={file.filePath} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white p-2">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 border-2 border-dashed border-zinc-800 rounded-lg bg-zinc-900/20">
                                    <p className="text-xs text-gray-500 italic">No deliverables uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. TECHNICAL CONFIGURATION (EDITABLE) */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Music className="w-5 h-5 text-indigo-400" /> Technical Details
                            </h2>
                            <button
                                onClick={handleSaveTechnicalDetails}
                                disabled={saving}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-900/20"
                            >
                                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">BPM</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.bpm}
                                        onChange={(e) => setTechDetails({ ...techDetails, bpm: e.target.value ? parseInt(e.target.value) : '' })}
                                        placeholder="120"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key</label>
                                    <input
                                        type="text"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.key}
                                        onChange={(e) => setTechDetails({ ...techDetails, key: e.target.value })}
                                        placeholder="C Minor"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time Sig</label>
                                    <input
                                        type="text"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.timeSignature}
                                        onChange={(e) => setTechDetails({ ...techDetails, timeSignature: e.target.value })}
                                        placeholder="4/4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (s)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.durationSeconds}
                                        onChange={(e) => setTechDetails({ ...techDetails, durationSeconds: e.target.value ? parseInt(e.target.value) : '' })}
                                        placeholder="180"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recording Quality</label>
                                <select
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                    value={techDetails.recordingQuality}
                                    onChange={(e) => setTechDetails({ ...techDetails, recordingQuality: e.target.value })}
                                >
                                    <option value="" className="text-gray-500">Select Quality...</option>
                                    <option value="DEMO">Demo / Home Recording</option>
                                    <option value="PROFESSIONAL">Professional / Semi-Pro</option>
                                    <option value="STUDIO">High-End Studio</option>
                                </select>
                            </div>

                            <label className="flex items-center gap-3 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 cursor-pointer hover:bg-zinc-950 transition-colors group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="stemsIncluded"
                                        checked={techDetails.stemsIncluded}
                                        onChange={(e) => setTechDetails({ ...techDetails, stemsIncluded: e.target.checked })}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-zinc-600 bg-zinc-900 transition-all checked:border-indigo-500 checked:bg-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <CheckCircle2 className="pointer-events-none absolute left-0 top-0 h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                </div>
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">Stems Included / Available?</span>
                            </label>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Technical Notes</label>
                                <textarea
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 h-24 resize-none placeholder-zinc-700"
                                    value={techDetails.notes}
                                    onChange={(e) => setTechDetails({ ...techDetails, notes: e.target.value })}
                                    placeholder="Any generic notes about the production..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* 6. INTERNAL NOTES (CREATOR ONLY) */}
                    <div className="bg-amber-950/10 border border-amber-900/30 rounded-xl p-5 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 px-3 py-1 bg-amber-950/40 border-b border-l border-amber-900/30 rounded-bl-lg text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm">
                            <Lock className="w-3 h-3" /> Internal Only
                        </div>
                        <h2 className="text-sm font-bold text-amber-500 mb-3 flex items-center gap-2 uppercase tracking-wide">
                            Internal Notes
                        </h2>
                        <textarea
                            className="w-full bg-amber-950/20 border border-amber-900/30 rounded-lg px-4 py-3 text-amber-100 text-sm focus:outline-none focus:border-amber-700 focus:bg-amber-950/30 h-32 placeholder-amber-500/30 resize-none transition-all"
                            value={internalNotes}
                            onChange={(e) => setInternalNotes(e.target.value)}
                            placeholder="Private notes only visible to you..."
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleSaveTechnicalDetails}
                                disabled={saving}
                                className="px-3 py-1.5 bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/50 hover:border-amber-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save Notes'}
                            </button>
                        </div>
                    </div>

                </div>

            </div>

            {/* FIXED CHAT SIDEBAR (UNCHANGED) */}
            <div className="fixed top-24 right-6 h-[85vh] w-[380px] z-50 pointer-events-auto shadow-2xl rounded-2xl overflow-hidden border border-zinc-800 hidden lg:block bg-zinc-900">
                <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-900 to-black z-[-1]" />
                <ProjectChat project={project} currentUser={session?.user} />
            </div>

            {/* SPACER FOR MOBILE */}
            <div className="h-24 lg:hidden"></div>

            <Modal open={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Send for Review">
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Are you sure you want to change status to <span className="text-white font-bold">IN REVIEW</span>?
                        <br />
                        This will notify the client that the project is ready for review.
                    </p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setStatusModalOpen(false)}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                handleStatusUpdate('IN_REVIEW');
                                setStatusModalOpen(false);
                            }}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            Confirm & Send
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
