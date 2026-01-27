import React, { useState, useEffect } from 'react';
import { ShieldCheck, Receipt, PenTool, CheckCircle2, AlertCircle } from 'lucide-react';
import { TIER_ICONS, TIER_STYLES, SERVICE_CHECKLISTS } from './constants';
import { Medal } from 'lucide-react';
import useGenres from '@/hooks/useGenres';

const Step3_Review = ({ formData, handleChange, setFormData }) => {
    const { getGenreById } = useGenres();
    const [tierPrice, setTierPrice] = useState(0);

    // --- Helpers ---
    const TierIcon = TIER_ICONS[formData.tier] || Medal;
    const tierStyles = TIER_STYLES[formData.tier] || TIER_STYLES.BRONZE;

    // --- Checklist Logic ---
    const currentServiceChecklist = SERVICE_CHECKLISTS[formData.services] || [];

    // Initialize checklist in formData if missing
    useEffect(() => {
        if (!formData.checklist) {
            setFormData(prev => ({ ...prev, checklist: [] }));
        }
    }, []);

    const handleChecklistToggle = (index) => {
        setFormData(prev => {
            const currentList = prev.checklist || [];
            const newList = currentList.includes(index)
                ? currentList.filter(i => i !== index)
                : [...currentList, index];
            return { ...prev, checklist: newList };
        });
    };

    // --- Price Calculation Logic ---
    useEffect(() => {
        const fetchTierPrice = async () => {
            if (!formData.tier || !formData.services) return;
            try {
                const response = await fetch(`/api/tiers?name=${formData.tier}`);
                if (response.ok) {
                    const data = await response.json();
                    const items = Array.isArray(data) ? data : (data.tiers || data.items || []);
                    if (items.length > 0) {
                        const tier = items.find(t => t.name === formData.tier);
                        if (tier) {
                            const serviceKey = formData.services.toLowerCase(); // 'mixing', 'mastering'
                            const price = tier.prices?.[serviceKey] ?? tier.price ?? 0;
                            setTierPrice(price);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching tier price:', error);
            }
        };
        fetchTierPrice();
    }, [formData.tier, formData.services]);


    const calculateAddOnsTotal = () => {
        let total = 0;
        return total;
    };

    const [addOnsDetails, setAddOnsDetails] = useState([]);

    useEffect(() => {
        const fetchAddOns = async () => {
            if (!formData.services) return;
            try {
                const res = await fetch(`/api/add-ons?serviceType=${formData.services}`);
                if (res.ok) {
                    const data = await res.json();
                    setAddOnsDetails(Array.isArray(data) ? data : []);
                }
            } catch (e) { console.error(e); }
        };
        fetchAddOns();
    }, [formData.services]);

    const calculateTotal = () => {
        let addOnTotal = 0;
        addOnsDetails.forEach(addon => {
            const key = addon.id;
            const value = formData.addOns[key];
            if (addon.isQuantityBased && value?.quantity) {
                addOnTotal += (addon.pricePerUnit || 0) * value.quantity;
            } else if (addon.isMultiSelect && value) {
                const count = Object.values(value).filter(Boolean).length;
                addOnTotal += (addon.pricePerUnit || 0) * count;
            } else if (value === true && (addon.price !== null)) {
                addOnTotal += addon.price;
            }
        });
        return tierPrice + addOnTotal;
    };

    const getAddOnTotal = () => calculateTotal() - tierPrice;


    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Review & Launch</h2>
                <p className="text-gray-500">Confirm details and submit your request.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Project Summary */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Project Info Card */}
                    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2">Project Details</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Project Name</label>
                                    <p className="text-white font-medium">{formData.projectName}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Artist Name</label>
                                    <p className="text-white font-medium">{formData.artistName}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Service</label>
                                    <p className="text-white font-medium">{formData.services === 'MIXING' ? `Mixing (${formData.mixingType?.replace('_', ' ')})` : 'Mastering'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Release Type</label>
                                    <p className="text-white font-medium">{formData.projectType}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Selected Tier</label>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${tierStyles.badgeBg} ${tierStyles.color} ${tierStyles.borderColor}`}>
                                        {formData.tier}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Specific Acceptance Checklist */}
                    {currentServiceChecklist.length > 0 && (
                        <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                                <AlertCircle size={18} className="text-cyan-400" />
                                {formData.services === 'MIXING' ? 'Mixing Requirements' : 'Mastering Requirements'}
                            </h3>
                            <div className="space-y-3">
                                {currentServiceChecklist.map((item, idx) => (
                                    <label key={idx} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <div className="relative flex items-center mt-0.5">
                                            <input
                                                type="checkbox"
                                                checked={formData.checklist?.includes(idx) || false}
                                                onChange={() => handleChecklistToggle(idx)}
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-600 bg-zinc-900 transition-all checked:border-cyan-500 checked:bg-cyan-500 hover:border-zinc-500"
                                            />
                                            <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100" size={14} />
                                        </div>
                                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                            {item}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* Legal / Signature Section */}
                    <div className="bg-zinc-900/40 rounded-2xl border border-zinc-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                            <PenTool size={18} className="text-cyan-400" />
                            Final Acceptance
                        </h3>

                        <div className="space-y-4">
                            <div className="bg-amber-900/10 border border-amber-500/20 p-4 rounded-xl">
                                <p className="text-sm text-amber-200">
                                    By signing below, you confirm that you own the rights to the uploaded material and agree to our Terms of Service.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
                                    Legal Name (Signature) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="legalName"
                                    value={formData.legalName || ''}
                                    onChange={handleChange}
                                    placeholder="Type your full legal name"
                                    className="w-full px-4 py-3 rounded-lg bg-black/50 border border-zinc-700 text-white placeholder-zinc-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        name="termsAccepted"
                                        checked={formData.termsAccepted || false}
                                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-600 bg-zinc-900 transition-all checked:border-cyan-500 checked:bg-cyan-500 hover:border-zinc-500"
                                    />
                                    <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100" size={14} />
                                </div>
                                <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors pt-0.5">
                                    I verify that all information is correct and I am ready to proceed.
                                </span>
                            </label>
                        </div>
                    </div>

                </div>

                {/* RIGHT: Cost Breakdown */}
                <div className="lg:col-span-1">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Receipt className="text-amber-500" />
                            <h3 className="font-bold text-xl text-white">Order Summary</h3>
                        </div>

                        <div className="space-y-3 mb-6 border-b border-zinc-800 pb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Base Service ({formData.tier})</span>
                                <span className="text-white font-medium">${tierPrice}</span>
                            </div>

                            {/* Add-ons Breakdown */}
                            {getAddOnTotal() > 0 && (
                                <div className="space-y-2 pt-2 border-t border-zinc-800/50">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Extras</span>
                                    {addOnsDetails.map(addon => {
                                        const key = addon.id;
                                        const value = formData.addOns[key];
                                        if (!value) return null;

                                        let itemPrice = 0;
                                        let itemLabel = addon.name;

                                        if (addon.isQuantityBased && value.quantity > 0) {
                                            itemPrice = addon.pricePerUnit * value.quantity;
                                            itemLabel += ` (x${value.quantity})`;
                                        } else if (addon.isMultiSelect) {
                                            const count = Object.values(value).filter(Boolean).length;
                                            if (count === 0) return null;
                                            itemPrice = addon.pricePerUnit * count;
                                            itemLabel += ` (${count} items)`;
                                        } else if (value === true && addon.price) {
                                            itemPrice = addon.price;
                                        }

                                        if (itemPrice === 0) return null;

                                        return (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-gray-400 truncate max-w-[180px]">{itemLabel}</span>
                                                <span className="text-white font-medium">${itemPrice}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-400 font-medium">Total Estimated</span>
                            <span className="text-3xl font-bold text-amber-500">${calculateTotal()}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-right">Taxes may apply at next step</p>

                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-cyan-400 bg-cyan-900/20 py-2 rounded-lg border border-cyan-800/30">
                            <ShieldCheck size={14} />
                            <span>Generic Payment Protection</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step3_Review;
