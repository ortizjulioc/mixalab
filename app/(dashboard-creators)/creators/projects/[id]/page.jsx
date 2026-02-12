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
    Lock
} from 'lucide-react';

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
        if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

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
            <div className="grid grid-cols-12 gap-6 lg:mr-[400px] p-6 text-white min-h-screen">

                {/* 1. HEADER (READ ONLY) */}
                <div className="col-span-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-400 hover:text-white mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </button>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 text-xs rounded-full border uppercase font-bold tracking-wider ${project.currentPhase === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            project.currentPhase === 'REVIEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                        }`}>
                                        {project.currentPhase?.replace('_', ' ') || 'PRE PRODUCTION'}
                                    </span>
                                    <span className={`px-3 py-1 text-xs rounded-full border uppercase font-bold tracking-wider ${project.tier === 'PLATINUM' ? 'bg-cyan-900/20 text-cyan-400 border-cyan-800' :
                                        project.tier === 'GOLD' ? 'bg-amber-900/20 text-amber-400 border-amber-800' :
                                            'bg-zinc-800 text-gray-300 border-zinc-700'
                                        }`}>
                                        {project.tier}
                                    </span>
                                    <span className="text-gray-400 text-sm flex items-center gap-1 ml-2">
                                        <Clock className="w-3 h-3" /> Due: <span className="text-white">{project.deliveryDeadline ? new Date(project.deliveryDeadline).toLocaleDateString() : 'N/A'}</span>
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{project.projectName}</h1>
                                <p className="text-gray-400 text-lg flex items-center gap-2">
                                    <User className="w-4 h-4" /> {project.artistName} • <Music className="w-4 h-4" /> {project.projectType}
                                </p>
                            </div>

                            {/* Actions / Quick Stats */}
                            <div className="flex gap-3 mt-4 md:mt-0">
                                <div className="bg-black/40 p-3 rounded-lg border border-zinc-800 text-center min-w-[100px]">
                                    <span className="block text-2xl font-bold text-white">{project.revisionCount ?? 0}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Revisions Used</span>
                                </div>
                                <div className="bg-black/40 p-3 rounded-lg border border-zinc-800 text-center min-w-[100px]">
                                    <span className="block text-2xl font-bold text-white">{project.revisionLimit ?? project.tierDetails?.numberOfRevisions ?? '∞'}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Limit</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LEFT COLUMN: Brief, Files, Client (READ ONLY) */}
                <div className="col-span-12 lg:col-span-7 space-y-6">

                    {/* 2. CLIENT INFO (READ ONLY) */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-400" /> Client Info
                        </h2>
                        {project.user ? (
                            <div className="flex items-center gap-4 bg-zinc-800/40 p-4 rounded-xl border border-zinc-800/50">
                                {project.user.image ? (
                                    <img src={project.user.image} className="w-14 h-14 rounded-full border-2 border-zinc-700 object-cover" alt={project.user.name} />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-bold text-lg">{project.user.name}</p>
                                    <p className="text-gray-400 text-sm group-hover:text-indigo-400 transition-colors cursor-pointer">{project.user.email}</p>
                                </div>
                            </div>
                        ) : <p className="text-gray-500">No client info available.</p>}
                    </div>

                    {/* 3. PROJECT BRIEF (READ ONLY) */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
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
                                        {project.serviceRequest.acceptance?.legalName && (
                                            <div className="mt-6 pt-4 border-t border-zinc-700/30 text-xs text-gray-500 flex justify-between">
                                                <span>Signed by: <strong className="text-gray-300">{project.serviceRequest.acceptance.legalName}</strong></span>
                                                <span>Accepted during checkout</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Files */}
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

                    {/* 4. SELECTED ADD-ONS (READ ONLY) */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Tags className="w-5 h-5 text-indigo-400" /> Selected Add-ons
                        </h2>
                        {project.addOnDetails?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {project.addOnDetails.map((addon) => (
                                    <span key={addon.id} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium rounded-lg flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        {addon.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">No add-ons selected.</p>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Technical Config, Internal Notes, Actions */}
                <div className="col-span-12 lg:col-span-5 space-y-6">

                    {/* ACTIONS CARD */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-white mb-4">Project Actions</h2>

                        {/* HiddenFileInput */}
                        <input
                            type="file"
                            id="file-upload-input"
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleFileUploadClick}
                                disabled={uploading}
                                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg p-3 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Upload className={`w-4 h-4 text-indigo-400 ${uploading ? 'animate-bounce' : ''}`} />
                                <span className="text-sm text-white font-medium">{uploading ? 'Uploading...' : 'Upload Deliverable'}</span>
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('REVIEW')}
                                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg p-3 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                            >
                                <Send className="w-4 h-4 text-amber-400" />
                                <span className="text-sm text-white font-medium">Send for Review</span>
                            </button>
                            <button
                                onClick={() => handleStatusUpdate('COMPLETED')}
                                className="col-span-2 bg-emerald-900/10 hover:bg-emerald-900/20 border border-emerald-900/30 rounded-lg p-3 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] group"
                            >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:text-emerald-400" />
                                <span className="text-sm text-emerald-500 group-hover:text-emerald-400 font-bold">Mark Project Complete</span>
                            </button>
                        </div>

                        {/* Deliverables List */}
                        <div className="mt-6 pt-6 border-t border-zinc-800">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Your Deliverables</h3>
                            {project.files && project.files.length > 0 ? (
                                <div className="space-y-2">
                                    {project.files.map((file) => (
                                        <div key={file.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-zinc-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-md">
                                                    <FileAudio className="w-4 h-4 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-medium truncate max-w-[150px]">{file.fileName}</p>
                                                    <p className="text-[10px] text-gray-500">{(file.fileSize / 1024 / 1024).toFixed(1)} MB</p>
                                                </div>
                                            </div>
                                            <a href={file.filePath} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-600 italic text-center py-2">No deliverables uploaded yet.</p>
                            )}
                        </div>
                    </div>

                    {/* 5. TECHNICAL CONFIGURATION (EDITABLE) */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm sticky top-6">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Music className="w-5 h-5 text-indigo-400" /> Technical Details
                            </h2>
                            <button
                                onClick={handleSaveTechnicalDetails}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-900/20"
                            >
                                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">BPM</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.bpm}
                                        onChange={(e) => setTechDetails({ ...techDetails, bpm: e.target.value ? parseInt(e.target.value) : '' })}
                                        placeholder="120"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key</label>
                                    <input
                                        type="text"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.key}
                                        onChange={(e) => setTechDetails({ ...techDetails, key: e.target.value })}
                                        placeholder="C Minor"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time Signature</label>
                                    <input
                                        type="text"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.timeSignature}
                                        onChange={(e) => setTechDetails({ ...techDetails, timeSignature: e.target.value })}
                                        placeholder="4/4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Duration (Sec)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.durationSeconds}
                                        onChange={(e) => setTechDetails({ ...techDetails, durationSeconds: e.target.value ? parseInt(e.target.value) : '' })}
                                        placeholder="180"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Recording Quality</label>
                                <select
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat pr-10"
                                    value={techDetails.recordingQuality}
                                    onChange={(e) => setTechDetails({ ...techDetails, recordingQuality: e.target.value })}
                                >
                                    <option value="" className="text-gray-500">Select Quality...</option>
                                    <option value="DEMO">Demo / Home Recording</option>
                                    <option value="PROFESSIONAL">Professional / Semi-Pro</option>
                                    <option value="STUDIO">High-End Studio</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Vocal Tracks</label>
                                    <input
                                        type="number"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.vocalTracksCount}
                                        onChange={(e) => setTechDetails({ ...techDetails, vocalTracksCount: e.target.value ? parseInt(e.target.value) : '' })}
                                        placeholder="e.g. 4"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Instrumental Type</label>
                                    <input
                                        type="text"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-zinc-700"
                                        value={techDetails.instrumentalType}
                                        onChange={(e) => setTechDetails({ ...techDetails, instrumentalType: e.target.value })}
                                        placeholder="e.g. 2-Track / Mulit-track"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50 cursor-pointer hover:bg-zinc-950 transition-colors group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="stemsIncluded"
                                        checked={techDetails.stemsIncluded}
                                        onChange={(e) => setTechDetails({ ...techDetails, stemsIncluded: e.target.checked })}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-600 bg-zinc-900 transition-all checked:border-indigo-500 checked:bg-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <svg
                                        className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
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

                        {/* 6. INTERNAL NOTES (CREATOR ONLY) */}
                        <div className="mt-8 bg-amber-950/10 border border-amber-900/30 rounded-xl p-5 relative group overflow-hidden">
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
                                    className="px-4 py-2 bg-amber-900/40 hover:bg-amber-900/60 text-amber-200 border border-amber-800/50 hover:border-amber-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save Notes'}
                                </button>
                            </div>
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
        </>
    );
}
