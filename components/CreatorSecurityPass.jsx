'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle2, Clock, XCircle, ShieldAlert, Loader2 } from 'lucide-react'

/**
 * Skeleton de carga para el componente CreatorSecurityPass
 */
function CreatorSecurityPassSkeleton() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 my-12">
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
 * Configuración de mensajes y estilos según el estado del perfil
 */
const STATUS_CONFIG = {
    NO_PROFILE: {
        icon: AlertCircle,
        iconColor: 'text-amber-400',
        bgColor: 'bg-amber-900/40',
        borderColor: 'border-amber-600/70',
        title: 'Creator Security Pass',
        message: 'Attention! To activate automatic project assignment and profile verification, you must complete your security and payment information.',
        buttonText: 'Complete Data Now',
        buttonColor: 'bg-amber-500 hover:bg-amber-400',
        showButton: true,
    },
    PENDING: {
        icon: Clock,
        iconColor: 'text-blue-400',
        bgColor: 'bg-blue-900/40',
        borderColor: 'border-blue-600/70',
        title: 'Application Under Review',
        message: 'Your Creator Security Pass application is being reviewed by our team. This process typically takes 24-48 hours. We\'ll notify you once the review is complete.',
        buttonText: 'View Application',
        buttonColor: 'bg-blue-500 hover:bg-blue-400',
        showButton: true,
    },
    APPROVED: {
        icon: CheckCircle2,
        iconColor: 'text-green-400',
        bgColor: 'bg-green-900/40',
        borderColor: 'border-green-600/70',
        title: '✓ Creator Pass Approved',
        message: 'Congratulations! Your Creator Security Pass has been approved. You can now receive project assignments and access all creator features.',
        buttonText: 'View Profile',
        buttonColor: 'bg-green-500 hover:bg-green-400',
        showButton: false, // No mostrar banner cuando está aprobado
    },
    REJECTED: {
        icon: XCircle,
        iconColor: 'text-red-400',
        bgColor: 'bg-red-900/40',
        borderColor: 'border-red-600/70',
        title: 'Application Rejected',
        message: 'Unfortunately, your Creator Security Pass application was not approved. Please review our requirements and resubmit your application with the necessary improvements.',
        buttonText: 'Resubmit Application',
        buttonColor: 'bg-red-500 hover:bg-red-400',
        showButton: true,
    },
    SUSPENDED: {
        icon: ShieldAlert,
        iconColor: 'text-orange-400',
        bgColor: 'bg-orange-900/40',
        borderColor: 'border-orange-600/70',
        title: 'Account Suspended',
        message: 'Your Creator Security Pass has been suspended. Please contact support for more information about reactivating your account.',
        buttonText: 'Contact Support',
        buttonColor: 'bg-orange-500 hover:bg-orange-400',
        showButton: true,
    },
}

/**
 * Determina el estado actual del perfil del creator
 */
function getProfileStatus(creatorProfile) {
    if (!creatorProfile) {
        return 'NO_PROFILE'
    }

    // Verificar si el perfil tiene los campos requeridos
    const isProfileComplete = creatorProfile.brandName &&
        creatorProfile.yearsOfExperience !== null &&
        creatorProfile.yearsOfExperience !== undefined &&
        creatorProfile.mainDaw &&
        creatorProfile.gearList &&
        creatorProfile.availability

    if (!isProfileComplete) {
        return 'NO_PROFILE'
    }

    // Retornar el status del perfil
    return creatorProfile.status || 'PENDING'
}

/**
 * Componente principal que muestra el estado del Creator Security Pass
 */
export default function CreatorSecurityPass({ creatorProfile, loading }) {
    const router = useRouter()

    // Mostrar skeleton mientras carga
    if (loading) {
        return <CreatorSecurityPassSkeleton />
    }

    // Determinar el estado actual
    const status = getProfileStatus(creatorProfile)
    const config = STATUS_CONFIG[status]

    // No mostrar nada si el perfil está aprobado
    if (!config.showButton && status === 'APPROVED') {
        return null
    }

    const Icon = config.icon

    const handleAction = () => {
        switch (status) {
            case 'NO_PROFILE':
            case 'REJECTED':
                router.push('/creators/securitypass')
                break
            case 'PENDING':
                router.push('/creators/profile')
                break
            case 'SUSPENDED':
                router.push('/creators/support')
                break
            default:
                router.push('/creators/profile')
        }
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 my-12">
            <div className={`liquid-glass ${config.bgColor} border-2 ${config.borderColor} rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 shadow-2xl transition-all duration-300 hover:shadow-3xl`}>

                <div className="flex items-center space-x-4 flex-grow text-center md:text-left">
                    {/* Icon */}
                    <Icon className={`w-10 h-10 ${config.iconColor} flex-shrink-0 animate-pulse`} />

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                            {config.title}
                        </h3>
                        <p className="text-gray-200 text-base">
                            {config.message}
                        </p>

                        {/* Información adicional para estado PENDING */}
                        {status === 'PENDING' && creatorProfile?.createdAt && (
                            <p className="text-sm text-gray-400 mt-2">
                                Submitted: {new Date(creatorProfile.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                {config.showButton && (
                    <button
                        onClick={handleAction}
                        className={`${config.buttonColor} text-gray-900 font-bold text-sm px-8 py-3 rounded-xl transition transform hover:scale-[1.02] shadow-lg flex-shrink-0 w-full md:w-auto flex items-center justify-center space-x-2`}
                    >
                        <span>{config.buttonText}</span>
                        {status === 'PENDING' && (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                    </button>
                )}
            </div>
        </div>
    )
}
