'use client';

import React, { useState } from 'react';
import { LogOut, Menu, Search, User, X, ChevronLeft, ChevronRight } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import navigationIcon from './navigationIcon';

/**
 * Componente que representa un enlace o botón con estilo Liquid Glass.
 */
const GlassLink = ({ iconKey, label, href, isSelected = false, onClick, isCollapsed }) => {
    if (onClick) {
        return (
            <button
                onClick={onClick}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} p-3 rounded-2xl transition duration-300 ease-in-out 
                        text-white font-medium hover:bg-white/10 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] w-full text-left liquid-glass
                        ${isSelected ? 'bg-white/15 border-l-4 border-white glow-border' : ''}`}
                title={isCollapsed ? label : ''}
            >
                <LogOut className="w-6 h-6 text-white/80 flex-shrink-0" />
                {!isCollapsed && <span>{label}</span>}
            </button>
        );
    }

    const IconElement = navigationIcon[iconKey];

    if (!IconElement) {
        console.warn(`Ícono no encontrado para la clave: ${iconKey}`);
        return null;
    }

    return (
        <Link
            href={href}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-4'} p-3 rounded-2xl transition-all duration-300 ease-in-out 
                    text-white font-medium hover:bg-white/10 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] w-full text-left liquid-glass
                    ${isSelected
                    ? 'bg-gradient-to-r from-blue-500/25 to-blue-400/15 border-l-8 border-blue-400/80 shadow-2xl shadow-blue-500/25 ring-2 ring-blue-400/40 ring-inset font-bold scale-[1.02] relative before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-500/10 before:to-transparent before:blur'
                    : ''}`}
            title={isCollapsed ? label : ''}
        >
            <div className={`flex-shrink-0 transition-colors duration-300 ${isSelected ? 'text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'text-white/80'}`}>
                {IconElement}
            </div>
            {!isCollapsed && (
                <span className={`transition-all duration-300 ${isSelected ? 'text-blue-200 drop-shadow-[0_0_4px_rgba(59,130,246,0.4)]' : ''}`}>
                    {label}
                </span>
            )}
        </Link>
    );
};

/**
 * Componente de badge para el rol del usuario.
 */
const RoleBadge = ({ role }) => {
    const getRoleStyles = (role) => {
        switch (role?.toUpperCase()) {
            case 'ARTIST':
                return 'liquid-glass border border-blue-500/30 text-blue-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border';
            case 'CREATOR':
                return 'liquid-glass border border-green-500/30 text-green-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border';
            case 'ADMIN':
                return 'liquid-glass border border-red-500/30 text-red-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border';
            default:
                return 'liquid-glass border border-gray-500/30 text-gray-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border';
        }
    };

    return <span className={getRoleStyles(role)}>{role}</span>;
};

/**
 * Layout principal del dashboard con estilo Liquid Glass.
 */
const DashboardLayout = ({ children, navItems }) => {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para mobile
    const [isCollapsed, setIsCollapsed] = useState(false); // Para desktop

    // Validar navItems
    if (!navItems || !Array.isArray(navItems)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-white">Error: navItems debe ser un arreglo válido.</div>
            </div>
        );
    }

    // Manejar estado de carga
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    const userName = session?.user?.name || "User";
    const userImage = session?.user?.image;
    const userRole = session?.user?.role || 'USER';

    const globalStyles = `
        @keyframes pulse-glow {
            0%, 100% { 
                text-shadow: 0 0 10px rgba(255, 255, 255, 0), 0 0 20px rgba(255, 255, 255, 0.2); 
                box-shadow: 0 0 10px rgba(135, 206, 235, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }
            50% { 
                text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.5); 
                box-shadow: 0 0 30px rgba(135, 206, 235, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
            }
        }
        
        .liquid-glass {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 
                0 8px 32px 0 rgba(31, 38, 135, 0.37),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .glow-border {
            box-shadow: 
                0 0 20px rgba(135, 206, 235, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .animate-pulse-glow {
            animation: pulse-glow 3s infinite ease-in-out;
        }

        /* Estilos personalizados para scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            transition: background 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        /* Para Firefox */
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        /* Ocultar scrollbar completamente (alternativa) */
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    `;

    return (
        <>
            <style>{globalStyles}</style>
            <div className="min-h-screen flex flex-col"
                style={{
                    backgroundImage: 'linear-gradient(135deg, #101010 0%, #000000 100%)',
                    fontFamily: 'Inter, sans-serif'
                }}>

                {/* Background Atmosphere */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at top left, #333 1%, transparent 20%),
                                   radial-gradient(circle at bottom right, #333 1%, transparent 20%)`,
                        backgroundSize: '100% 100%',
                        animation: 'pulse 15s infinite alternate'
                    }}
                />
                <style>{`
            @keyframes pulse {
              0% { opacity: 0.15; }
              100% { opacity: 0.3; }
            }
          `}</style>

                <div className="flex flex-1 relative z-10">
                    {/* Overlay para mobile */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* Sidebar */}
                    <aside
                        className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                            lg:translate-x-0 fixed lg:sticky lg:top-0 z-50
                            ${isCollapsed ? 'w-20' : 'w-64'} 
                            flex flex-col p-4 space-y-6 
                            liquid-glass border-r border-white/20 
                            shadow-2xl transition-all duration-300 h-screen`}
                    >
                        {/* Logo/Title Area */}
                        <div className="flex items-center justify-between h-16 border-b border-white/20 pb-4">
                            <div className="flex items-center">
                                <Logo />
                                {!isCollapsed && <h2 className="text-white text-2xl font-bold ml-2">Mixa Studio</h2>}
                            </div>
                            {/* Botón cerrar en mobile */}
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden text-white/80 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 space-y-2 overflow-y-auto hide-scrollbar">
                            {navItems.map((item, index) => (
                                <GlassLink
                                    key={index}
                                    iconKey={item.iconKey}
                                    label={item.label}
                                    href={item.href}
                                    isSelected={pathname === item.href}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </nav>

                        {/* Logout Button */}
                        <div className="space-y-2">
                            <GlassLink
                                label="Sign Out"
                                onClick={() => signOut({ callbackUrl: '/' })}
                                isCollapsed={isCollapsed}
                            />
                        </div>

                        {/* Botón collapse flotante (solo desktop) */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex items-center justify-center absolute -right-3 top-1/2 transform -translate-y-1/2 
                                w-6 h-6 rounded-full liquid-glass border border-white/30 text-white/80 hover:text-white 
                                hover:bg-white/20 hover:scale-110 transition-all duration-300 shadow-lg z-50"
                            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </aside>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Header */}
                        <nav
                            className="h-16 flex items-center justify-between p-4 px-8 
                           liquid-glass border-b border-white/20 
                           shadow-2xl sticky top-0 z-40"
                        >
                            {/* Search and Menu */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="lg:hidden text-white/80 hover:text-white transition liquid-glass rounded-xl p-2 border border-white/20"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                <div className="relative hidden sm:block">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 text-sm bg-transparent text-white placeholder-gray-400 rounded-xl 
                                       border border-white/20 focus:outline-none focus:border-white/50 w-64 liquid-glass"
                                    />
                                </div>
                            </div>

                            {/* User Profile and Notifications */}
                            <div className="flex items-center space-x-4 text-white">
                                <NotificationBell />
                                <RoleBadge role={userRole} />
                                <div className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white/10 transition rounded-xl">
                                    {userImage ? (
                                        <img src={userImage} alt="User avatar" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <User className="w-8 h-8" />
                                    )}
                                    <div className="hidden md:block">
                                        <span className="text-sm font-semibold">{userName}</span>
                                    </div>
                                </div>
                            </div>
                        </nav>

                        {/* Content */}
                        <main className="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar">
                            {children ? children : "Your view components will be rendered here."}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardLayout;