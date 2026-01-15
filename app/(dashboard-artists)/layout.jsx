// app/dashboard/layout.jsx (o donde corresponda en tu estructura de rutas de Next.js)
import { Home, Music, Aperture, Settings } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';



const navItems = [
    { iconKey: 'home', label: 'Dashboard', href: '/artists/home' },
    { iconKey: 'product', label: 'Order', href: '/artists/order' },
    { iconKey: 'customer', label: 'Profile', href: '/artists/profile' },

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