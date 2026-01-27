'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Home, DollarSign } from 'lucide-react';

import Button from '@/components/Button';
import Table from '@/components/Table';
import BreadcrumbsTitle from '@/components/Breadcrumbs';
import usePaymentProviders from '@/hooks/usePaymentProviders';

export default function PaymentProvidersPage() {
    const router = useRouter();
    const {
        providers,
        loading,
        fetchProviders
    } = usePaymentProviders();

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const columns = [
        {
            key: 'name',
            label: 'Provider',
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span className="font-semibold">{val}</span>
                </div>
            )
        },
        {
            key: 'percentageFee',
            label: 'Percentage Fee',
            render: (val) => (
                <span className="text-amber-400 font-bold">{val}%</span>
            )
        },
        {
            key: 'fixedFee',
            label: 'Fixed Fee',
            render: (val) => (
                <span className="text-green-400 font-bold">${val.toFixed(2)}</span>
            )
        },
        {
            key: 'internationalPercentageFee',
            label: 'Intl. Percentage',
            render: (val) => (
                <span className="text-amber-300 text-sm">
                    {val ? `${val}%` : '-'}
                </span>
            )
        },
        {
            key: 'internationalFixedFee',
            label: 'Intl. Fixed',
            render: (val) => (
                <span className="text-green-300 text-sm">
                    {val ? `$${val.toFixed(2)}` : '-'}
                </span>
            )
        },
        {
            key: 'active',
            label: 'Status',
            render: (val) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${val
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-gray-500/20 text-gray-400'
                    }`}>
                    {val ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ];

    // Calcular ejemplo de comisión
    const calculateExample = (provider, amount = 100) => {
        const percentageFee = (amount * provider.percentageFee) / 100;
        const totalFee = percentageFee + provider.fixedFee;
        const netAmount = amount - totalFee;
        return { totalFee, netAmount };
    };

    return (
        <div className="space-y-8">
            <BreadcrumbsTitle
                title="Payment Provider Fees"
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Payment Providers' },
                ]}
            />

            <div className="p-6 border border-white/20 rounded-2xl liquid-glass">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Provider Fees Configuration</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Manage commission fees for payment processors
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push('/admin/payment-providers/new')}
                        color="blue"
                        size="lg"
                        className="px-8 flex items-center gap-2"
                    >
                        <DollarSign size={20} />
                        New Provider
                    </Button>
                </div>

                {/* Example Calculator */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase mb-1">Example Transaction</p>
                        <p className="text-2xl font-bold text-white">$100.00</p>
                    </div>
                    {providers.filter(p => p.active).slice(0, 2).map(provider => {
                        const example = calculateExample(provider);
                        return (
                            <div key={provider.id} className="text-center border-l border-white/10 pl-4">
                                <p className="text-xs text-gray-500 uppercase mb-1">{provider.name}</p>
                                <p className="text-lg font-bold text-red-400">-${example.totalFee.toFixed(2)}</p>
                                <p className="text-xs text-gray-400">Net: ${example.netAmount.toFixed(2)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            <Table
                columns={columns}
                loading={loading}
                data={providers}
                renderActions={(provider) => (
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={() => router.push(`/admin/payment-providers/${provider.id}/edit`)}
                            color="blue"
                            size="sm"
                            className="p-2 border-0 hover:scale-100"
                            variant="secondary"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            />
        </div>
    );
}
