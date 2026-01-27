import React, { useState, useEffect } from 'react';
import { Sliders, Music, Disc, Layers, Mic2, CheckCircle2 } from 'lucide-react';
import SelectGenres from '@/components/SelectGenres';
import { Label, Input, TextArea, SelectionCard } from './WizardUI';
import { TIER_ICONS, TIER_STYLES } from './constants';
import { Medal } from 'lucide-react';

const Step1_Strategy = ({ formData, handleChange, setFormData }) => {
    const [touched, setTouched] = useState({});
    const [allTiers, setAllTiers] = useState([]);
    const [loadingTiers, setLoadingTiers] = useState(false);

    // --- Handlers for Inputs ---
    const handleBlur = (fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    };

    const showError = (fieldName, value) => {
        return touched[fieldName] && (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === ''));
    };

    // --- Fetch Tiers Logic ---
    useEffect(() => {
        const loadTiers = async () => {
            setLoadingTiers(true);
            try {
                const response = await fetch(`/api/tiers`);
                const data = await response.json();
                const tiersArray = Array.isArray(data) ? data : (data.data || data.tiers || []);
                setAllTiers(tiersArray);
            } catch (error) {
                console.error('Error fetching tiers:', error);
                setAllTiers([]);
            } finally {
                setLoadingTiers(false);
            }
        };
        loadTiers();
    }, []);

    const getTierForService = (tier, serviceType) => {
        const serviceDesc = tier.serviceDescriptions?.[serviceType];
        if (!serviceDesc) return null;
        return {
            ...tier,
            title: serviceDesc.title,
            subtitle: serviceDesc.subtitle,
            description: serviceDesc.description,
            features: serviceDesc.features || [],
        };
    };

    return (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-12">

            {/* SECTION 1: Project Details */}
            <section>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Project Strategy</h2>
                    <p className="text-gray-500">Define the core vision and requirements for your project.</p>
                </div>

                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="bg-zinc-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                        Basic Info
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="mb-0">
                            <Input
                                label="Project / Song Name"
                                name="projectName"
                                value={formData.projectName}
                                onChange={handleChange}
                                required
                                placeholder="Ex: My New Hit"
                            />
                            {showError('projectName', formData.projectName) && (
                                <p className="text-red-400 text-xs mt-[-15px] mb-4">Project name is required</p>
                            )}
                        </div>

                        <div className="mb-0">
                            <Input
                                label="Artist / Stage Name"
                                name="artistName"
                                value={formData.artistName}
                                onChange={handleChange}
                                required
                                placeholder="Ex: The Weeknd"
                            />
                            {showError('artistName', formData.artistName) && (
                                <p className="text-red-400 text-xs mt-[-15px] mb-4">Artist name is required</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <Label required>Project Type</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                            <SelectionCard
                                icon={Disc}
                                title="Single"
                                description="1 Track"
                                selected={formData.projectType === 'SINGLE'}
                                onClick={() => setFormData({ ...formData, projectType: 'SINGLE' })}
                            />
                            <SelectionCard
                                icon={Layers}
                                title="EP"
                                description="2-5 Tracks"
                                selected={formData.projectType === 'EP'}
                                onClick={() => setFormData({ ...formData, projectType: 'EP' })}
                            />
                            <SelectionCard
                                icon={Music}
                                title="Album"
                                description="6+ Tracks"
                                selected={formData.projectType === 'ALBUM'}
                                onClick={() => setFormData({ ...formData, projectType: 'ALBUM' })}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <SelectGenres
                            value={formData.genreIds}
                            label="Genres"
                            name="genreIds"
                            required
                            placeholder="Search and select genres..."
                            onChange={(e) => {
                                setFormData({ ...formData, genreIds: e.target.value });
                                setTouched(prev => ({ ...prev, genreIds: true }));
                            }}
                            isMulti={true}
                        />
                        {touched.genreIds && (!formData.genreIds || formData.genreIds.length === 0) && (
                            <p className="text-red-400 text-xs mt-1">At least one genre is required</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <TextArea
                            label="Project Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Tell us about your project, your vision, and any specific requirements..."
                            rows={3}
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 2: Service Selection */}
            <section>
                <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="bg-zinc-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                        Service Configuration
                    </h3>

                    <div className="grid grid-cols-1 gap-4 mb-8">
                        {[
                            { id: 'MIXING', icon: Sliders, title: 'Professional Mixing', desc: 'Balance, clarity, and depth for your tracks.' },
                            { id: 'MASTERING', icon: Disc, title: 'Mastering', desc: 'The final polish for industry-standard loudness.' }
                        ].map((srv) => (
                            <div
                                key={srv.id}
                                onClick={() => setFormData({ ...formData, services: srv.id })}
                                className={`p-5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group ${formData.services === srv.id
                                    ? 'border-amber-500 bg-zinc-900/80 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                    : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900'
                                    }`}
                            >
                                <div className="flex items-center space-x-5">
                                    <div className={`p-3 rounded-full ${formData.services === srv.id ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-gray-400'}`}>
                                        <srv.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-lg ${formData.services === srv.id ? 'text-white' : 'text-gray-300'}`}>{srv.title}</h4>
                                        <p className="text-sm text-gray-500">{srv.desc}</p>
                                    </div>
                                </div>
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${formData.services === srv.id
                                    ? 'bg-amber-500 border-amber-500'
                                    : 'border-zinc-700 bg-zinc-800'
                                    }`}>
                                    {formData.services === srv.id && <CheckCircle2 size={16} className="text-black" />}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mixing Type */}
                    {formData.services === 'MIXING' && (
                        <div className="mt-8 pt-8 border-t border-zinc-800">
                            <Label required>Mixing Type</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                {[
                                    { id: 'STUDIO_MIX', title: 'Studio Mix', desc: 'Production mix DAW', icon: Sliders },
                                    { id: 'LIVE_MIX', title: 'Live Mix', desc: 'Acoustic/Band', icon: Mic2 },
                                    { id: 'ESSENTIAL_MIX', title: 'Essential', desc: 'Vocals + Beat', icon: Music }
                                ].map((mixType) => (
                                    <div
                                        key={mixType.id}
                                        onClick={() => setFormData({ ...formData, mixingType: mixType.id })}
                                        className={`p-4 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${formData.mixingType === mixType.id
                                            ? 'border-cyan-500 bg-cyan-900/20 shadow-lg'
                                            : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full mb-3 ${formData.mixingType === mixType.id ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-gray-400'}`}>
                                            <mixType.icon size={18} />
                                        </div>
                                        <h4 className={`font-bold text-sm ${formData.mixingType === mixType.id ? 'text-white' : 'text-gray-300'}`}>{mixType.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1">{mixType.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* SECTION 3: Tiers */}
            {formData.services && (formData.services !== 'MIXING' || formData.mixingType) && (
                <section>
                    <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <span className="bg-zinc-800 text-gray-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                            Select Quality Tier
                        </h3>

                        {loadingTiers ? (
                            <div className="text-center py-8"><p className="text-gray-400">Loading tiers...</p></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allTiers.map((tier) => {
                                    const serviceTier = getTierForService(tier, formData.services);
                                    if (!serviceTier) return null;
                                    const TierIcon = TIER_ICONS[tier.name] || Medal;
                                    const styles = TIER_STYLES[tier.name] || TIER_STYLES.BRONZE;
                                    const isSelected = formData.tier === tier.name;

                                    return (
                                        <div
                                            key={tier.id}
                                            onClick={() => setFormData({ ...formData, tier: tier.name })}
                                            className={`cursor-pointer group border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${isSelected
                                                ? `${styles.borderColor} ${styles.bgColor} shadow-lg ${styles.glowColor}`
                                                : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-3 rounded-full transition-colors ${isSelected ? `${styles.badgeBg} ${styles.color}` : 'bg-zinc-800 text-gray-400 group-hover:text-white'}`}>
                                                        <TierIcon size={24} />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className={`font-bold text-xl ${isSelected ? styles.color : 'text-gray-300 group-hover:text-white'}`}>
                                                            {tier.name} — ${tier.prices?.[formData.services] ?? tier.price ?? 0}
                                                        </h3>
                                                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1 ${isSelected
                                                            ? `${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`
                                                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                                            }`}>
                                                            {styles.badge}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected
                                                    ? 'bg-amber-500 border-amber-500'
                                                    : 'border-zinc-700 bg-zinc-800'
                                                    }`}>
                                                    {isSelected && <CheckCircle2 size={16} className="text-black" />}
                                                </div>
                                            </div>

                                            {/* Short Features */}
                                            <div className="space-y-2 mt-4">
                                                {serviceTier.features?.slice(0, 3).map((f, i) => (
                                                    <div key={i} className="flex gap-2 text-xs text-gray-400">
                                                        <span className="text-amber-500">✓</span> {f.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Step1_Strategy;
