'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Home } from 'lucide-react';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Table from '@/components/Table';
import BreadcrumbsTitle from '@/components/Breadcrumbs';
import Pagination from '@/components/Pagination';
import useAddOns from '@/hooks/useAddOns';

export default function AdminAddOnsPage() {
    const router = useRouter();
    const {
        addOns,
        pagination,
        loading,
        filters,
        handleChangeFilter,
        fetchAddOns,
        deleteAddOn
    } = useAddOns();

    useEffect(() => {
        fetchAddOns();
    }, [fetchAddOns]);

    const columns = [
        {
            key: 'icon', label: 'Icon', render: (val) => <span className="text-xl">{val}</span>
        },
        { key: 'name', label: 'Name' },
        {
            key: 'serviceType', label: 'Service', render: (val) => (
                <span className={`text-xs font-bold px-2 py-1 rounded bg-zinc-800 w-fit ${val === 'MIXING' ? 'text-cyan-400' :
                    val === 'MASTERING' ? 'text-purple-400' :
                        'text-green-400'
                    }`}>
                    {val}
                </span>
            )
        },
        {
            key: 'price', label: 'Price', render: (val, row) => (
                <span className="text-amber-500 font-bold">
                    {val !== null ? `$${val}` : `$${row.pricePerUnit} / u`}
                </span>
            )
        },
        {
            key: 'description', label: 'Description', render: (val) => (
                <span className="text-gray-400 text-sm truncate max-w-[200px] block" title={val}>
                    {val}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <BreadcrumbsTitle
                title="Add-Ons"
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Add-Ons' },
                ]}
            />

            <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass w-full">
                <div className="flex-1 w-full">
                    <Input
                        type="text"
                        placeholder="Search add-ons..."
                        value={filters.search}
                        onChange={(e) => handleChangeFilter('search', e.target.value)}
                        className="w-full p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
                    />
                </div>

                <div className="flex-none">
                    <Button
                        onClick={() => router.push('/admin/add-ons/new')}
                        color="blue"
                        size="lg"
                        className="px-8 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        New Add-On
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                loading={loading}
                data={addOns}
                renderActions={(addon) => (
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={() => router.push(`/admin/add-ons/${addon.id}/edit`)}
                            color="blue"
                            size="sm"
                            className="p-2 border-0 hover:scale-100"
                            variant="secondary"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => deleteAddOn(addon.id)}
                            color="red"
                            size="sm"
                            className="p-2 border-0 hover:scale-100"
                            variant="secondary"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            />

            <Pagination
                pagination={pagination}
                onPageChange={(page) => handleChangeFilter('page', page)}
            />
        </div>
    );
};
