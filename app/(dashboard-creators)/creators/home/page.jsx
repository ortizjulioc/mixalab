'use client'
import CreatorSecurityPass from '@/components/CreatorSecurityPass'
import useCreatorProfile from '@/hooks/useCreatorProfile'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, Clock, CheckCircle2, User, Inbox, Music, Award, Zap, ArrowRight, Wallet } from 'lucide-react'

// ... Keep WelcomeMessage or similar logic but styled ...

function DashboardStats({ creatorProfile, stats }) {
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
      value: stats.active.toString(),
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
  const [requestStats, setRequestStats] = useState({ available: 0, active: 0 })

  useEffect(() => {
    if (session?.user?.id) {
      getCreatorProfileByUserId(session.user.id)
      fetchStats();
    }
  }, [session?.user?.id, getCreatorProfileByUserId])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/creator/available-requests?filter=ALL');
      const data = await res.json();
      if (data.requests) {
        // Assume 'creatorId' in request object is the CreatorProfile ID. 
        // We need to compare it with fetched creatorProfile ID, but we might not have it yet inside this effect if it's separated.
        // For simplicity, let's trust the filter=ALL logic from API which returns relevant requests.
        // We need to distinguish available vs active.

        // This logic is slightly approximate without full profile loaded in this scope, 
        // but 'creatorId' being null usually means available (if it matched tier).
        const available = data.requests.filter(r => !r.creatorId && r.status === 'PENDING').length;
        const active = data.requests.filter(r => r.creatorId).length; // If it's in the list and has creatorId, it's mine (because API filters by my ID or matching tier)
        setRequestStats({ available, active });
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

          <DashboardStats creatorProfile={creatorProfile} stats={requestStats} />

          {/* Quick Actions & Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Recent Projects</h2>
                  <button
                    onClick={() => router.push('/creators/requests?filter=ACCEPTED')}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Placeholder for projects list */}
                <div className="text-center py-12 bg-gray-900/30 rounded-lg border border-gray-800 border-dashed">
                  <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  {requestStats.active > 0 ? (
                    <p className="text-gray-400">Checking your active projects...</p>
                  ) : (
                    <>
                      <p className="text-gray-300 font-medium">No active projects yet</p>
                      <p className="text-gray-500 text-sm mt-1">Start by finding a request that matches your skills.</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
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
