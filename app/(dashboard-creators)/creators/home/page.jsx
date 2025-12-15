'use client'
import CreatorSecurityPass from '@/components/CreatorSecurityPass'
import useCreatorProfile from '@/hooks/useCreatorProfile'
import { useSession } from 'next-auth/react'
import React, { useEffect } from 'react'
import { Sparkles, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'

/**
 * Skeleton para las estadísticas del dashboard
 */
function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-800/40 rounded-xl p-6 animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
          <div className="h-8 bg-gray-700 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-32"></div>
        </div>
      ))}
    </div>
  )
}

/**
 * Componente de bienvenida según el estado del perfil
 */
function WelcomeMessage({ creatorProfile, session }) {
  if (!creatorProfile) {
    return (
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome, {session?.user?.name || 'Creator'}! 👋
        </h1>
        <p className="text-gray-400 text-lg">
          Let's get started by completing your Creator Security Pass.
        </p>
      </div>
    )
  }

  const statusMessages = {
    PENDING: {
      title: `Welcome back, ${creatorProfile.brandName}! ⏳`,
      subtitle: 'Your application is under review. We\'ll notify you soon!',
    },
    APPROVED: {
      title: `Welcome back, ${creatorProfile.brandName}! ✨`,
      subtitle: 'Your creator dashboard is ready. Start accepting projects!',
    },
    REJECTED: {
      title: `Hello, ${creatorProfile.brandName}`,
      subtitle: 'Please review and resubmit your application.',
    },
    SUSPENDED: {
      title: `Hello, ${creatorProfile.brandName}`,
      subtitle: 'Your account is currently suspended. Contact support for assistance.',
    },
  }

  const message = statusMessages[creatorProfile.status] || statusMessages.PENDING

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-white mb-2">
        {message.title}
      </h1>
      <p className="text-gray-400 text-lg">
        {message.subtitle}
      </p>
    </div>
  )
}

/**
 * Estadísticas del dashboard (solo visible cuando está aprobado)
 */
function DashboardStats({ creatorProfile }) {
  if (!creatorProfile || creatorProfile.status !== 'APPROVED') {
    return null
  }

  // Determinar servicios activos
  const activeServices = []
  if (creatorProfile.mixing) activeServices.push('Mixing')
  if (creatorProfile.masteringEngineerProfile) activeServices.push('Mastering')
  if (creatorProfile.instrumentalist) activeServices.push('Recording')

  // Obtener tier actual
  const currentTier = creatorProfile.CreatorTier?.find(t => t.active)?.tier
  const tierName = currentTier?.name || 'BRONZE'
  const tierColors = {
    BRONZE: 'text-orange-400',
    SILVER: 'text-gray-300',
    GOLD: 'text-yellow-400',
    PLATINUM: 'text-purple-400',
  }

  const stats = [
    {
      icon: Sparkles,
      label: 'Active Services',
      value: activeServices.length.toString(),
      change: activeServices.join(', ') || 'No services',
      color: 'text-amber-400',
    },
    {
      icon: TrendingUp,
      label: 'Creator Tier',
      value: tierName,
      change: `${creatorProfile.yearsOfExperience} years experience`,
      color: tierColors[tierName] || 'text-gray-400',
    },
    {
      icon: Clock,
      label: 'Availability',
      value: creatorProfile.availability?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'On Demand',
      change: `${creatorProfile.genders?.length || 0} genres`,
      color: 'text-blue-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 hover:bg-gray-800/60 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.change}</div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Sección de próximos pasos según el estado
 */
function NextSteps({ creatorProfile }) {
  if (!creatorProfile) {
    return null
  }

  // Verificar si tiene servicios activos
  const hasServices = !!(creatorProfile.mixing || creatorProfile.masteringEngineerProfile || creatorProfile.instrumentalist)

  const steps = {
    PENDING: [
      { icon: Clock, text: 'Wait for admin review (24-48 hours)', completed: false },
      { icon: CheckCircle2, text: 'Check your email for updates', completed: false },
      { icon: Sparkles, text: 'Prepare your portfolio samples', completed: false },
    ],
    APPROVED: [
      { icon: CheckCircle2, text: 'Profile approved and services configured', completed: true },
      { icon: Sparkles, text: 'Profile optimized and ready', completed: true },
      { icon: TrendingUp, text: 'Land your first project', completed: false },
    ],
    REJECTED: [
      { icon: Clock, text: 'Review rejection feedback', completed: false },
      { icon: Sparkles, text: 'Improve your application', completed: false },
      { icon: CheckCircle2, text: 'Resubmit for review', completed: false },
    ],
  }

  const currentSteps = steps[creatorProfile.status]
  if (!currentSteps) return null

  return (
    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Next Steps</h2>
      <div className="space-y-3">
        {currentSteps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={index} className="flex items-center space-x-3">
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${step.completed ? 'text-green-400' : 'text-gray-400'
                  }`}
              />
              <span
                className={`text-sm ${step.completed ? 'text-gray-300 line-through' : 'text-gray-200'
                  }`}
              >
                {step.text}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const { data: session, status } = useSession()
  const { creatorProfile, getCreatorProfileByUserId, loading } = useCreatorProfile()

  useEffect(() => {
    // Only fetch if we have a user ID from the session
    if (session?.user?.id) {
      getCreatorProfileByUserId(session.user.id)
    }
  }, [session?.user?.id, getCreatorProfileByUserId])

  const isLoading = loading || status === 'loading'

  return (
    <div>
      {/* Creator Security Pass Alert */}
      <CreatorSecurityPass
        creatorProfile={creatorProfile}
        loading={isLoading}
      />

      {/* Main Dashboard Content */}
      <div className="px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <>
            <div className="mb-8 animate-pulse">
              <div className="h-10 bg-gray-700 rounded w-64 mb-2"></div>
              <div className="h-6 bg-gray-700 rounded w-96"></div>
            </div>
            <DashboardStatsSkeleton />
          </>
        ) : (
          <>
            <WelcomeMessage creatorProfile={creatorProfile} session={session} />
            <DashboardStats creatorProfile={creatorProfile} />
            <NextSteps creatorProfile={creatorProfile} />
          </>
        )}

        {/* Contenido adicional del dashboard */}
        {creatorProfile?.status === 'APPROVED' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Recent Projects</h2>
              <div className="text-center py-8 text-gray-400">
                <p>No projects yet</p>
                <p className="text-sm mt-2">Projects will appear here once you start accepting them</p>
              </div>
            </div>

            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-white font-medium">Browse Available Projects</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-white font-medium">Update Your Services</span>
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors">
                  <span className="text-white font-medium">View Your Portfolio</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
