'use client'
import ArtistProfileCTA from '@/components/ArtistProfileCTA'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, BadgeCheck, Sparkles, Edit3, Eye, Inbox, Music, TrendingUp, Award, Zap, Calendar, Star, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react'
import useArtistProfiles from '@/hooks/useArtistProfiles'
import useServiceRequests from '@/hooks/useServiceRequests'
import MyProjectsSection from '@/components/MyProjectsSection'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { artistProfile, getArtistProfileByUserId, loading } = useArtistProfiles()
  const { serviceRequests, getServiceRequestsByUserId, loading: requestsLoading } = useServiceRequests()

  useEffect(() => {
    // Only fetch if we have a user ID from the session
    if (session?.user?.id) {
      getArtistProfileByUserId(session.user.id)
      getServiceRequestsByUserId(session.user.id)
    }
  }, [session?.user?.id, getArtistProfileByUserId, getServiceRequestsByUserId])

  const isLoading = loading || status === 'loading'

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-8 pb-8">
      {/* CTA para completar perfil si falta */}
      <ArtistProfileCTA
        artistProfile={artistProfile}
        userRole={session?.user?.role}
        loading={isLoading}
      />

      {/* Loading skeleton para el resto del dashboard */}
      {isLoading && (
        <div className="space-y-6">
          <div className="h-32 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl animate-pulse backdrop-blur-sm" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl animate-pulse backdrop-blur-sm" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl animate-pulse backdrop-blur-sm" />
            ))}
          </div>
        </div>
      )}

      {/* Contenido del dashboard - solo mostrar cuando NO está cargando Y tiene perfil */}
      {!isLoading && artistProfile && (
        <>
          {/* Hero Header refinado */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-gray-800/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
            {/* Decorative subtle orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-600/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-500/5 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                {/* Avatar con borde sutil */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600/30 to-gray-500/30 rounded-full blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden border-2 border-gray-600/30">
                    {session?.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-9 h-9 text-gray-300" />
                    )}
                  </div>
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {artistProfile?.stageName || session?.user?.name || session?.user?.email || 'Artist'}
                  </h1>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span className="font-medium">Active Profile</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* mixaPoints refinado */}
              <div className="relative group">
                <div className="absolute inset-0 bg-amber-500/10 rounded-xl blur-sm group-hover:blur-md transition-all" />
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
          </div>

          {/* Stats Cards Grid - tonos más sutiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Projects */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/40 rounded-xl p-5 hover:border-gray-600/60 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-600/5 rounded-full blur-2xl group-hover:bg-gray-600/10 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-gray-700/30 rounded-lg">
                    <Inbox className="w-5 h-5 text-gray-300" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">0</p>
                <p className="text-sm text-gray-400">Active Requests</p>
              </div>
            </div>

            {/* Completed Projects */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/40 rounded-xl p-5 hover:border-emerald-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                    <BadgeCheck className="w-5 h-5 text-emerald-400/80" />
                  </div>
                  <Award className="w-4 h-4 text-emerald-500/40" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">0</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
            </div>

            {/* Rating */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/40 rounded-xl p-5 hover:border-amber-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-amber-500/10 rounded-lg">
                    <Star className="w-5 h-5 text-amber-400/80" />
                  </div>
                  <Zap className="w-4 h-4 text-amber-500/40" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">5.0</p>
                <p className="text-sm text-gray-400">Average Rating</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/40 rounded-xl p-5 hover:border-gray-600/60 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gray-600/5 rounded-full blur-2xl group-hover:bg-gray-600/10 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-gray-700/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">2026</p>
                <p className="text-sm text-gray-400">Member Since</p>
              </div>
            </div>
          </div>

          {/* My Projects Section */}
          <MyProjectsSection serviceRequests={serviceRequests} loading={requestsLoading} />

          {/* Content Cards - colores más elegantes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Géneros */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/70 transition-all duration-300 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-600/5 rounded-full blur-2xl group-hover:bg-gray-600/10 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Your Genres</h3>
                  <div className="p-2 bg-gray-700/30 rounded-lg">
                    <Music className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
                {artistProfile?.genres?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {artistProfile.genres.map((g) => (
                      <span
                        key={g.id}
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-700/40 text-gray-200 border border-gray-600/40 hover:border-gray-500/60 transition-colors"
                      >
                        {g.genre?.name || 'Unknown'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No genres added yet</p>
                )}
              </div>
            </div>

            {/* Services */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/70 transition-all duration-300 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-600/5 rounded-full blur-2xl group-hover:bg-gray-600/10 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Available Services</h3>
                  <div className="p-2 bg-gray-700/30 rounded-lg">
                    <Zap className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-3 py-1.5 rounded-full bg-gray-700/40 text-gray-200 border border-gray-600/40">
                    Mixing
                  </span>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-gray-700/40 text-gray-200 border border-gray-600/40">
                    Mastering
                  </span>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-gray-700/40 text-gray-200 border border-gray-600/40">
                    Production
                  </span>
                </div>
                <p className="text-xs text-gray-500 italic">Personalized services coming soon</p>
              </div>
            </div>

            {/* Profile Bio */}
            <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/70 transition-all duration-300 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-600/5 rounded-full blur-2xl group-hover:bg-gray-600/10 transition-all" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">About You</h3>
                  <div className="p-2 bg-gray-700/30 rounded-lg">
                    <User className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                  {artistProfile?.bio || 'Complete your bio to help creators understand your style and musical references.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions - más elegante */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/artists/profile/setup')}
              className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-100 hover:from-gray-50 hover:to-white text-gray-900 font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 hover:scale-[1.02]"
            >
              <Edit3 className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => router.push('/artists/order')}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:from-gray-700/80 hover:to-gray-800/80 border border-gray-700/60 hover:border-gray-600/80 text-white font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]"
            >
              <Inbox className="w-5 h-5 text-gray-300" />
              <span>Service Requests</span>
            </button>

            <button
              onClick={() => { /* Placeholder hasta tener la ruta pública */ }}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-800/80 to-gray-900/80 hover:from-gray-700/80 hover:to-gray-800/80 border border-gray-700/60 hover:border-gray-600/80 text-white font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02]"
              title="Public profile coming soon"
            >
              <Eye className="w-5 h-5 text-gray-300" />
              <span>Public Profile</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
