// app/dashboard/layout.jsx (o donde corresponda en tu estructura de rutas de Next.js)
import { Home, Music, Aperture, Settings } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';




const navItems = [
    { iconKey: 'home', label: 'Dashboard', href: '/creators/home' },
    { iconKey: 'product', label: 'Projects', href: '/creators/projects' },
    { iconKey: 'customer', label: 'Library', href: '/creators/library' },
    { iconKey: 'maintenance', label: 'Settings', href: '/creators/settings' },

];


export default function CreatorsLayout({ children }) {
    return (
        <DashboardLayout navItems={navItems}>
            {children}
        </DashboardLayout>
    );
}