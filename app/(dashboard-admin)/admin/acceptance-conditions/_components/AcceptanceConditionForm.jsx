'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BreadcrumbsTitle from '@/components/Breadcrumbs';
import { Save, Home } from 'lucide-react';

import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import useAcceptanceConditions from '@/hooks/useAcceptanceConditions';

const AcceptanceConditionForm = ({ initialData = {}, isEditing = false }) => {
    const router = useRouter();
    const { createCondition, updateCondition } = useAcceptanceConditions();
    const [loading, setLoading] = useState(false);

    // Default form state
    const [formData, setFormData] = useState({
        serviceType: 'MIXING',
        fieldName: '',
        label: '',
        description: '',
        order: 0,
        required: true,
        active: true,
        ...initialData
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let result;
            if (isEditing) {
                result = await updateCondition(initialData.id, formData);
            } else {
                result = await createCondition(formData);
            }

            if (result === true) {
                router.push('/admin/acceptance-conditions');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <BreadcrumbsTitle
                title={isEditing ? 'Edit Acceptance Condition' : 'Create New Acceptance Condition'}
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Acceptance Conditions', href: '/admin/acceptance-conditions' },
                    { label: isEditing ? 'Edit' : 'Create' },
                ]}
            />

            <div className="p-8 border border-white/20 rounded-2xl liquid-glass space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Condition Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label="Service Type"
                        id="serviceType"
                        options={[
                            { value: 'MIXING', label: 'Mixing' },
                            { value: 'MASTERING', label: 'Mastering' },
                            { value: 'RECORDING', label: 'Recording' }
                        ]}
                        value={formData.serviceType}
                        onChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
                        required
                    />

                    <Input
                        label="Field Name"
                        name="fieldName"
                        type="text"
                        required
                        value={formData.fieldName}
                        onChange={handleChange}
                        placeholder="Ex: stemsReady, mixReady"
                    />
                </div>

                <Input
                    label="Label (Display Text)"
                    name="label"
                    type="text"
                    required
                    value={formData.label}
                    onChange={handleChange}
                    placeholder="Ex: I confirm my stems are properly prepared"
                />

                <Input
                    label="Description"
                    name="description"
                    as="textarea"
                    rows={3}
                    value={formData.description || ''}
                    onChange={handleChange}
                    placeholder="Additional information or tooltip text..."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Display Order"
                        name="order"
                        type="number"
                        value={formData.order}
                        onChange={handleChange}
                        placeholder="0"
                    />

                    <div className="space-y-4 pt-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="required"
                                checked={formData.required}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-700 text-amber-500 focus:ring-amber-500 bg-black"
                            />
                            <span className="text-white font-medium">Required</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gray-700 text-amber-500 focus:ring-amber-500 bg-black"
                            />
                            <span className="text-white font-medium">Active</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 justify-end pt-4 border-t border-white/10">
                    <Button
                        type="button"
                        color="gray"
                        onClick={() => router.push('/admin/acceptance-conditions')}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="blue"
                        loading={loading}
                        className="flex items-center gap-2"
                    >
                        <Save size={18} />
                        {isEditing ? 'Update' : 'Create'} Condition
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default AcceptanceConditionForm;
