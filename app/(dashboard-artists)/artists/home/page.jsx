'use client'
import ArtistProfileCTA from '@/components/ArtistProfileCTA'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, BadgeCheck, Sparkles, Inbox, Music, TrendingUp, Award, Zap, Calendar, Star, PlayCircle, ArrowRight, Edit3, Eye, Wallet } from 'lucide-react'
import useArtistProfiles from '@/hooks/useArtistProfiles'
import useServiceRequests from '@/hooks/useServiceRequests'
import useArtistProjects from '@/hooks/useArtistProjects'
import MyProjectsSection from '@/components/MyProjectsSection'

function DashboardStats({ artistProfile, activeRequestsCount, completedProjectsCount, memberSince }) {
  const statCards = [
    {
      icon: Inbox,
      label: 'Active Requests',
      value: activeRequestsCount.toString(),
      sub: 'Pending or In Progress',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20'
    },
    {
      icon: Award,
      label: 'Completed Projects',
      value: completedProjectsCount.toString(),
      sub: 'All time',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      icon: Star,
      label: 'Average Rating',
      value: '5.0', // Placeholder
      sub: 'Based on feedback',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      icon: Sparkles,
      label: 'mixaPoints',
      value: artistProfile?.mixaPoints?.toString() ?? '0',
      sub: 'Rewards available',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className={`group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border ${stat.border} rounded-xl p-5 hover:border-gray-600/60 transition-all duration-300 backdrop-blur-sm`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:opacity-75 transition-opacity`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 ${stat.bg} rounded-lg`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { artistProfile, getArtistProfileByUserId, loading } = useArtistProfiles()
  const { serviceRequests, getServiceRequestsByUserId, loading: requestsLoading } = useServiceRequests()
  const { projects, getArtistProjectsByUserId, loading: projectsLoading } = useArtistProjects()

  useEffect(() => {
    // Only fetch if we have a user ID from the session
    if (session?.user?.id) {
      getArtistProfileByUserId(session.user.id)
      getServiceRequestsByUserId(session.user.id)
      getArtistProjectsByUserId(session.user.id)
    }
  }, [session?.user?.id, getArtistProfileByUserId, getServiceRequestsByUserId, getArtistProjectsByUserId])

  const isLoading = loading || status === 'loading'

  // Calculate Stats
  const activeRequestsCount = serviceRequests?.filter(r =>
    !['COMPLETED', 'CANCELLED', 'REJECTED', 'PAID'].includes(r.status)
  ).length || 0;

  const completedProjectsCount = projects?.filter(p => p.status === 'COMPLETED').length || 0;

  // Use artist creation year or current year if not available
  const memberSince = artistProfile?.createdAt ? new Date(artistProfile.createdAt).getFullYear() : '2026';

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
      {/* CTA para completar perfil si falta */}
      <ArtistProfileCTA
        artistProfile={artistProfile}
        userRole={session?.user?.role}
        loading={isLoading}
      />

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-6">
          <div className="h-32 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl animate-pulse backdrop-blur-sm" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl animate-pulse backdrop-blur-sm" />
            ))}
          </div>
        </div>
      )}

      {/* Contenido del dashboard - solo mostrar cuando NO está cargando Y tiene perfil */}
      {!isLoading && artistProfile && (
        <>
          {/* Hero Header refinado */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/20 via-gray-900/60 to-gray-800/40 border border-indigo-500/20 rounded-2xl p-8 backdrop-blur-sm">
            {/* Decorative subtle orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20 overflow-hidden border-2 border-indigo-400/20">
                  {session?.user?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{artistProfile?.stageName?.[0] || 'A'}</span>
                  )}
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Welcome back, {artistProfile?.stageName || session?.user?.name || 'Artist'}!
                  </h1>
                  <p className="text-gray-400">
                    Ready to take your music to the next level?
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/artists/order')}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                >
                  <Inbox className="w-5 h-5" />
                  New Request
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards Grid Reuse */}
          <DashboardStats
            artistProfile={artistProfile}
            activeRequestsCount={activeRequestsCount}
            completedProjectsCount={completedProjectsCount}
            memberSince={memberSince}
          />

          {/* Main Layout Grid: 2/3 Content + 1/3 Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column (Content) */}
            <div className="lg:col-span-2 space-y-8">

              {/* ACTIVE PROJECTS - Integrated with Premium Design */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlayCircle className="w-6 h-6 text-indigo-400" /> Active Projects
                  </h2>
                </div>

                {projectsLoading ? (
                  <div className="text-gray-400">Loading projects...</div>
                ) : projects && projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map(project => (
                      <div
                        key={project.id}
                        onClick={() => router.push(`/artists/projects/${project.id}`)}
                        className="group relative overflow-hidden bg-gradient-to-r from-indigo-900/20 to-gray-800 border border-indigo-500/30 hover:border-indigo-400/50 rounded-xl p-5 cursor-pointer transition-all"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                              <Music className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">{project.projectName}</h4>
                              <p className="text-sm text-gray-400">{project.projectType || 'Project'} • {project.tier || 'Standard'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold border border-indigo-500/20">
                              IN PROGRESS
                            </span>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-400">No active projects at the moment.</p>
                  </div>
                )}
              </div>

              {/* My Projects Section (Requests) */}
              {/* Wrapped in the style consistent with the new layout */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <MyProjectsSection serviceRequests={serviceRequests} loading={requestsLoading} />
              </div>

            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">

              {/* Profile/Expertise Snapshot */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Your Profile</h2>

                {/* Genres */}
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Preferred Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {artistProfile?.genres?.length ? (
                      artistProfile.genres.map((g) => (
                        <span key={g.id} className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
                          {g.genre?.name || 'Unknown'}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs italic">No genres added</span>
                    )}
                  </div>
                </div>

                {/* Bio Preview */}
                <div className="space-y-2 pt-4 border-t border-gray-700/50">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-bold">Bio</p>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                    {artistProfile?.bio || 'No bio added yet. Tell creators about yourself!'}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/artists/profile/setup')}
                    className="w-full text-left p-4 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Edit3 className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" />
                      <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">Edit Profile</h3>
                    </div>
                    <p className="text-sm text-gray-500 pl-8">Update your info & genres</p>
                  </button>

                  <button
                    onClick={() => {/* Placeholder */ }}
                    className="w-full text-left p-4 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-xl transition-all group opacity-75"
                    title="Coming soon"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Eye className="w-5 h-5 text-gray-400 group-hover:text-emerald-400" />
                      <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors">View Public Profile</h3>
                    </div>
                    <p className="text-sm text-gray-500 pl-8">See what creators see</p>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
