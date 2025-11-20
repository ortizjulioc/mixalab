// app/dashboard/layout.jsx (o donde corresponda en tu estructura de rutas de Next.js)
import { Home, Music, Aperture, Settings } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';




const navItems = [
    { iconKey: 'home', label: 'Dashboard', href: '/admin/home' },
    { iconKey: 'genre', label: 'Genres', href: '/admin/genres' },
    { iconKey: 'service', label: 'Services', href: '/admin/services' },
    { iconKey: 'users', label: 'Users', href: '/admin/users' },
    { iconKey: 'tiers', label: 'Tiers', href: '/admin/tiers' },
    { iconKey: 'upgrade-requirements', label: 'Upgrade Requirements', href: '/admin/upgrade-requirements' },
    { iconKey: 'maintain-requirements', label: 'Maintain Requirements', href: '/admin/maintain-requirements ' },
    { iconKey: 'downgrade-triggers', label: 'Downgrade Triggers', href: '/admin/downgrade-triggers' }

];


export default function AdminLayout({ children }) {
    return (
        <DashboardLayout navItems={navItems}>
            {children}
        </DashboardLayout>
    );
}