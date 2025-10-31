// app/dashboard/layout.jsx (o donde corresponda en tu estructura de rutas de Next.js)
import { Home, Music, Aperture, Settings } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';




const navItems = [
    { iconKey: 'home', label: 'Dashboard', href: '/admin/home' },
    {iconKey: 'genre', label: 'Genres', href: '/admin/genres' },
    {iconKey: 'service', label: 'Services', href: '/admin/services' },
   
];


export default function AdminLayout({ children }) {
    return (
        <DashboardLayout navItems={navItems}>
            {children}
        </DashboardLayout>
    );
}