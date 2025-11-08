// app/users/page.js
'use client';

import React, { useState } from 'react';
import { Edit, Trash2, KeyRound, Home } from 'lucide-react';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import Input from '@/components/Input';
import Select from '@/components/Select';
import BreadcrumbsTitle from '@/components/Breadcrumbs';

// 🏷️ Role badge
const RoleBadge = ({ role }) => {
    const getRoleStyles = (role) => {
        switch (role?.toUpperCase()) {
            case 'ARTIST':
                return 'liquid-glass border border-blue-500/30 text-blue-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border';
            case 'CREATOR':
                return 'liquid-glass border border-green-500/30 text-green-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border';
            case 'ADMIN':
                return 'liquid-glass border border-red-500/30 text-red-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border';
            case 'SUPER_ADMIN':
                return 'liquid-glass border border-purple-500/30 text-purple-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border';
            default:
                return 'liquid-glass border border-gray-500/30 text-gray-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border';
        }
    };
    return <span className={getRoleStyles(role)}>{role}</span>;
};

// 🏷️ Status badge
const StatusBadge = ({ status }) => {
    const getStatusStyles = (status) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE':
                return 'liquid-glass border border-green-500/30 text-green-200 px-2 py-1 rounded-full text-xs font-semibold glow-border';
            case 'UNVERIFIED':
                return 'liquid-glass border border-yellow-500/30 text-yellow-200 px-2 py-1 rounded-full text-xs font-semibold glow-border';
            case 'SUSPENDED':
                return 'liquid-glass border border-orange-500/30 text-orange-200 px-2 py-1 rounded-full text-xs font-semibold glow-border';
            case 'BANNED':
                return 'liquid-glass border border-red-500/30 text-red-200 px-2 py-1 rounded-full text-xs font-semibold glow-border';
            case 'PENDING_REVIEW':
                return 'liquid-glass border border-blue-500/30 text-blue-200 px-2 py-1 rounded-full text-xs font-semibold glow-border';
            default:
                return 'liquid-glass border border-gray-500/30 text-gray-200 px-2 py-1 rounded-full text-xs font-semibold glow-border';
        }
    };
    return <span className={getStatusStyles(status)}>{status}</span>;
};

