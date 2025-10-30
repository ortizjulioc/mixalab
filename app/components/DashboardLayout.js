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
                className={`flex items-center space-x-4 p-3 rounded-xl transition duration-300 ease-in-out 
                        text-white font-medium hover:bg-white/10 hover:shadow-md w-full text-left
                        ${isSelected ? 'bg-white/15 border-l-4 border-white' : ''}`}
            >
                <LogOut className="w-8 h-8 text-white/80" /> {/* Ícono fijo para logout, tamaño aumentado */}
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
            className={`flex items-center space-x-4 p-3 rounded-xl transition duration-300 ease-in-out 
                    text-white font-medium hover:bg-white/10 hover:shadow-md w-full text-left block
                    ${isSelected ? 'bg-white/15 border-l-4 border-white' : ''}`}
        >
            <div className="w-8 h-8 text-white/80 flex items-center justify-center"> {/* Tamaño aumentado a w-8 h-8 */}
                {IconElement} {/* Renderiza el JSX del ícono */}
            </div>
            <span className="hidden lg:block">{label}</span>
        </Link>
    );
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

    return (
        // Main container with dark, atmospheric background
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
                     bg-white/5 backdrop-blur-xl border-r border-white/20 
                     shadow-xl transition-all duration-300"
                >
                    {/* Logo/Title Area */}
                    <div className="flex items-center  lg:justify-start h-16 border-b border-white/20 pb-4">
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

                    {/* Logout Button */}
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
                       bg-white/5 backdrop-blur-xl border-b border-white/20 
                       shadow-lg"
                    >
                        {/* Search and Menu */}
                        <div className="flex items-center space-x-4">
                            <button className="lg:hidden text-white/80 hover:text-white transition"><Menu /></button>
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 text-sm bg-white/10 text-white placeholder-gray-400 rounded-lg 
                                   border border-white/20 focus:outline-none focus:border-white/50 w-64"
                                />
                            </div>
                        </div>

                        {/* User Profile and Notifications */}
                        <div className="flex items-center space-x-4 text-white">
                            <Bell className="w-6 h-6 hover:text-white/80 transition cursor-pointer" />
                            <div className="flex items-center space-x-3 cursor-pointer p-2 rounded-full hover:bg-white/10 transition">
                                {userImage ? (
                                    <img src={userImage} alt="User avatar" className="w-6 h-6 rounded-full" />
                                ) : (
                                    <User className="w-6 h-6" />
                                )}
                                <span className="text-sm font-semibold hidden md:block">{userName}</span>
                            </div>
                        </div>
                    </nav>

                    {/* 4. Content (Children) - Área principal de las vistas */}
                    <main className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="min-h-full">
                            {/* Aquí es donde se renderizarán los componentes hijos/vistas */}
                            {children ? children : "Your view components will be rendered here."}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;