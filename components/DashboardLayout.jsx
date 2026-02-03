'use client';

import React, { useState } from 'react';
import { LogOut, Menu, User, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
                        text-gray-400 font-medium hover:bg-white/5 hover:text-white hover:shadow-lg hover:-translate-y-0.5 w-full text-left
                        ${isSelected ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'border border-transparent'}`}
                title={isCollapsed ? label : ''}
            >
                <LogOut className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}`} />
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
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-2xl transition-all duration-300 ease-in-out 
                    text-gray-400 font-medium hover:bg-white/5 hover:text-white w-full text-left group
                    ${isSelected
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    : 'border border-transparent hover:border-white/10'}`}
            title={isCollapsed ? label : ''}
        >
            <div className={`flex-shrink-0 transition-colors duration-300 ${isSelected ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {/* Clone element to enforce size if needed, or rely on parent sizing */}
                {React.cloneElement(IconElement, { className: 'w-5 h-5' })}
            </div>
            {!isCollapsed && (
                <span className={`transition-all duration-300 ${isSelected ? 'text-indigo-100 font-semibold' : ''}`}>
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
                return 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ml-2';
            case 'CREATOR':
                return 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ml-2';
            case 'ADMIN':
                return 'bg-rose-500/10 border border-rose-500/30 text-rose-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ml-2';
            default:
                return 'bg-gray-500/10 border border-gray-500/30 text-gray-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ml-2';
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
            <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
                <div>Error: navItems debe ser un arreglo válido.</div>
            </div>
        );
    }

    // Manejar estado de carga
    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
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
        /* Estilos personalizados para scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            transition: background 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        /* Para Firefox */
        .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
        }
    `;

    return (
        <div className="h-screen w-full flex flex-col bg-[#050505] font-sans selection:bg-indigo-500/30 text-gray-200 overflow-hidden">
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
            </div>

            <div className="flex flex-1 relative z-10 h-full overflow-hidden">
                {/* Overlay para mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside
                    className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                            lg:translate-x-0 fixed lg:sticky lg:top-0 z-50
                            ${isCollapsed ? 'w-20' : 'w-72'} 
                            flex flex-col border-r border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl
                            transition-all duration-300 h-full shadow-2xl shadow-black/50`}
                >
                    {/* Logo/Title Area */}
                    <div className={`flex items-center h-20 border-b border-white/5 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-6'}`}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex-shrink-0 scale-90">
                                <Logo />
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col">
                                    <h2 className="text-white text-lg font-bold tracking-tight">Mixa Studio</h2>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold text-opacity-80">Platform</span>
                                </div>
                            )}
                        </div>
                        {/* Botón cerrar en mobile */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 py-6 px-3 space-y-8 overflow-y-auto custom-scrollbar">
                        <nav className="space-y-1">
                            {!isCollapsed && <p className="px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Menu</p>}
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
                    </div>

                    {/* User & Logout Section (Bottom) */}
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <GlassLink
                            label="Sign Out"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            isCollapsed={isCollapsed}
                        />
                    </div>

                    {/* Botón collapse flotante (solo desktop) */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`hidden lg:flex items-center justify-center absolute -right-3 top-20 transform translate-y-2
                                w-6 h-6 rounded-full bg-gray-900 border border-gray-700 text-gray-400 hover:text-white 
                                hover:border-indigo-500 hover:bg-gray-800 transition-all duration-300 shadow-xl z-50 group`}
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <ChevronRight className="w-3 h-3 group-hover:text-indigo-400" /> : <ChevronLeft className="w-3 h-3 group-hover:text-indigo-400" />}
                    </button>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col relative overflow-hidden bg-[#050505]">
                    {/* Header */}
                    <header
                        className={`h-20 flex items-center justify-between px-6 lg:px-10
                           border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md
                           sticky top-0 z-40 transition-all duration-300 shrink-0`}
                    >
                        {/* Left: Menu Toggle (Mobile) & Breadcrumbs/Title (Optional) */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-white/5"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Right: User Profile and Notifications */}
                        <div className="flex items-center gap-5">
                            <NotificationBell />

                            <div className="h-8 w-px bg-white/10 mx-1"></div>

                            <div className="flex items-center gap-3 pl-2 py-1.5 pr-4 rounded-xl hover:bg-white/5 transition ring-1 ring-transparent hover:ring-white/10 cursor-pointer group">
                                <div className="relative">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 p-[2px]">
                                        <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                            {userImage ? (
                                                <img src={userImage} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full bg-gray-800 text-gray-400">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]"></div>
                                </div>

                                <div className="hidden md:flex flex-col text-right">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{userName}</span>
                                        <RoleBadge role={userRole} />
                                    </div>
                                    <span className="text-xs text-gray-500">{session?.user?.email}</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-0">
                        <div className="max-w-7xl mx-auto w-full pb-24">
                            {children ? children : <div className="text-gray-500 italic">No content available</div>}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;