// app/dashboard/layout.jsx (o donde corresponda en tu estructura de rutas de Next.js)
import { Home, Music, Aperture, Settings } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';




const navItems = [
    { iconKey: 'home', label: 'Dashboard', href: '/creators/home' },
    { iconKey: 'product', label: 'Requests', href: '/creators/requests' },
    { iconKey: 'folder', label: 'My Projects', href: '/creators/projects' },
    { iconKey: 'settings', label: 'Security Pass', href: '/creators/securitypass' },
    { iconKey: 'customer', label: 'Profile', href: '/creators/profile' },
];


export default function CreatorsLayout({ children }) {
    return (
        <DashboardLayout navItems={navItems}>
            {children}
        </DashboardLayout>
    );
}