'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Home, Save } from 'lucide-react';

import Button from '@/components/Button';
import Input from '@/components/Input';
import BreadcrumbsTitle from '@/components/Breadcrumbs';
import usePaymentProviders from '@/hooks/usePaymentProviders';

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    percentageFee: Yup.number().min(0, 'Must be >= 0').max(100, 'Must be <= 100').required('Percentage fee is required'),
    fixedFee: Yup.number().min(0, 'Must be >= 0').required('Fixed fee is required'),
    internationalPercentageFee: Yup.number().min(0, 'Must be >= 0').max(100, 'Must be <= 100').nullable(),
    internationalFixedFee: Yup.number().min(0, 'Must be >= 0').nullable(),
});

export default function EditPaymentProviderPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { fetchProviderById, updateProvider } = usePaymentProviders();
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProvider = async () => {
            try {
                const data = await fetchProviderById(id);
                setProvider(data);
            } catch (error) {
                console.error('Error loading provider:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProvider();
    }, [id, fetchProviderById]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="text-center text-white">
                <p>Provider not found</p>
            </div>
        );
    }

    // Calculate example fees
    const calculateFee = (amount, percentageFee, fixedFee) => {
        const percentage = (amount * percentageFee) / 100;
        return percentage + fixedFee;
    };

    return (
        <div className="space-y-8">
            <BreadcrumbsTitle
                title={`Edit ${provider.name} Fees`}
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Payment Providers', href: '/admin/payment-providers' },
                    { label: 'Edit' },
                ]}
            />

            <div className="p-8 border border-white/20 rounded-2xl liquid-glass">
                <Formik
                    enableReinitialize
                    initialValues={{
                        name: provider?.name || '',
                        percentageFee: provider?.percentageFee ?? 0,
                        fixedFee: provider?.fixedFee ?? 0,
                        internationalPercentageFee: provider?.internationalPercentageFee ?? null,
                        internationalFixedFee: provider?.internationalFixedFee ?? null,
                        description: provider?.description || '',
                        active: provider?.active ?? true,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            await updateProvider(id, values);
                            router.push('/admin/payment-providers');
                        } catch (error) {
                            console.error('Error updating provider:', error);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ values, setFieldValue, touched, errors, isSubmitting }) => (
                        <Form className="space-y-6">
                            {/* Provider Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white mb-4">Provider Information</h3>

                                <Input
                                    label="Provider Name"
                                    name="name"
                                    type="text"
                                    value={values.name}
                                    onChange={(e) => setFieldValue('name', e.target.value)}
                                    error={touched.name && errors.name}
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                                    <textarea
                                        value={values.description || ''}
                                        onChange={(e) => setFieldValue('description', e.target.value)}
                                        className="w-full p-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                                        rows={2}
                                        placeholder="Optional description..."
                                    />
                                </div>
                            </div>

                            {/* Domestic Fees */}
                            <div className="pt-6 border-t border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Domestic Transaction Fees</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Percentage Fee (%)"
                                        name="percentageFee"
                                        type="number"
                                        step="0.01"
                                        value={values.percentageFee}
                                        onChange={(e) => setFieldValue('percentageFee', Number(e.target.value))}
                                        error={touched.percentageFee && errors.percentageFee}
                                        placeholder="2.9"
                                        required
                                    />

                                    <Input
                                        label="Fixed Fee ($)"
                                        name="fixedFee"
                                        type="number"
                                        step="0.01"
                                        value={values.fixedFee}
                                        onChange={(e) => setFieldValue('fixedFee', Number(e.target.value))}
                                        error={touched.fixedFee && errors.fixedFee}
                                        placeholder="0.30"
                                        required
                                    />
                                </div>

                                {/* Example Calculator */}
                                <div className="mt-4 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                                    <p className="text-xs text-gray-500 uppercase mb-2">Example: $100 transaction</p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-400">Fee</p>
                                            <p className="text-xl font-bold text-red-400">
                                                ${calculateFee(100, values.percentageFee, values.fixedFee).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400">Net Amount</p>
                                            <p className="text-xl font-bold text-green-400">
                                                ${(100 - calculateFee(100, values.percentageFee, values.fixedFee)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* International Fees */}
                            <div className="pt-6 border-t border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">International Transaction Fees (Optional)</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="International Percentage Fee (%)"
                                        name="internationalPercentageFee"
                                        type="number"
                                        step="0.01"
                                        value={values.internationalPercentageFee ?? ''}
                                        onChange={(e) => setFieldValue('internationalPercentageFee', e.target.value === '' ? null : Number(e.target.value))}
                                        error={touched.internationalPercentageFee && errors.internationalPercentageFee}
                                        placeholder="3.9"
                                    />

                                    <Input
                                        label="International Fixed Fee ($)"
                                        name="internationalFixedFee"
                                        type="number"
                                        step="0.01"
                                        value={values.internationalFixedFee ?? ''}
                                        onChange={(e) => setFieldValue('internationalFixedFee', e.target.value === '' ? null : Number(e.target.value))}
                                        error={touched.internationalFixedFee && errors.internationalFixedFee}
                                        placeholder="0.50"
                                    />
                                </div>

                                {values.internationalPercentageFee !== null && values.internationalFixedFee !== null && (
                                    <div className="mt-4 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                                        <p className="text-xs text-gray-500 uppercase mb-2">Example: $100 international transaction</p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-400">Fee</p>
                                                <p className="text-xl font-bold text-red-400">
                                                    ${calculateFee(100, values.internationalPercentageFee, values.internationalFixedFee).toFixed(2)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-400">Net Amount</p>
                                                <p className="text-xl font-bold text-green-400">
                                                    ${(100 - calculateFee(100, values.internationalPercentageFee, values.internationalFixedFee)).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div className="pt-6 border-t border-white/10">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={values.active}
                                        onChange={(e) => setFieldValue('active', e.target.checked)}
                                        className="w-5 h-5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500 bg-zinc-900"
                                    />
                                    <div>
                                        <span className="text-white font-medium block">Active</span>
                                        <span className="text-xs text-gray-500">Enable this payment provider</span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-4 justify-end pt-4">
                                <Button
                                    type="button"
                                    color="gray"
                                    onClick={() => router.push('/admin/payment-providers')}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" color="blue" loading={isSubmitting}>
                                    <Save size={18} className="mr-2" />
                                    Update Provider
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}
