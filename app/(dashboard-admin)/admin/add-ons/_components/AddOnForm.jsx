'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BreadcrumbsTitle from '@/components/Breadcrumbs';
import { Save, Info, Plus, X, Home } from 'lucide-react';

import Input from '@/components/Input';
import Select from '@/components/Select';
import EmojiSelect from '@/components/EmojiSelect';
import useAddOns from '@/hooks/useAddOns';

const AddOnForm = ({ initialData = {}, isEditing = false }) => {
    const router = useRouter();
    const { createAddOn, updateAddOn } = useAddOns();
    const [loading, setLoading] = useState(false);

    // Default form state
    const [formData, setFormData] = useState({
        serviceType: 'MIXING',
        name: '',
        description: '',
        price: '',
        pricePerUnit: '',
        isQuantityBased: false,
        isMultiSelect: false,
        options: [],
        icon: '',
        badge: '',
        tierRestriction: [],
        addsDays: '',
        active: true,
        ...initialData
    });

    // Helper for multi-select options
    const [newOption, setNewOption] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEmojiChange = (emoji) => {
        setFormData(prev => ({ ...prev, icon: emoji }));
    };

    const handleOptionAdd = () => {
        if (!newOption.trim()) return;
        setFormData(prev => ({
            ...prev,
            options: [...(prev.options || []), newOption.trim()]
        }));
        setNewOption('');
    };

    const handleOptionRemove = (index) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const handleTierToggle = (tier) => {
        const currentTiers = formData.tierRestriction || [];
        if (currentTiers.includes(tier)) {
            setFormData(prev => ({
                ...prev,
                tierRestriction: currentTiers.filter(t => t !== tier)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                tierRestriction: [...currentTiers, tier]
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation logic
        const payload = { ...formData };
        if (payload.price === '') payload.price = null;
        if (payload.pricePerUnit === '') payload.pricePerUnit = null;
        if (payload.addsDays === '') payload.addsDays = null;

        // Ensure arrays are arrays or undefined
        if (payload.options && payload.options.length === 0) payload.options = undefined;
        if (payload.tierRestriction && payload.tierRestriction.length === 0) payload.tierRestriction = undefined;

        try {
            let result;
            if (isEditing) {
                result = await updateAddOn(initialData.id, payload);
            } else {
                result = await createAddOn(payload);
            }

            if (result === true) {
                router.push('/admin/add-ons');
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
                title={isEditing ? 'Edit Add-On' : 'Create New Add-On'}
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Add-Ons', href: '/admin/add-ons' },
                    { label: isEditing ? 'Edit' : 'Create' },
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white mb-4">General Information</h3>

                        <div className="grid grid-cols-2 gap-4">
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
                                label="Add-On Name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ex: Extra Fast Delivery"
                            />
                        </div>

                        <Input
                            label="Description"
                            name="description"
                            as="textarea"
                            rows={3}
                            value={formData.description || ''}
                            onChange={handleChange}
                            placeholder="Describe what this add-on includes..."
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <EmojiSelect
                                    label="Icon (Emoji)"
                                    value={formData.icon || ''}
                                    onChange={handleEmojiChange}
                                />
                            </div>
                            <Input
                                label="Badge"
                                name="badge"
                                type="text"
                                value={formData.badge || ''}
                                onChange={handleChange}
                                placeholder="Ex: Popular, Premium"
                            />
                        </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-6">
                        <h3 className="text-lg font-bold text-white mb-4">Pricing & Logic</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Fixed Price ($)"
                                name="price"
                                type="number"
                                step="0.01"
                                disabled={formData.pricePerUnit}
                                value={formData.price || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                            <Input
                                label="Price Per Unit ($)"
                                name="pricePerUnit"
                                type="number"
                                step="0.01"
                                disabled={formData.price}
                                value={formData.pricePerUnit || ''}
                                onChange={handleChange}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex flex-col gap-4 mt-4">
                            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-zinc-800 transition-colors">
                                <input
                                    type="checkbox"
                                    name="isQuantityBased"
                                    checked={formData.isQuantityBased}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500 bg-zinc-900"
                                />
                                <div>
                                    <span className="text-white font-medium block">Quantity Based</span>
                                    <span className="text-xs text-gray-500">Allows user to choose how many units (e.g. extra revisions)</span>
                                </div>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-zinc-800 transition-colors">
                                <input
                                    type="checkbox"
                                    name="isMultiSelect"
                                    checked={formData.isMultiSelect}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-zinc-600 text-amber-500 focus:ring-amber-500 bg-zinc-900"
                                />
                                <div>
                                    <span className="text-white font-medium block">Multi Select</span>
                                    <span className="text-xs text-gray-500">Checkboxes for multiple options (e.g. alternate versions)</span>
                                </div>
                            </label>
                        </div>

                        {formData.isMultiSelect && (
                            <div className="mt-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                                <label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Options</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        value={newOption}
                                        onChange={(e) => setNewOption(e.target.value)}
                                        placeholder="New option..."
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleOptionAdd())}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleOptionAdd}
                                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg border border-zinc-700"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {(formData.options || []).map((opt, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-zinc-800/50 px-3 py-2 rounded-lg text-sm text-gray-300">
                                            <span>{opt}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleOptionRemove(idx)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!formData.options || formData.options.length === 0) && (
                                        <span className="text-xs text-gray-600 italic">No options assigned</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Restrictions</h3>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400">Limited to Tiers:</label>
                            <div className="flex flex-wrap gap-2">
                                {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map(tier => (
                                    <button
                                        key={tier}
                                        type="button"
                                        onClick={() => handleTierToggle(tier)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${(formData.tierRestriction || []).includes(tier)
                                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                                            : 'bg-zinc-900 border-zinc-800 text-gray-500 hover:border-zinc-600'
                                            }`}
                                    >
                                        {tier}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1">If none selected, available for all.</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Delivery Impact</h3>
                        <div className="space-y-2">
                            <Input
                                label="Additional Days"
                                name="addsDays"
                                type="number"
                                min="0"
                                value={formData.addsDays || ''}
                                onChange={handleChange}
                                placeholder="0"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Will be added to tier's base delivery time.</p>
                        </div>
                    </div>

                    {/* Actions Panel */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 space-y-4">
                        <h3 className="text-sm uppercase font-bold text-gray-500 mb-2">Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold shadow-lg shadow-amber-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                {loading ? 'Saving...' : 'Save Add-On'}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-zinc-800 transition-colors border border-zinc-800 hover:border-zinc-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AddOnForm;
