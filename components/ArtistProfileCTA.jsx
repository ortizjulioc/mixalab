'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

/**
 * Skeleton de carga para el componente ArtistProfileCTA
 */
function ArtistProfileCTASkeleton() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 my-8">
            <div className="liquid-glass border-2 border-gray-700 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 shadow-2xl animate-pulse">
                <div className="flex items-center space-x-4 flex-grow">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                        <div className="h-6 bg-gray-700 rounded w-48 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-full max-w-md"></div>
                    </div>
                </div>
                <div className="w-full md:w-40 h-12 bg-gray-700 rounded-xl"></div>
            </div>
        </div>
    )
}

/**
 * Componente CTA para completar el Artist Profile
 * Se muestra cuando el usuario tiene rol ARTIST y no ha completado su perfil
 */
export default function ArtistProfileCTA({ artistProfile, userRole, loading }) {
    const router = useRouter()

    // Mostrar skeleton mientras carga
    if (loading) {
        return <ArtistProfileCTASkeleton />
    }

    // Solo mostrar si el usuario es ARTIST y no tiene perfil completo
    if (userRole !== 'ARTIST' || artistProfile) {
        return null
    }

    const handleCompleteProfile = () => {
        router.push('/artists/profile/setup')
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 my-8">
            <div className="liquid-glass bg-amber-900/40 border-2 border-amber-600/70 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 shadow-2xl transition-all duration-300 hover:shadow-3xl">

                <div className="flex items-center space-x-4 flex-grow text-center md:text-left">
                    {/* Icon */}
                    <AlertCircle className="w-10 h-10 text-amber-400 flex-shrink-0 animate-pulse" />

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                            Attention!
                        </h3>
                        <p className="text-gray-200 text-base">
                            To activate automatic project assignment and profile verification, you must complete your Artist Profile information.
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleCompleteProfile}
                    className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm px-8 py-3 rounded-xl transition transform hover:scale-[1.02] shadow-lg flex-shrink-0 w-full md:w-auto flex items-center justify-center"
                >
                    Complete Artist Profile
                </button>
            </div>
        </div>
    )
}
