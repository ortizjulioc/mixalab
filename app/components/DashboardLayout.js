'use client';

import React from 'react';
// Íconos para elementos fijos como logout, menu, etc. (puedes agregar más si es necesario)
import { LogOut, Menu, Bell, Search, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../components/Logo';
import navigationIcon from './navigationIcon'; // Importa el objeto de íconos pre-renderizados

/**
 * Componente que representa un enlace o botón con estilo Liquid Glass.
 * Usa íconos pre-renderizados desde navigationIcon.
 */
const GlassLink = ({ iconKey, label, href, isSelected = false, onClick }) => {
    if (onClick) {
        // Para acciones como logout (usa íconos fijos aquí si es necesario)
        return (
            <button
                onClick={onClick}
                className={`flex items-center space-x-4 p-3 rounded-2xl transition duration-300 ease-in-out 
                        text-white font-medium hover:bg-white/10 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] w-full text-left liquid-glass
                        ${isSelected ? 'bg-white/15 border-l-4 border-white glow-border' : ''}`}
            >
                <LogOut className="w-8 h-8 text-white/80" /> {/* Ícono fijo para logout, tamaño 32px */}
                <span className="hidden lg:block">{label}</span>
            </button>
        );
    }

    const IconElement = navigationIcon[iconKey]; // Obtiene el JSX del ícono

    if (!IconElement) {
        console.warn(`Ícono no encontrado para la clave: ${iconKey}`); // Fallback para claves no mapeadas
        return null;
    }

    // Para enlaces de navegación
    return (
        <Link
            href={href}
            className={`flex items-center space-x-4 p-3 rounded-2xl transition duration-300 ease-in-out 
                    text-white font-medium hover:bg-white/10 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] w-full text-left block liquid-glass
                    ${isSelected ? 'bg-white/15 border-l-4 border-white glow-border' : ''}`}
        >
            <div className="flex-shrink-0 text-white/80"> {/* Sin tamaño fijo, el ícono maneja su propio tamaño */}
                {IconElement} {/* Renderiza el JSX del ícono con size={32} definido en navigationIcon */}
            </div>
            <span className="hidden lg:block">{label}</span>
        </Link>
    );
};

/**
 * Componente de badge para el rol del usuario en estilo Liquid Glass.
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
 * Layout principal del dashboard con estilo Liquid Glass (Glassmorphism).
 * Incluye barra lateral, menú superior y área de contenido para hijos (children).
 * Usa useSession para obtener datos del usuario en componentes del cliente.
 * 
 * Props:
 * - children: ReactNode - Contenido principal a renderizar.
 * - navItems: Array<{ iconKey: string, label: string, href: string }> - Arreglo de ítems para la navegación lateral.
 *   Cada ítem debe incluir: iconKey (clave del ícono de navigationIcon, ej. 'home'), label (nombre), href (URL/path para Next.js).
 */
const DashboardLayout = ({ children, navItems }) => {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    console.log(session);

    // Validar que se pase navItems
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

    // Si no hay sesión, redirigir o mostrar algo, pero por ahora asumir autenticado
    if (!session) {
        return null; // O redirigir con useRouter si es necesario
    }

    // Datos del usuario desde la sesión
    const userName = session?.user?.name || "User";
    const userImage = session?.user?.image;
    const userRole = session?.user?.role || 'USER'; // Asume que el rol está en session.user.role

    // Definición de estilos CSS globales inspirados en el ejemplo (liquid-glass, glow-border, etc.)
    const globalStyles = `
        @keyframes pulse-glow {
            0%, 100% { text-shadow: 0 0 10px rgba(255, 255, 255, 0), 0 0 20px rgba(255, 255, 255, 0.2); }
            50% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.5); }
        }
        @keyframes wave-move {
            0% { transform: translateX(0) scaleX(1); }
            50% { transform: translateX(-1%) scaleX(1.02); }
            100% { transform: translateX(0) scaleX(1); }
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
    `;

    return (
        <>
            {/* Inyectar estilos globales */}
            <style>{globalStyles}</style>
            {/* Main container with dark, atmospheric background */}
            <div className="min-h-screen flex flex-col"
                style={{
                    backgroundImage: 'linear-gradient(135deg, #101010 0%, #000000 100%)',
                    fontFamily: 'Inter, sans-serif'
                }}>

                {/* Background Atmosphere/Particle Effect */}
                <div className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at top left, #333 1%, transparent 20%),
                                   radial-gradient(circle at bottom right, #333 1%, transparent 20%)`,
                        backgroundSize: '100% 100%',
                        animation: 'pulse 15s infinite alternate'
                    }}
                />
                {/* Custom CSS for the pulse animation */}
                <style>{`
            @keyframes pulse {
              0% { opacity: 0.15; }
              100% { opacity: 0.3; }
            }
          `}</style>

                <div className="flex flex-1 relative z-10">
                    {/* 1. Sidebar (Aside) - Estilo Liquid Glass */}
                    <aside
                        className="w-20 lg:w-64 flex flex-col p-4 space-y-6 
                         liquid-glass border-r border-white/20 
                         shadow-2xl transition-all duration-300"
                    >
                        {/* Logo/Title Area - Sin card style */}
                        <div className="flex items-center lg:justify-start h-16 border-b border-white/20 pb-4">
                            <Logo />
                            <h2 className="hidden lg:block text-white text-2xl font-bold ml-2">Mixa Studio</h2>
                        </div>

                        {/* Navigation Links */}
                        <nav className="flex-1 space-y-2">
                            {navItems.map((item, index) => (
                                <GlassLink
                                    key={index}
                                    iconKey={item.iconKey}
                                    label={item.label}
                                    href={item.href}
                                    isSelected={pathname === item.href}
                                />
                            ))}
                        </nav>

                        {/* Logout Button - Sin card style adicional */}
                        <div className="mt-auto pt-4 border-t border-white/20">
                            <GlassLink
                                label="Sign Out"
                                onClick={() => signOut({ callbackUrl: '/' })}
                            />
                        </div>
                    </aside>

                    {/* 2. Main Content Area */}
                    <div className="flex-1 flex flex-col overflow-hidden">

                        {/* 3. Header (Top Menu) - Estilo Liquid Glass */}
                        <nav
                            className="h-16 flex items-center justify-between p-4 px-8 
                           liquid-glass border-b border-white/20 
                           shadow-2xl sticky top-0 z-40"
                        >
                            {/* Search and Menu */}
                            <div className="flex items-center space-x-4">
                                <button className="lg:hidden text-white/80 hover:text-white transition liquid-glass rounded-xl p-2 border border-white/20"><Menu className="w-5 h-5" /></button>
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

                            {/* User Profile and Notifications - Sin card style adicional */}
                            <div className="flex items-center space-x-4 text-white">
                                <Bell size={33} className=" hover:text-white/80 transition cursor-pointer liquid-glass rounded-xl p-2 border border-white/20 animate-pulse-glow" />
                                 <RoleBadge role={userRole} />
                                <div className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-white/10 transition">
                                    {userImage ? (
                                        <img src={userImage} alt="User avatar" className="w-6 h-6 rounded-full" />
                                    ) : (
                                        <User className="w-6 h-6" />
                                    )}
                                    <div className="hidden md:block">
                                        <span className="text-sm font-semibold">{userName}</span>
                                       
                                    </div>
                                </div>
                            </div>
                        </nav>

                        {/* 4. Content (Children) - Área principal de las vistas */}
                        <main className="flex-1 overflow-y-auto p-4 md:p-8">
                            <div className="min-h-full liquid-glass rounded-[40px] border border-white/20 p-8 shadow-2xl glow-border transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                                {/* Aquí es donde se renderizarán los componentes hijos/vistas */}
                                {children ? children : "Your view components will be rendered here."}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardLayout;