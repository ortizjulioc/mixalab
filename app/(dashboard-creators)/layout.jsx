import React from 'react';
// Íconos para la navegación del Dashboard
import { Home, Settings, User, LogOut, Menu, Bell, Search, Zap, Music, Aperture } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajusta la ruta según tu estructura de proyecto

// --- Componentes Reutilizables de Estilo Liquid Glass ---

// Define las propiedades de los elementos de menú para la barra lateral
const navItems = [
    { icon: Home, label: 'Dashboard', href: '#dashboard' },
    { icon: Music, label: 'Projects', href: '#projects' },
    { icon: Aperture, label: 'Library', href: '#library' },
    { icon: Settings, label: 'Settings', href: '#settings' },
];

/**
 * Componente que representa un enlace o botón con estilo Liquid Glass.
 */
const GlassLink = ({ icon: Icon, label, href, isSelected = false }) => (
    <a
        href={href}
        className={`flex items-center space-x-4 p-3 rounded-xl transition duration-300 ease-in-out 
                text-white font-medium hover:bg-white/10 hover:shadow-md 
                ${isSelected ? 'bg-white/15 border-l-4 border-white' : ''}`}
    >
        <Icon className="w-5 h-5 text-white/80" />
        <span className="hidden lg:block">{label}</span>
    </a>
);

// --- Componente Principal de Layout (DashboardLayout) ---

/**
 * Layout principal del dashboard con estilo Liquid Glass (Glassmorphism).
 * Incluye barra lateral, menú superior y área de contenido para hijos (children).
 * Usa getServerSession para obtener datos del usuario en componentes del servidor.
 */
const DashboardLayout = async ({ children }) => {
    // Obtener la sesión del servidor
    const session = await getServerSession(authOptions);

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
                    <div className="flex items-center justify-center lg:justify-start h-16 border-b border-white/20 pb-4">
                        <Zap className="w-8 h-8 text-white" />
                        <h2 className="hidden lg:block text-white text-xl font-bold ml-2">Mixa Studio</h2>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item, index) => (
                            <GlassLink
                                key={index}
                                icon={item.icon}
                                label={item.label}
                                href={item.href}
                                isSelected={item.label === 'Dashboard'}
                            />
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <div className="mt-auto pt-4 border-t border-white/20">
                        <GlassLink icon={LogOut} label="Sign Out" href="#logout" />
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