'use client'
import CreatorSecurityPass from '@/components/CreatorSecurityPass'
import useCreatorProfile from '@/hooks/useCreatorProfile'
import useCreatorProjects from '@/hooks/useCreatorProjects'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, Clock, CheckCircle2, User, Inbox, Music, Award, Zap, ArrowRight, Wallet, PlayCircle } from 'lucide-react'

// ... Keep WelcomeMessage or similar logic but styled ...

function DashboardStats({ creatorProfile, stats, activeProjectsCount }) {
  if (!creatorProfile || creatorProfile.status !== 'APPROVED') return null

  // Determine active services
  const activeServices = []
  if (creatorProfile.mixing) activeServices.push('Mixing')
  if (creatorProfile.masteringEngineerProfile) activeServices.push('Mastering')
  if (creatorProfile.instrumentalist) activeServices.push('Recording')

  // Get current tier
  const currentTier = creatorProfile.CreatorTier?.find(t => t.active)?.tier
  const tierName = currentTier?.name || 'BRONZE'

  const statCards = [
    {
      icon: Inbox,
      label: 'Available Projects',
      value: stats.available.toString(),
      sub: 'Matching your tier',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      icon: Zap,
      label: 'Active Projects',
      value: activeProjectsCount.toString(),
      sub: 'In progress',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20'
    },
    {
      icon: Wallet,
      label: 'Pending Earnings',
      value: '$0.00', // Placeholder for now
      sub: 'From active jobs',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    {
      icon: Award,
      label: 'Creator Tier',
      value: tierName,
      sub: `${activeServices.length} Active Services`,
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
  const { creatorProfile, getCreatorProfileByUserId, loading } = useCreatorProfile()
  const { projects: activeProjects, getCreatorProjectsByUserId, loading: projectsLoading } = useCreatorProjects()
  const [requestStats, setRequestStats] = useState({ available: 0, active: 0 })
  const [availableRequests, setAvailableRequests] = useState([]);

  useEffect(() => {
    if (session?.user?.id) {
      getCreatorProfileByUserId(session.user.id)
      getCreatorProjectsByUserId(session.user.id)
      fetchStats();
    }
  }, [session?.user?.id, getCreatorProfileByUserId, getCreatorProjectsByUserId])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/creator/available-requests?filter=ALL');
      const data = await res.json();
      if (data.requests) {
        // Filter out requests that are completed/cancelled
        const filteredRequests = data.requests.filter(r =>
          !['PAID', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED'].includes(r.status)
        );

        const available = filteredRequests.length;

        // Count matches: assigned to me (creatorId exists/not null) and status is IN_REVIEW
        const matches = filteredRequests.filter(r => r.creatorId && r.status === 'IN_REVIEW').length;

        setRequestStats({ available, active: activeProjects?.length || 0, matches });
        setAvailableRequests(filteredRequests.slice(0, 3));
      }
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  }

  const isLoading = loading || status === 'loading'

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
      <CreatorSecurityPass
        creatorProfile={creatorProfile}
        loading={isLoading}
      />

      {!isLoading && creatorProfile && (
        <>
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/20 via-gray-900/60 to-gray-800/40 border border-indigo-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                  {creatorProfile.brandName?.[0] || 'C'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Welcome back, {creatorProfile.brandName}!
                  </h1>
                  <p className="text-gray-400">
                    Ready to create some magic today?
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/creators/requests')}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
                >
                  <Sparkles className="w-5 h-5" />
                  Find Work
                </button>
              </div>
            </div>
          </div>

          <DashboardStats creatorProfile={creatorProfile} stats={requestStats} activeProjectsCount={activeProjects?.length || 0} />

          {/* Alert Banner for Matches */}
          {requestStats.matches > 0 && (
            <div
              onClick={() => router.push('/creators/requests')}
              className="mb-8 cursor-pointer relative overflow-hidden bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border border-amber-500/30 rounded-xl p-6 hover:border-amber-500/50 transition-all group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-full animate-pulse group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    You have {requestStats.matches} New Match{requestStats.matches !== 1 ? 'es' : ''}!
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Congratulations! You've been matched with new artists. Tap here to review.
                  </p>
                </div>
                <div className="ml-auto">
                  <ArrowRight className="w-6 h-6 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-8">

              {/* ACTIVE PROJECTS SECTION */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <PlayCircle className="w-6 h-6 text-cyan-400" /> Your Active Projects
                  </h2>
                </div>

                {projectsLoading ? (
                  <div className="text-gray-400">Loading projects...</div>
                ) : activeProjects && activeProjects.length > 0 ? (
                  <div className="space-y-4">
                    {activeProjects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => router.push(`/creators/projects/${project.id}`)}
                        className="group relative overflow-hidden bg-gradient-to-r from-cyan-900/20 to-gray-800 border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl p-5 cursor-pointer transition-all"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                              <Music className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-lg group-hover:text-cyan-300 transition-colors">{project.projectName}</h4>
                              <p className="text-sm text-gray-400">{project.projectType} • {project.tier}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/20">
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

              {/* AVAILABLE REQUESTS SECTION */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Inbox className="w-6 h-6 text-amber-400" /> Requests
                  </h2>
                  <button
                    onClick={() => router.push('/creators/requests')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {availableRequests.length > 0 ? (
                  <div className="space-y-4">
                    {availableRequests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => router.push('/creators/requests')}
                        className="bg-gray-800/60 border border-gray-700 hover:border-amber-500/50 rounded-xl p-4 flex items-center justify-between transition-all group cursor-pointer hover:bg-gray-800"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gray-700/50 rounded-lg group-hover:bg-amber-500/10 transition-colors">
                            <Sparkles className="w-6 h-6 text-gray-400 group-hover:text-amber-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors">{request.projectName}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span className="text-gray-400">{request.artistName}</span>
                              <span>• {request.tier}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold border ${request.status === 'ACCEPTED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          request.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          }`}>
                          {request.status.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-900/30 rounded-lg border border-gray-800 border-dashed">
                    <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-300 font-medium">No new requests found</p>
                    <p className="text-gray-500 text-sm mt-1">Check back later for new opportunities.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Expertise Snapshot */}
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">My Expertise</h2>

                {/* Genres */}
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-bold">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {creatorProfile.genders?.map((g) => (
                      <span key={g.id || Math.random()} className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
                        {g.genre?.name || 'Unknown'}
                      </span>
                    ))}
                    {(!creatorProfile.genders || creatorProfile.genders.length === 0) && (
                      <span className="text-gray-500 text-xs italic">No genres selected</span>
                    )}
                  </div>
                </div>

                {/* DAW & Exp */}
                <div className="space-y-2 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Main DAW</span>
                    <span className="text-white font-medium">
                      {{
                        'fl_studio': 'FL Studio',
                        'ableton_live': 'Ableton Live',
                        'logic_pro': 'Logic Pro',
                        'pro_tools': 'Pro Tools',
                        'studio_one': 'Studio One',
                        'cubase': 'Cubase',
                        'reaper': 'Reaper',
                        'garageband': 'GarageBand'
                      }[creatorProfile.mainDaw] || creatorProfile.mainDaw?.replace(/_/g, ' ') || 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-white font-medium">{creatorProfile.yearsOfExperience || 0} Years</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/creators/requests')}
                    className="w-full text-left p-4 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-xl transition-all group"
                  >
                    <h3 className="text-white font-medium group-hover:text-amber-400 transition-colors">Browse Requests</h3>
                    <p className="text-sm text-gray-500">Find new opportunities</p>
                  </button>
                  <button
                    className="w-full text-left p-4 bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 rounded-xl transition-all group"
                  >
                    <h3 className="text-white font-medium group-hover:text-purple-400 transition-colors">Update Portfolio</h3>
                    <p className="text-sm text-gray-500">Showcase your best work</p>
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
