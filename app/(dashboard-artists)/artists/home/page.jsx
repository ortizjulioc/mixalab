'use client'
import ArtistProfileCTA from '@/components/ArtistProfileCTA'
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, BadgeCheck, Sparkles, Edit3, Inbox, Music, TrendingUp, Award, Zap, Calendar, Star, PlusCircle, ArrowRight, PlayCircle } from 'lucide-react'
import useArtistProfiles from '@/hooks/useArtistProfiles'
import useServiceRequests from '@/hooks/useServiceRequests'
import useArtistProjects from '@/hooks/useArtistProjects'
import MyProjectsSection from '@/components/MyProjectsSection'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { artistProfile, getArtistProfileByUserId, loading } = useArtistProfiles()
  const { serviceRequests, getServiceRequestsByUserId, loading: requestsLoading } = useServiceRequests()
  const { projects, getArtistProjectsByUserId, loading: projectsLoading } = useArtistProjects()

  useEffect(() => {
    if (session?.user?.id) {
      getArtistProfileByUserId(session.user.id)
      getServiceRequestsByUserId(session.user.id)
      getArtistProjectsByUserId(session.user.id)
    }
  }, [session?.user?.id, getArtistProfileByUserId, getServiceRequestsByUserId, getArtistProjectsByUserId])

  const isLoading = loading || status === 'loading'

  // Determine active counts
  const activeRequestsCount = serviceRequests?.filter(r =>
    !['COMPLETED', 'CANCELLED', 'REJECTED', 'PAID'].includes(r.status)
  ).length || 0;

  const activeProjectsCount = projects?.length || 0;

  const completedRequestsCount = serviceRequests?.filter(r =>
    r.status === 'COMPLETED'
  ).length || 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
      <ArtistProfileCTA
        artistProfile={artistProfile}
        userRole={session?.user?.role}
        loading={isLoading}
      />

      {isLoading && (
        <div className="space-y-6">
          <div className="h-32 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl animate-pulse backdrop-blur-sm" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-28 bg-gray-800/60 rounded-2xl animate-pulse" />
            <div className="h-28 bg-gray-800/60 rounded-2xl animate-pulse" />
          </div>
        </div>
      )}

      {!isLoading && artistProfile && (
        <>
          {/* Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-gray-800/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-600/5 rounded-full blur-3xl -z-10" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden border-2 border-gray-600/30">
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-9 h-9 text-gray-300" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {artistProfile?.stageName || session?.user?.name || 'Artist'}
                  </h1>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-medium">
                      <BadgeCheck className="w-3.5 h-3.5" /> Active Profile
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center gap-3 bg-gradient-to-br from-amber-500/5 to-amber-600/5 border border-amber-500/20 px-5 py-3 rounded-xl backdrop-blur-sm">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-amber-400/80" />
                </div>
                <div>
                  <p className="text-xs text-amber-400/60 font-medium">mixaPoints</p>
                  <p className="text-2xl font-bold text-amber-400/90">{artistProfile?.mixaPoints ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
              <p className="text-gray-400 text-sm">Active Projects</p>
              <p className="text-2xl font-bold text-white">{activeProjectsCount}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
              <p className="text-gray-400 text-sm">Pending Requests</p>
              <p className="text-2xl font-bold text-white">{activeRequestsCount}</p>
            </div>
          </div>

          {/* ACTIVE PROJECTS SECTION (Paid & In Progress) */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <PlayCircle className="w-6 h-6 text-indigo-400" /> Active Projects
            </h2>
            {projectsLoading ? (
              <p className="text-gray-500">Loading projects...</p>
            ) : projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {projects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/artists/projects/${project.id}`)}
                    className="group relative overflow-hidden bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/30 rounded-xl p-6 hover:border-indigo-500/60 transition-all cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-all" />

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1">{project.projectName}</h3>
                            <p className="text-sm text-gray-400">{project.projectType || 'Project'}</p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                            <TrendingUp className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-semibold text-indigo-400">In Progress</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {/* Display services if available or just generic info */}
                          {project.services?.map(s => (
                            <span key={s.id} className="px-2.5 py-1 bg-gray-700/40 text-gray-200 text-xs rounded-full border border-gray-600/40">
                              {s.type}
                            </span>
                          ))}
                          <span className="px-2.5 py-1 bg-gray-700/40 text-gray-200 text-xs rounded-full border border-gray-600/40">
                            {project.tier}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-900/40 rounded-lg border border-gray-700/30">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-300" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">Project Workspace</p>
                            <p className="text-xs text-gray-400">View files & progress</p>
                          </div>
                          <button className="ml-auto text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1 transition-colors">
                            Enter <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center">
                <Music className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-gray-500">No active projects yet. Pay for a request to start.</p>
              </div>
            )}
          </div>

          {/* SERVICE REQUESTS SECTION (Pending, Accepted, Rejected) */}
          {/* SERVICE REQUESTS SECTION (Pending, Accepted, Rejected) */}
          {/* We filter out PAID requests from this view to avoid duplication */}
          <MyProjectsSection
            serviceRequests={serviceRequests?.filter(r => r.status !== 'PAID')}
            loading={requestsLoading}
          />

        </>
      )}
    </div>
  )
}
