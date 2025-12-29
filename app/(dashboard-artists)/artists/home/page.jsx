'use client'
import ArtistProfileCTA from '@/components/ArtistProfileCTA'
import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, BadgeCheck, Clock, Sparkles, Edit3, Eye, Inbox, Music } from 'lucide-react'
import useArtistProfiles from '@/hooks/useArtistProfiles'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { artistProfile, getArtistProfileByUserId, loading } = useArtistProfiles()

  useEffect(() => {
    // Only fetch if we have a user ID from the session
    if (session?.user?.id) {
      getArtistProfileByUserId(session.user.id)
    }
  }, [session?.user?.id, getArtistProfileByUserId])

  const isLoading = loading || status === 'loading'

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      {/* CTA para completar perfil si falta */}
      <ArtistProfileCTA
        artistProfile={artistProfile}
        userRole={session?.user?.role}
        loading={isLoading}
      />

      {/* Loading skeleton para el resto del dashboard */}
      {isLoading && (
        <div className="space-y-4">
          <div className="h-24 bg-gray-800/40 border border-gray-700 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-800/40 border border-gray-700 rounded-xl animate-pulse" />
            <div className="h-32 bg-gray-800/40 border border-gray-700 rounded-xl animate-pulse" />
            <div className="h-32 bg-gray-800/40 border border-gray-700 rounded-xl animate-pulse" />
          </div>
        </div>
      )}

      {/* Si no hay perfil (y no está cargando), mostramos solo la CTA arriba */}
      {!isLoading && !artistProfile && session?.user?.role === 'ARTIST' ? null : (
        <>
          {/* Header del artista */}
          <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-gray-300" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {artistProfile?.stageName || session?.user?.name || session?.user?.email || 'Artist'}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  {artistProfile ? (
                    <><BadgeCheck className="w-4 h-4 text-emerald-400" /> Profile Status: Completed</>
                  ) : (
                    <><Clock className="w-4 h-4 text-amber-400" /> Profile Status: Pending</>
                  )}
                </div>
              </div>
            </div>
            {/* mixaPoints */}
            <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">{artistProfile?.mixaPoints ?? 0} mixaPoints</span>
            </div>
          </div>

          {/* Cards informativas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Géneros */}
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Genres</h3>
                <Music className="w-4 h-4 text-gray-400" />
              </div>
              {artistProfile?.genres?.length ? (
                <div className="flex flex-wrap gap-2">
                  {artistProfile.genres.map((g) => (
                    <span key={g.id} className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-200 border border-gray-600">
                      {g.genre?.name || 'Unknown'}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No genres added yet</p>
              )}
            </div>

            {/* Services ofrecidos (placeholder informativo) */}
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">Services</h3>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-200 border border-gray-600">Mixing</span>
                <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-200 border border-gray-600">Mastering</span>
                <span className="px-2 py-1 rounded-full bg-gray-700 text-gray-200 border border-gray-600">Production</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Coming soon personalized services for artists</p>
            </div>

            {/* Profile summary */}
            <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-2">Profile Summary</h3>
              <p className="text-sm text-gray-300 line-clamp-4">{artistProfile?.bio || 'Complete your bio to help creators understand your style and references.'}</p>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/artists/profile/setup')}
              className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
            <button
              onClick={() => router.push('/artists/order')}
              className="bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-white font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition"
            >
              <Inbox className="w-4 h-4" /> View Service Requests
            </button>
            <button
              onClick={() => { /* Placeholder hasta tener la ruta pública */ }}
              className="bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-white font-semibold rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition"
              title="Public profile coming soon"
            >
              <Eye className="w-4 h-4" /> View Public Profile
            </button>
          </div>
        </>
      )}
    </div>
  )
}
