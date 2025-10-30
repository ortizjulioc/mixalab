// app/dashboard/layout.jsx (o donde corresponda en tu estructura de rutas de Next.js)
import { Home, Music, Aperture, Settings } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';



const navItems = [
    { iconKey: 'home', label: 'Dashboard', href: '/dashboard' },
    { iconKey: 'product', label: 'Projects', href: '/dashboard/projects' },
    { iconKey: 'customer', label: 'Library', href: '/dashboard/library' },
    { iconKey: 'maintenance', label: 'Settings', href: '/dashboard/settings' },
   
];

/**
 * Layout para las rutas del dashboard.
 * Envuelve el DashboardLayout con los navItems personalizados.
 */
export default function ArtistLayout({ children }) {
    return (
        <DashboardLayout navItems={navItems}>
            {children}
        </DashboardLayout>
    );
}