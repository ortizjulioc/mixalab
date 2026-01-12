'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Home, CheckCircle, XCircle } from 'lucide-react';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Table from '@/components/Table';
import BreadcrumbsTitle from '@/components/Breadcrumbs';
import Pagination from '@/components/Pagination';
import useAcceptanceConditions from '@/hooks/useAcceptanceConditions';

export default function AcceptanceConditionsPage() {
    const router = useRouter();
    const {
        conditions,
        pagination,
        loading,
        filters,
        handleChangeFilter,
        fetchConditions,
        deleteCondition
    } = useAcceptanceConditions();

    useEffect(() => {
        fetchConditions();
    }, [fetchConditions]);

    const columns = [
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
        { key: 'fieldName', label: 'Field Name', render: (val) => <code className="text-xs text-gray-400">{val}</code> },
        { key: 'label', label: 'Label' },
        { key: 'order', label: 'Order', render: (val) => <span className="text-gray-400">{val}</span> },
        {
            key: 'required', label: 'Required', render: (val) => (
                val ? <CheckCircle className="text-green-500" size={18} /> : <XCircle className="text-gray-600" size={18} />
            )
        },
        {
            key: 'active', label: 'Active', render: (val) => (
                val ? <CheckCircle className="text-green-500" size={18} /> : <XCircle className="text-red-500" size={18} />
            )
        }
    ];

    return (
        <div className="space-y-8">
            <BreadcrumbsTitle
                title="Acceptance Conditions"
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Acceptance Conditions' },
                ]}
            />

            <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass w-full">
                <div className="flex-1 w-full">
                    <Input
                        type="text"
                        placeholder="Search conditions..."
                        value={filters.search}
                        onChange={(e) => handleChangeFilter('search', e.target.value)}
                        className="w-full p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
                    />
                </div>

                <div className="flex-none">
                    <Button
                        onClick={() => router.push('/admin/acceptance-conditions/new')}
                        color="blue"
                        size="lg"
                        className="px-8 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        New Condition
                    </Button>
                </div>
            </div>

            <Table
                columns={columns}
                loading={loading}
                data={conditions}
                renderActions={(condition) => (
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={() => router.push(`/admin/acceptance-conditions/${condition.id}/edit`)}
                            color="blue"
                            size="sm"
                            className="p-2 border-0 hover:scale-100"
                            variant="secondary"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => deleteCondition(condition.id)}
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
