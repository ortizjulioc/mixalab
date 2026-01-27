// app/dashboard/layout.jsx (o donde corresponda en tu estructura de rutas de Next.js)
import { Home, Music, Aperture, Settings } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';




const navItems = [
    { iconKey: 'home', label: 'Dashboard', href: '/admin/home' },
    { iconKey: 'creator-profiles', label: 'Creator Profiles', href: '/admin/creator-profiles' },
    { iconKey: 'genre', label: 'Genres', href: '/admin/genres' },
    { iconKey: 'users', label: 'Users', href: '/admin/users' },
    { iconKey: 'tiers', label: 'Tiers', href: '/admin/tiers' },
    { iconKey: 'add-ons', label: 'Add-Ons', href: '/admin/add-ons' },
    { iconKey: 'payment-providers', label: 'Payment Providers', href: '/admin/payment-providers' },
    { iconKey: 'acceptance-conditions', label: 'Acceptance Conditions', href: '/admin/acceptance-conditions' },
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