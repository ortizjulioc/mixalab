"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    Music,
    Calendar,
    Clock,
    ArrowRight,
    Filter,
    Search,
    LayoutGrid,
    List as ListIcon,
    Loader2,
    AlertCircle
} from "lucide-react";

export default function ProjectsListPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const userRole = session?.user?.role; // 'ARTIST' or 'CREATOR'
    const isArtist = userRole === 'ARTIST';

    useEffect(() => {
        const fetchProjects = async () => {
            if (!session?.user) return;

            try {
                setLoading(true);
                // Determine endpoint based on role
                const endpoint = isArtist
                    ? "/api/artists/my-requests"  // Assuming artists view their requests as projects
                    : "/api/creators/projects?userId=" + session.user.id; // Creators view assigned projects

                const res = await fetch(endpoint);
                const data = await res.json();

                if (!res.ok) throw new Error(data.error || "Failed to fetch projects");

                // Handle different data structures if necessary
                const projectsData = data.requests || data.projects || [];
                setProjects(projectsData);
            } catch (err) {
                console.error("Error fetching projects:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [session, isArtist]);

    // Filter projects based on search and status
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.artistName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case "COMPLETED": return "bg-green-500/20 text-green-400 border-green-500/30";
            case "IN_PROGRESS": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
            case "PENDING": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
            case "CANCELLED": return "bg-red-500/20 text-red-400 border-red-500/30";
            default: return "bg-zinc-800 text-gray-400 border-zinc-700";
        }
    };

    const currentPath = isArtist ? '/artists/projects' : '/creators/projects';

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-gray-400 text-sm">Loading projects...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Error Loading Projects</h3>
                <p className="text-gray-400">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-gray-400">
                        Manage and track your {isArtist ? 'music production requests' : 'assigned projects'}.
                    </p>
                </div>

                {isArtist && (
                    <button
                        onClick={() => router.push('/artists/order')}
                        className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/5"
                    >
                        + New Project
                    </button>
                )}
            </div>

            {/* Filters & Controls */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full md:w-48 bg-black/40 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-white appearance-none focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div className="flex bg-black/40 border border-zinc-700 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Projects Grid/List */}
            {filteredProjects.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl border-dashed">
                    <div className="bg-zinc-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Projects Found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm || statusFilter !== 'ALL'
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "You haven't started any projects yet."}
                    </p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filteredProjects.map((project) => (
                        <div
                            key={project.id}
                            onClick={() => router.push(`${currentPath}/${project.id}`)}
                            className={`
                        group relative bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 hover:bg-zinc-800/60 transition-all cursor-pointer
                        ${viewMode === 'list' ? 'flex flex-col md:flex-row md:items-center p-4 gap-6' : 'p-6 flex flex-col h-full'}
                    `}
                        >
                            {/* Status Badge */}
                            <div className={viewMode === 'list' ? "md:order-last md:ml-auto" : "mb-6 flex justify-between items-start"}>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(project.status || 'IN_PROGRESS')}`}>
                                    {(project.status || 'IN_PROGRESS').replace(/_/g, " ")}
                                </span>
                                {viewMode === 'grid' && (
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                        <Music className="w-3 h-3" /> {project.projectType || 'Single'}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(project.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
                                    {project.projectName}
                                </h3>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-1">
                                    {isArtist ? `Assigned to: ${project.creator?.brandName || 'Pending...'}` : `Artist: ${project.artistName}`}
                                </p>

                                {/* Services Tags */}
                                {viewMode === 'grid' && (
                                    <div className="mt-auto">
                                        <div className="flex flex-wrap gap-2">
                                            {(Array.isArray(project.services) ? project.services : [project.services]).slice(0, 3).map((service, i) => (
                                                <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/10">
                                                    {typeof service === 'string' ? service : service.type}
                                                </span>
                                            ))}
                                            {(Array.isArray(project.services) ? project.services : [project.services]).length > 3 && (
                                                <span className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 border border-white/10">
                                                    +{project.services.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {viewMode === 'list' && (
                                <div className="mt-4 md:mt-0 md:mr-8 hidden md:block">
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <div>
                                            <span className="block text-xs text-gray-600 uppercase">Tier</span>
                                            <span className="text-white font-medium">{project.tier}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
