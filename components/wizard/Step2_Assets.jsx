import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Label, FileUploadZone } from './WizardUI';

const Step2_Assets = ({ formData, handleFileChange, setFormData }) => {
    const [addOnsList, setAddOnsList] = useState([]);
    const [loadingAddOns, setLoadingAddOns] = useState(false);

    // --- Fetch Add-Ons Logic ---
    useEffect(() => {
        const fetchAddOns = async () => {
            if (!formData.services) return;
            setLoadingAddOns(true);
            try {
                const res = await fetch(`/api/add-ons?serviceType=${formData.services}`);
                if (res.ok) {
                    const data = await res.json();
                    setAddOnsList(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error(error);
                setAddOnsList([]);
            } finally {
                setLoadingAddOns(false);
            }
        };
        fetchAddOns();
    }, [formData.services]);

    // --- Add-On Handlers ---
    const handleToggleAddOn = (key) => {
        setFormData(prev => ({
            ...prev,
            addOns: {
                ...prev.addOns,
                [key]: !prev.addOns[key]
            }
        }));
    };

    const handleQuantityChange = (key, quantity) => {
        setFormData(prev => ({
            ...prev,
            addOns: {
                ...prev.addOns,
                [key]: { quantity: Math.max(0, parseInt(quantity) || 0) }
            }
        }));
    };

    const handleMultiSelectToggle = (key, option) => {
        setFormData(prev => ({
            ...prev,
            addOns: {
                ...prev.addOns,
                [key]: {
                    ...prev.addOns[key],
                    [option]: !prev.addOns[key]?.[option]
                }
            }
        }));
    };

    const calculateAddOnsTotal = () => {
        let total = 0;
        addOnsList.forEach(addon => {
            const key = addon.id;
            const value = formData.addOns[key];
            if (addon.isQuantityBased && value?.quantity) {
                total += (addon.pricePerUnit || 0) * value.quantity;
            } else if (addon.isMultiSelect && value) {
                const selectedCount = Object.values(value).filter(Boolean).length;
                total += (addon.pricePerUnit || 0) * selectedCount;
            } else if (value === true && (addon.price !== null && addon.price !== undefined)) {
                total += addon.price;
            }
        });
        return total;
    };

    const isAddonDisabled = (addon) => {
        return addon.tierRestriction && !addon.tierRestriction.includes(formData.tier);
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-12">

            {/* SECTION 1: Assets Upload */}
            <section>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Assets & Extra Needs</h2>
                    <p className="text-gray-500">Upload your files and select any additional services.</p>
                </div>

                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="bg-zinc-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                        File Uploads
                    </h3>

                    <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-800/50 mb-8 flex items-start space-x-3">
                        <Info className="text-cyan-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-cyan-200">
                            <strong className="text-cyan-400">Important:</strong> Please ensure stems are exported from the same starting point (0:00). Accepted formats: WAV 24bit/44.1kHz using ZIP for multiple files.
                        </p>
                    </div>

                    <FileUploadZone
                        label="Reference Demo (Mp3/Wav)"
                        fileName={formData.demoFile?.name}
                        onFileSelect={(f) => handleFileChange('demoFile', f)}
                        required={false}
                    />

                    <FileUploadZone
                        label="Multitrack Session / Stems (Zip)"
                        fileName={formData.stemsFile?.name}
                        onFileSelect={(f) => handleFileChange('stemsFile', f)}
                        required={true}
                        acceptedFileTypes=".zip,.rar,.7z"
                    />
                </div>
            </section>

            {/* SECTION 2: Add-Ons */}
            <section>
                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="bg-zinc-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        Premium Add-ons
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {loadingAddOns ? (
                            <div className="text-center col-span-2 py-10 text-gray-500">Loading available add-ons...</div>
                        ) : addOnsList.length === 0 ? (
                            <div className="text-center col-span-2 py-10 text-gray-500">No add-ons available for this service.</div>
                        ) : (
                            addOnsList.map(addon => {
                                const key = addon.id;
                                const isDisabled = isAddonDisabled(addon);
                                const isSelected = addon.isQuantityBased
                                    ? formData.addOns[key]?.quantity > 0
                                    : addon.isMultiSelect
                                        ? Object.values(formData.addOns[key] || {}).some(Boolean)
                                        : formData.addOns[key];

                                return (
                                    <div
                                        key={key}
                                        className={`p-5 rounded-xl border transition-all duration-200 ${isDisabled
                                            ? 'border-zinc-800 bg-zinc-900/20 opacity-50 cursor-not-allowed'
                                            : isSelected
                                                ? 'border-amber-500 bg-amber-900/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                                : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3 flex-1">
                                                {/* Icon rendering relies on backend sending valid identifier or we use generic */}
                                                <span className="text-2xl text-gray-300">✦</span>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-white text-sm">{addon.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">{addon.description}</p>
                                                </div>
                                            </div>
                                            {addon.badge && (
                                                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded-full">
                                                    {addon.badge}
                                                </span>
                                            )}
                                        </div>

                                        {isDisabled && (
                                            <div className="text-xs text-red-400 mb-2">
                                                Only available for {addon.tierRestriction.join(' & ')} tiers
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-amber-500 font-bold text-lg">
                                                {addon.price !== undefined && addon.price !== null ? `$${addon.price}` : `$${addon.pricePerUnit} each`}
                                            </div>

                                            {addon.isQuantityBased ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={formData.addOns[key]?.quantity || 0}
                                                    onChange={(e) => handleQuantityChange(key, e.target.value)}
                                                    disabled={isDisabled}
                                                    className="w-20 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-center disabled:opacity-50 focus:ring-1 focus:ring-amber-500 outline-none"
                                                />
                                            ) : addon.isMultiSelect ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {addon.options.map(option => (
                                                        <button
                                                            key={option}
                                                            onClick={() => !isDisabled && handleMultiSelectToggle(key, option)}
                                                            disabled={isDisabled}
                                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${formData.addOns[key]?.[option]
                                                                ? 'bg-amber-500 text-black'
                                                                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                                                                } disabled:opacity-50`}
                                                        >
                                                            {option}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => !isDisabled && handleToggleAddOn(key)}
                                                    disabled={isDisabled}
                                                    className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${formData.addOns[key]
                                                        ? 'bg-amber-500 text-black'
                                                        : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                                        } disabled:opacity-50`}
                                                >
                                                    {formData.addOns[key] ? 'Added' : 'Add'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            }))}
                    </div>

                    {calculateAddOnsTotal() > 0 && (
                        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 font-semibold">Selected Extras Total:</span>
                                <span className="text-amber-500 font-bold text-2xl">${calculateAddOnsTotal()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
};

export default Step2_Assets;