export default function UsersPage() {
    const [users, setUsers] = useState([
        {
            id: '1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'ADMIN',
            status: 'ACTIVE',
            createdAt: new Date('2023-08-20'),
        },
        {
            id: '2',
            name: 'Bob Martinez',
            email: 'bob@example.com',
            role: 'ARTIST',
            status: 'UNVERIFIED',
            createdAt: new Date('2023-10-12'),
        },
        {
            id: '3',
            name: 'Carla Gomez',
            email: 'carla@example.com',
            role: 'CREATOR',
            status: 'ACTIVE',
            createdAt: new Date('2024-01-05'),
        },
    ]);

    const [filters, setFilters] = useState({ search: '' });
    const [pagination, setPagination] = useState({ page: 1, pages: 1 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [passwords, setPasswords] = useState({ new: '', repeat: '' });

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('ARTIST');
    const [status, setStatus] = useState('UNVERIFIED');

    const roleOptions = [
        { value: 'ARTIST', label: 'Artist' },
        { value: 'CREATOR', label: 'Creator' },
        { value: 'ADMIN', label: 'Admin' },
        { value: 'SUPER_ADMIN', label: 'Super Admin' },
    ];

    const statusOptions = [
        { value: 'UNVERIFIED', label: 'Unverified' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'SUSPENDED', label: 'Suspended' },
        { value: 'BANNED', label: 'Banned' },
        { value: 'CLOSED', label: 'Closed' },
        { value: 'PENDING_REVIEW', label: 'Pending Review' },
    ];

    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            u.email.toLowerCase().includes(filters.search.toLowerCase())
    );

    const handleChangeFilter = (key, value) => setFilters({ ...filters, [key]: value });

    const openModal = (id) => {
        if (id) {
            const user = users.find((u) => u.id === id);
            if (user) {
                setEditingId(id);
                setName(user.name);
                setEmail(user.email);
                setRole(user.role);
                setStatus(user.status);
            }
        } else {
            setEditingId(null);
            setName('');
            setEmail('');
            setRole('ARTIST');
            setStatus('UNVERIFIED');
        }
        setIsModalOpen(true);
    };

    const openPasswordModal = (id) => {
        setEditingId(id);
        setPasswords({ new: '', repeat: '' });
        setIsPasswordModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);
    const closePasswordModal = () => setIsPasswordModalOpen(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;

        setFormLoading(true);
        setTimeout(() => {
            if (editingId) {
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === editingId ? { ...u, name, email, role, status } : u
                    )
                );
            } else {
                setUsers((prev) => [
                    ...prev,
                    {
                        id: (prev.length + 1).toString(),
                        name,
                        email,
                        role,
                        status,
                        createdAt: new Date(),
                    },
                ]);
            }
            setFormLoading(false);
            closeModal();
        }, 700);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.repeat) {
            alert('Passwords do not match!');
            return;
        }
        alert(`Password updated for user ID ${editingId}`);
        closePasswordModal();
    };

    const handleDelete = (id) => {
        if (confirm('Delete this user?')) {
            setUsers((prev) => prev.filter((u) => u.id !== id));
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 shadow-2xl">
            <BreadcrumbsTitle
                title="Users"
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Users' },
                ]}
            />
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass">
                <div className="flex-1">
                    <Input
                        placeholder="Search users..."
                        className="w-full"
                        value={filters.search}
                        onChange={(e) => handleChangeFilter('search', e.target.value)}
                    />
                </div>
                <Button
                    onClick={() => openModal()}
                    color="blue"
                    size="lg"
                    className="px-8 w-full sm:w-auto"
                >
                    New User
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-white/20 rounded-2xl liquid-glass">
                <table className="w-full">
                    <thead>
                        <tr className="bg-white/5">
                            <th className="p-4 text-left text-white font-semibold border-b border-white/20">Name</th>
                            <th className="p-4 text-left text-white font-semibold border-b border-white/20">Email</th>
                            <th className="p-4 text-left text-white font-semibold border-b border-white/20">Role</th>
                            <th className="p-4 text-left text-white font-semibold border-b border-white/20">Status</th>
                            <th className="p-4 text-left text-white font-semibold border-b border-white/20">Created</th>
                            <th className="p-4 text-right text-white font-semibold border-b border-white/20">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-white/10 hover:bg-white/5 transition">
                                <td className="p-4 text-white">{user.name}</td>
                                <td className="p-4 text-gray-300">{user.email}</td>
                                <td className="p-4 text-gray-300"><RoleBadge role={user.role} /></td>
                                <td className="p-4 text-gray-300"><StatusBadge status={user.status} /></td>
                                <td className="p-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 text-right flex justify-end space-x-2">
                                    <Button onClick={() => openModal(user.id)} color="blue" size="sm" className="p-2" variant="secondary">
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => openPasswordModal(user.id)} color="yellow" size="sm" className="p-2" variant="secondary">
                                        <KeyRound className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => handleDelete(user.id)} color="red" size="sm" className="p-2" variant="secondary">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Pagination
                    pagination={pagination}
                    onPageChange={(newPage) => setPagination({ ...pagination, page: newPage })}
                />
            </div>

            {/* 🧩 User Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-transparent liquid-glass rounded-2xl border border-white/20 p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-white">
                            {editingId ? 'Edit User' : 'Create User'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
                            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <Select label="Role" value={role} options={roleOptions} onChange={setRole} required />
                            <Select label="Status" value={status} options={statusOptions} onChange={setStatus} required />

                            <div className="flex justify-end space-x-3">
                                <Button type="button" onClick={closeModal} color="gray" size="md" variant="secondary">
                                    Cancel
                                </Button>
                                <Button type="submit" color="blue" size="md" loading={formLoading} disabled={formLoading}>
                                    {editingId ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🔐 Password Change Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-transparent liquid-glass rounded-2xl border border-white/20 p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-white">Change Password</h2>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <Input
                                label="New Password"
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                required
                            />
                            <Input
                                label="Repeat Password"
                                type="password"
                                value={passwords.repeat}
                                onChange={(e) => setPasswords({ ...passwords, repeat: e.target.value })}
                                required
                            />
                            <div className="flex justify-end space-x-3">
                                <Button type="button" onClick={closePasswordModal} color="gray" size="md" variant="secondary">
                                    Cancel
                                </Button>
                                <Button type="submit" color="blue" size="md">
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
