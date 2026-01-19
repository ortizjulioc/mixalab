'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Music,
  Mic2,
  Sliders,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Disc,
  Layers,
  FileAudio,
  Info,
  Award,
  Medal,
  Trophy,
  Crown
} from 'lucide-react';
import SelectGenres from '@/components/SelectGenres';
import useServiceRequests from '@/hooks/useServiceRequests';
import useTiers from '@/hooks/useTiers';
import useGenres from '@/hooks/useGenres';
import { openNotification } from '@/utils/open-notification';

// --- Tier Icon Mapping ---
const TIER_ICONS = {
  BRONZE: Medal,
  SILVER: Award,
  GOLD: Trophy,
  PLATINUM: Crown,
};

const TIER_STYLES = {
  BRONZE: {
    color: 'text-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-900/40 to-orange-800/20',
    borderColor: 'border-orange-600/50',
    badgeBg: 'bg-orange-600/20',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-600/30',
    glowColor: 'shadow-orange-600/20',
    badge: 'Budget Friendly'
  },
  SILVER: {
    color: 'text-gray-300',
    bgColor: 'bg-gradient-to-br from-gray-700/40 to-gray-600/20',
    borderColor: 'border-gray-400/50',
    badgeBg: 'bg-gray-400/20',
    badgeText: 'text-gray-300',
    badgeBorder: 'border-gray-400/30',
    glowColor: 'shadow-gray-400/20',
    badge: 'Popular'
  },
  GOLD: {
    color: 'text-yellow-400',
    bgColor: 'bg-gradient-to-br from-yellow-600/40 to-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    badgeBg: 'bg-yellow-500/20',
    badgeText: 'text-yellow-400',
    badgeBorder: 'border-yellow-500/30',
    glowColor: 'shadow-yellow-500/20',
    badge: 'Recommended'
  },
  PLATINUM: {
    color: 'text-cyan-300',
    bgColor: 'bg-gradient-to-br from-cyan-600/40 to-purple-600/20',
    borderColor: 'border-cyan-400/50',
    badgeBg: 'bg-cyan-400/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/30',
    glowColor: 'shadow-cyan-400/20',
    badge: 'Elite'
  },
};

// --- Add-ons Configuration ---
// --- Add-ons Configuration (Now Dynamic) ---
// Removed constants MIXING_ADD_ONS and MASTERING_ADD_ONS



// --- UI Components (Dark & Premium Style) ---

const Label = ({ children, required }) => (
  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
    {children} {required && <span className="text-amber-500">*</span>}
  </label>
);

const Input = ({ label, type = "text", placeholder, value, onChange, name, required }) => (
  <div className="mb-5">
    {label && <Label required={required}>{label}</Label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
    />
  </div>
);

const TextArea = ({ label, placeholder, value, onChange, name, rows = 3, required }) => (
  <div className="mb-5">
    {label && <Label required={required}>{label}</Label>}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none"
    />
  </div>
);

const SelectionCard = ({ icon: Icon, title, description, selected, onClick, badge }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer group border rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/10 ${selected
      ? 'border-amber-500 bg-zinc-900/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
      : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900'
      }`}
  >
    <div className={`p-3 rounded-full mb-4 transition-colors ${selected ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-gray-400 group-hover:text-white'
      }`}>
      <Icon size={24} />
    </div>
    <h3 className={`font-bold text-lg mb-2 ${selected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
      {title}
    </h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    {badge && (
      <span className="mt-3 px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
        {badge}
      </span>
    )}
  </div>
);

const FileUploadZone = ({ label, onFileSelect, fileName, required }) => (
  <div className="mb-8">
    <Label required={required}>{label}</Label>
    <div className="group border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center hover:bg-zinc-900 hover:border-zinc-600 transition-all cursor-pointer relative bg-zinc-900/20">
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={(e) => onFileSelect(e.target.files[0])}
        accept="audio/*,.zip"
      />
      <div className="flex flex-col items-center justify-center space-y-3">
        {fileName ? (
          <>
            <div className="bg-cyan-500/10 p-3 rounded-full">
              <FileAudio className="text-cyan-400 w-8 h-8" />
            </div>
            <span className="text-sm font-medium text-white truncate max-w-xs">{fileName}</span>
            <span className="text-xs text-cyan-500 font-semibold uppercase tracking-wide">File Ready</span>
          </>
        ) : (
          <>
            <div className="bg-zinc-800 p-3 rounded-full group-hover:bg-zinc-700 transition-colors">
              <UploadCloud className="text-gray-400 w-8 h-8 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
              Drag & drop or click to browse
            </span>
            <span className="text-xs text-zinc-600">WAV, MP3, AIFF, ZIP (Max 2GB)</span>
          </>
        )}
      </div>
    </div>
  </div>
);

// --- Step Views ---

const Step1_ProjectInfo = ({ formData, handleChange, setFormData }) => {
  const [touched, setTouched] = React.useState({});

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const showError = (fieldName, value) => {
    return touched[fieldName] && (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim() === ''));
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Start Your Project</h2>
        <p className="text-gray-500">Define the core details of your request.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="mb-5">
          <Label required>Project / Song Name</Label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            onBlur={() => handleBlur('projectName')}
            placeholder="Ex: My New Hit"
            required
            className={`w-full px-4 py-3 rounded-lg bg-zinc-900 border ${showError('projectName', formData.projectName)
              ? 'border-red-500 focus:ring-red-500'
              : 'border-zinc-800 focus:ring-amber-500'
              } text-white placeholder-zinc-600 focus:ring-2 focus:border-transparent transition-all outline-none`}
          />
          {showError('projectName', formData.projectName) && (
            <p className="text-red-400 text-xs mt-1">Project name is required</p>
          )}
        </div>

        <div className="mb-5">
          <Label required>Artist / Stage Name</Label>
          <input
            type="text"
            name="artistName"
            value={formData.artistName}
            onChange={handleChange}
            onBlur={() => handleBlur('artistName')}
            placeholder="Ex: The Weeknd"
            required
            className={`w-full px-4 py-3 rounded-lg bg-zinc-900 border ${showError('artistName', formData.artistName)
              ? 'border-red-500 focus:ring-red-500'
              : 'border-zinc-800 focus:ring-amber-500'
              } text-white placeholder-zinc-600 focus:ring-2 focus:border-transparent transition-all outline-none`}
          />
          {showError('artistName', formData.artistName) && (
            <p className="text-red-400 text-xs mt-1">Artist name is required</p>
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
          rows={4}
        />
        <p className="text-xs text-gray-500 mt-1">Optional - but helps creators understand your vision better</p>
      </div>
    </div>
  );
};

const Step2_Services = ({ formData, setFormData }) => {
  const [allTiers, setAllTiers] = useState([]);
  const [loadingTiers, setLoadingTiers] = useState(false);

  useEffect(() => {
    const loadTiers = async () => {
      setLoadingTiers(true);
      try {
        const response = await fetch(`/api/tiers`);
        const data = await response.json();

        // Handle both array response and object with data property
        const tiersArray = Array.isArray(data) ? data : (data.data || data.tiers || []);
        setAllTiers(tiersArray);

        console.log('Fetched tiers:', tiersArray);
      } catch (error) {
        console.error('Error fetching tiers:', error);
        setAllTiers([]); // Ensure it's always an array
      } finally {
        setLoadingTiers(false);
      }
    };

    loadTiers();
  }, []);

  // Extract service-specific data from tier
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
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Select Service</h2>
        <p className="text-gray-500">Choose the main service you need for this project.</p>
      </div>

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

      {/* Mixing Type Selection - Only for MIXING service */}
      {formData.services === 'MIXING' && (
        <div className="mt-8 pt-8 border-t border-zinc-800">
          <Label required>Mixing Type</Label>
          <p className="text-xs text-gray-500 mb-4">Select the type of mixing service you need.</p>

          <div className="grid grid-cols-1 gap-4">
            {[
              {
                id: 'STUDIO_MIX',
                title: 'Studio Mix',
                desc: 'Standard production mix DAW using virtual instruments',
                icon: Sliders
              },
              {
                id: 'LIVE_MIX',
                title: 'Live Mix',
                desc: 'Acoustic/Band; cleanup required',
                icon: Mic2
              },
              {
                id: 'ESSENTIAL_MIX',
                title: 'Essential Mix',
                desc: 'Instrumental is done, just mix vocals with beat',
                icon: Music
              }
            ].map((mixType) => (
              <div
                key={mixType.id}
                onClick={() => setFormData({ ...formData, mixingType: mixType.id })}
                className={`p-5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group ${formData.mixingType === mixType.id
                  ? 'border-cyan-500 bg-cyan-900/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                  : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900'
                  }`}
              >
                <div className="flex items-center space-x-5">
                  <div className={`p-3 rounded-full ${formData.mixingType === mixType.id ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-gray-400'
                    }`}>
                    <mixType.icon size={20} />
                  </div>
                  <div>
                    <h4 className={`font-bold text-lg ${formData.mixingType === mixType.id ? 'text-white' : 'text-gray-300'
                      }`}>
                      {mixType.title}
                    </h4>
                    <p className="text-sm text-gray-500">{mixType.desc}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${formData.mixingType === mixType.id
                  ? 'bg-cyan-500 border-cyan-500'
                  : 'border-zinc-700 bg-zinc-800'
                  }`}>
                  {formData.mixingType === mixType.id && <CheckCircle2 size={16} className="text-black" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {formData.services && (formData.services !== 'MIXING' || formData.mixingType) && (
        <div className="pt-8 border-t border-zinc-800">
          <Label required>Creator Tier</Label>
          <p className="text-xs text-gray-500 mb-4">Choose the tier level for your project.</p>

          {loadingTiers ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading tiers...</p>
            </div>
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
                        <div className={`p-3 rounded-full transition-colors ${isSelected ? `${styles.badgeBg} ${styles.color}` : 'bg-zinc-800 text-gray-400 group-hover:text-white'
                          }`}>
                          <TierIcon size={24} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-3">
                            <h3 className={`font-bold text-xl ${isSelected ? styles.color : 'text-gray-300 group-hover:text-white'}`}>
                              {tier.name} — ${tier.prices?.[formData.services] ?? tier.price ?? 0}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isSelected
                              ? `${styles.badgeBg} ${styles.badgeText} ${styles.badgeBorder}`
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                              }`}>
                              {styles.badge}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-gray-400 mt-1">{serviceTier.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{serviceTier.subtitle}</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected
                        ? 'bg-amber-500 border-amber-500'
                        : 'border-zinc-700 bg-zinc-800'
                        }`}>
                        {isSelected && <CheckCircle2 size={16} className="text-black" />}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {tier.stems !== null && (
                        <div className="bg-black/20 p-2 rounded-lg border border-white/5 text-center">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-1">Stems</span>
                          <span className="text-gray-200 font-mono text-sm font-bold">{tier.stems}</span>
                        </div>
                      )}
                      <div className={`bg-black/20 p-2 rounded-lg border border-white/5 text-center ${tier.stems === null ? 'col-span-2' : ''}`}>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-1">Delivery</span>
                        <span className="text-gray-200 font-mono text-sm font-bold">{tier.deliveryDays} days</span>
                      </div>
                      <div className={`bg-black/20 p-2 rounded-lg border border-white/5 text-center ${tier.stems === null ? 'col-span-1' : ''}`}>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block mb-1">Revisions</span>
                        <span className="text-gray-200 font-mono text-sm font-bold">{tier.numberOfRevisions}</span>
                      </div>
                    </div>

                    {/* Features List */}
                    {serviceTier.features && serviceTier.features.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-zinc-800/50">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-3">What You Get</h4>
                        {serviceTier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-left">
                            <span className="text-amber-500 text-sm mt-0.5 flex-shrink-0">{feature.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-200">{feature.title}</p>
                              <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

};

const Step3_Uploads = ({ formData, handleFileChange }) => (
  <div className="animate-in fade-in slide-in-from-right-8 duration-500">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-white mb-2">Assets & Files</h2>
      <p className="text-gray-500">Securely upload your project materials.</p>
    </div>

    <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-800/50 mb-8 flex items-start space-x-3">
      <Info className="text-cyan-400 shrink-0 mt-0.5" size={18} />
      <p className="text-sm text-cyan-200">
        <strong className="text-cyan-400">Important:</strong> Please ensure stems are exported from the same starting point (0:00). Accepted formats: WAV 24bit/44.1kHz or higher.
      </p>
    </div>

    <FileUploadZone
      label="Reference Demo (Mp3/Wav)"
      fileName={formData.demoFile?.name}
      onFileSelect={(f) => handleFileChange('demoFile', f)}
    />

    <FileUploadZone
      label="Multitrack Session / Stems (Zip)"
      fileName={formData.stemsFile?.name}
      onFileSelect={(f) => handleFileChange('stemsFile', f)}
    />
  </div>
);

const Step4_AddOns = ({ formData, setFormData }) => {
  const [addOnsList, setAddOnsList] = useState([]);
  const [loadingAddOns, setLoadingAddOns] = useState(false);

  useEffect(() => {
    const fetchAddOns = async () => {
      if (!formData.services) return;
      setLoadingAddOns(true);
      try {
        const res = await fetch(`/api/add-ons?serviceType=${formData.services}`);
        if (res.ok) {
          const data = await res.json();
          setAddOnsList(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAddOns(false);
      }
    };
    fetchAddOns();
  }, [formData.services]);


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
      } else if (value === true && (addon.price !== null && addon.price !== undefined)) { // Boolean check for simple checkbox
        total += addon.price;
      }
    });
    return total;
  };

  const isAddonDisabled = (addon) => {
    return addon.tierRestriction && !addon.tierRestriction.includes(formData.tier);
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Add-On Extras</h2>
        <p className="text-gray-500">Enhance your {formData.services.toLowerCase()} with premium add-ons</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {loadingAddOns ? (
          <div className="text-center col-span-2 py-10 text-gray-500">Loading add-ons...</div>
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
                    <span className="text-2xl">{addon.icon}</span>
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

                <div className="flex items-center justify-between">
                  <div className="text-amber-500 font-bold text-lg">
                    {addon.price !== undefined && addon.price !== null ? `$${addon.price}` : `$${addon.pricePerUnit} each`}
                    {addon.addsDays && <span className="text-xs text-gray-500 ml-2">+{addon.addsDays}d</span>}
                  </div>

                  {addon.isQuantityBased ? (
                    <input
                      type="number"
                      min="0"
                      value={formData.addOns[key]?.quantity || 0}
                      onChange={(e) => handleQuantityChange(key, e.target.value)}
                      disabled={isDisabled}
                      className="w-20 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-center disabled:opacity-50"
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
                      className={`px-6 py-2 rounded-lg font-bold transition-all ${formData.addOns[key]
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

      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-semibold">Add-ons Total:</span>
          <span className="text-amber-500 font-bold text-2xl">${calculateAddOnsTotal()}</span>
        </div>
      </div>
    </div>
  );
};

const Step5_Review = ({ formData }) => {
  const TierIcon = TIER_ICONS[formData.tier] || Medal;
  const tierStyles = TIER_STYLES[formData.tier] || TIER_STYLES.BRONZE;
  const { getGenreById } = useGenres();
  const [genreNames, setGenreNames] = useState({});
  const [allAddOns, setAllAddOns] = useState([]);
  const [tierPrice, setTierPrice] = useState(0);

  // Fetch tier price based on service type
  useEffect(() => {
    const fetchTierPrice = async () => {
      if (!formData.tier || !formData.services) return;

      try {
        const response = await fetch(`/api/tiers?name=${formData.tier}`);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const tier = data.items[0];
            // Get price for the specific service
            const serviceKey = formData.services.toLowerCase(); // 'mixing', 'mastering', 'recording'
            const price = tier.prices?.[serviceKey] || 0;
            console.log(`💰 Tier ${formData.tier} price for ${formData.services}:`, price);
            setTierPrice(price);
          }
        }
      } catch (error) {
        console.error('Error fetching tier price:', error);
      }
    };

    fetchTierPrice();
  }, [formData.tier, formData.services]);

  // Fetch add-ons if they exist in formData
  useEffect(() => {
    const fetchAddOns = async () => {
      console.log('🔍 Step5_Review - formData.addOns:', formData.addOns);
      console.log('🔍 Step5_Review - formData.services:', formData.services);

      if (!formData.services) {
        console.log('❌ No service selected');
        return;
      }

      try {
        const response = await fetch(`/api/add-ons?serviceType=${formData.services}`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Fetched add-ons from API:', data);
          setAllAddOns(data || []); // API returns array directly, not { addOns: [...] }
        } else {
          console.log('❌ Failed to fetch add-ons:', response.status);
        }
      } catch (error) {
        console.error('❌ Error fetching add-ons:', error);
      }
    };

    fetchAddOns();
  }, [formData.services]); // Only depend on services, not addOns (to avoid infinite loop)

  useEffect(() => {
    const loadGenres = async () => {
      const names = {};
      if (formData.genreIds && formData.genreIds.length > 0) {
        // Create promises for parallel fetching
        const promises = formData.genreIds.map(async (id) => {
          try {
            const genre = await getGenreById(id);
            return { id, name: genre ? genre.name : 'Unknown Genre' };
          } catch (e) {
            return { id, name: 'Unknown Genre' };
          }
        });

        const results = await Promise.all(promises);
        results.forEach(item => {
          names[item.id] = item.name;
        });

        setGenreNames(names);
      }
    };

    loadGenres();
  }, [formData.genreIds, getGenreById]);

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Review Request</h2>
        <p className="text-gray-500">Double check details before submission.</p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-8 space-y-6 border border-zinc-800 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between md:items-center pb-6 border-b border-zinc-800">
          <div>
            <h3 className="font-bold text-2xl text-white">{formData.projectName || "Untitled Project"}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-gray-400 text-sm font-medium">{formData.artistName || "Unknown Artist"}</span>
              <span className="text-zinc-600 text-xs">•</span>
              <span className="text-amber-500 text-sm font-bold uppercase tracking-wide">{formData.projectType}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${tierStyles.badgeBg} ${tierStyles.badgeText} ${tierStyles.badgeBorder}`}>
              <TierIcon size={14} />
              {formData.tier} TIER
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">Service Requested</h4>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-gray-300">
              {formData.services || 'Not selected'}
            </span>
          </div>
        </div>

        {formData.genreIds && formData.genreIds.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {formData.genreIds.map((genreId, index) => (
                <span key={index} className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-xs text-gray-300">
                  {genreNames[genreId] || 'Loading...'}
                </span>
              ))}
            </div>
          </div>
        )}

        {formData.description && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">Description</h4>
            <p className="text-sm text-white bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              {formData.description}
            </p>
          </div>
        )}

        <div>
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">Files</h4>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <FileAudio size={14} className={`mr-2 ${formData.demoFile ? 'text-amber-500' : 'text-zinc-700'}`} />
              {formData.demoFile ? <span className="text-white">{formData.demoFile.name}</span> : <span className="text-zinc-600 italic">No demo</span>}
            </div>
            <div className="flex items-center text-sm">
              <UploadCloud size={14} className={`mr-2 ${formData.stemsFile ? 'text-cyan-500' : 'text-zinc-700'}`} />
              {formData.stemsFile ? <span className="text-white">{formData.stemsFile.name}</span> : <span className="text-zinc-600 italic">No stems</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>

        <h4 className="text-lg font-bold text-white mb-6">Price Summary</h4>

        <div className="space-y-4">
          {/* Base Tier Price */}
          <div className="flex justify-between items-center text-gray-300">
            <span className="text-sm">{formData.tier} Tier Service</span>
            <span className="font-semibold">${tierPrice}</span>
          </div>

          {/* Add-ons */}
          {formData.addOns && Object.keys(formData.addOns).length > 0 && (
            <>
              <div className="pt-3 border-t border-zinc-800">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Add-ons</p>
              </div>
              {Object.entries(formData.addOns).map(([addOnId, config]) => {
                console.log('🔍 Mapping add-on:', { addOnId, config, allAddOnsLength: allAddOns?.length });
                // Find add-on details from allAddOns state
                const addOn = allAddOns?.find(a => a.id === addOnId);
                console.log('🔍 Found add-on:', addOn);
                if (!addOn) {
                  console.log('❌ Add-on not found for ID:', addOnId);
                  return null;
                }

                const quantity = config.quantity || 1;
                // Use price or pricePerUnit depending on the add-on type
                const unitPrice = addOn.price || addOn.pricePerUnit || 0;
                const total = unitPrice * quantity;

                return (
                  <div key={addOnId} className="flex justify-between items-center text-gray-300 text-sm">
                    <span className="flex items-center gap-2">
                      {addOn.name}
                      {quantity > 1 && (
                        <span className="text-xs text-gray-500">×{quantity}</span>
                      )}
                    </span>
                    <span className="font-semibold">${total}</span>
                  </div>
                );
              })}
            </>
          )}

          {/* Subtotal */}
          <div className="pt-4 border-t-2 border-zinc-800">
            <div className="flex justify-between items-center text-gray-200">
              <span className="font-semibold">Subtotal</span>
              <span className="font-bold text-lg">${tierPrice + (() => {

                let addOnsTotal = 0;
                if (formData.addOns && allAddOns) {
                  Object.entries(formData.addOns).forEach(([addOnId, config]) => {
                    const addOn = allAddOns.find(a => a.id === addOnId);
                    if (addOn) {
                      const quantity = config.quantity || 1;
                      addOnsTotal += ((addOn.price || addOn.pricePerUnit || 0) * quantity);
                    }
                  });
                }

                return addOnsTotal;
              })()}</span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t-2 border-amber-500/30">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-white">Total</span>
              <span className="text-2xl font-bold text-amber-400">${tierPrice + (() => {

                let addOnsTotal = 0;
                if (formData.addOns && allAddOns) {
                  Object.entries(formData.addOns).forEach(([addOnId, config]) => {
                    const addOn = allAddOns.find(a => a.id === addOnId);
                    if (addOn) {
                      const quantity = config.quantity || 1;
                      addOnsTotal += ((addOn.price || addOn.pricePerUnit || 0) * quantity);
                    }
                  });
                }

                return addOnsTotal;
              })()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-lg text-sm mt-6">
        <div className="mt-0.5"><CheckCircle2 size={16} className="text-amber-500" /></div>
        <p>By submitting this request, you agree to our terms of service. A creator will review your files and confirm the order within 24 hours.</p>
      </div>
    </div>
  );
};

const Step6_FinalAcceptance = ({ formData, setFormData }) => {
  const [conditions, setConditions] = useState([]);
  const [loadingConditions, setLoadingConditions] = useState(false);

  useEffect(() => {
    const fetchConditions = async () => {
      if (!formData.services) return;
      setLoadingConditions(true);
      try {
        const res = await fetch(`/api/acceptance-conditions?serviceType=${formData.services}`);
        if (res.ok) {
          const data = await res.json();
          setConditions(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingConditions(false);
      }
    };
    fetchConditions();
  }, [formData.services]);

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      acceptance: {
        ...prev.acceptance,
        [field]: !prev.acceptance[field]
      }
    }));
  };

  const handleAcceptAll = () => {
    const allAcceptance = {};
    conditions.forEach(condition => {
      allAcceptance[condition.fieldName] = true;
    });
    setFormData(prev => ({
      ...prev,
      acceptance: {
        ...prev.acceptance,
        ...allAcceptance
      }
    }));
  };

  const handleLegalNameChange = (e) => {
    setFormData(prev => ({
      ...prev,
      acceptance: {
        ...prev.acceptance,
        legalName: e.target.value
      }
    }));
  };

  // Check if all required conditions are checked
  const requiredConditions = conditions.filter(c => c.required);
  const allChecked = requiredConditions.every(c => formData.acceptance[c.fieldName] === true);

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Final Acceptance</h2>
        <p className="text-gray-500">Please review and accept the terms before submitting</p>
      </div>

      <div className="bg-zinc-900 rounded-xl p-8 border border-zinc-800 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Required Confirmations</h3>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              Accept All
            </button>
          </div>

          {loadingConditions ? (
            <div className="text-center py-10 text-gray-500">Loading conditions...</div>
          ) : (
            <div className="space-y-4">
              {conditions.map((condition) => (
                <label key={condition.id} className="flex items-start space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.acceptance[condition.fieldName] || false}
                    onChange={() => handleCheckboxChange(condition.fieldName)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-2 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <span className={`text-sm group-hover:text-white transition-colors ${condition.required ? 'text-gray-300' : 'text-gray-400'}`}>
                      {condition.label} {!condition.required && <span className="text-xs text-gray-600">(optional)</span>}
                    </span>
                    {condition.description && (
                      <p className="text-xs text-gray-600 mt-1">{condition.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-zinc-800">
          <Label required>Legal Name (Signature)</Label>
          <input
            type="text"
            value={formData.acceptance.legalName}
            onChange={handleLegalNameChange}
            placeholder="Type your full legal name"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
          />
          <p className="text-xs text-gray-500 mt-2">
            By checking the boxes above and typing my legal name, I attest that I am the rights holder for this composition and agree to the terms listed.
          </p>
        </div>

        {(!allChecked || !formData.acceptance.legalName) && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 flex items-start space-x-3">
            <Info className="text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-200">
              Please check all required boxes and provide your legal name to proceed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Wizard Component ---

export default function ServiceRequestWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { createServiceRequest } = useServiceRequests();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    projectName: '',
    artistName: '',
    projectType: 'SINGLE', // SINGLE, EP, ALBUM
    services: 'MIXING', // MIXING, MASTERING, RECORDING (single selection)
    mixingType: '', // STUDIO_MIX, LIVE_MIX, ESSENTIAL_MIX (only for MIXING service)
    tier: 'BRONZE', // BRONZE, SILVER, GOLD, PLATINUM
    description: '',
    genreIds: [], // Array of genre IDs
    demoFile: null,
    stemsFile: null,
    addOns: {}, // Populated dynamically based on service type
    acceptance: {
      // Common fields
      legalName: '',
      // MIXING fields
      stemsReady: false,
      understandStemLimit: false,
      stemsConsolidated: false,
      marketingConsent: false,
      understandQuality: false,
      declineFixes: false,
      // MASTERING fields
      mixReady: false,
      agreeRoyaltySplit: false,
      understandMixQuality: false,
      declineImprovements: false,
      // Shared
      agreeSchedule: false
    }
  });

  // Initialize add-ons based on service type
  // Reset add-ons when service type changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, addOns: {} }));
  }, [formData.services]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    // Validate user is authenticated
    if (!session?.user?.id) {
      openNotification('error', 'Please log in to submit a service request');
      router.push('/login');
      return;
    }

    // Detailed validation with specific error messages
    const missingFields = [];

    // Step 1 validation
    if (!formData.projectName || formData.projectName.trim() === '') {
      missingFields.push('Project/Song Name (Step 1)');
    }
    if (!formData.artistName || formData.artistName.trim() === '') {
      missingFields.push('Artist/Stage Name (Step 1)');
    }
    if (!formData.projectType) {
      missingFields.push('Project Type (Step 1)');
    }
    if (!formData.genreIds || formData.genreIds.length === 0) {
      missingFields.push('Genres (Step 1)');
    }

    // Step 2 validation
    if (!formData.services) {
      missingFields.push('Service Type (Step 2)');
    }
    if (formData.services === 'MIXING' && !formData.mixingType) {
      missingFields.push('Mixing Type (Step 2)');
    }
    if (!formData.tier) {
      missingFields.push('Creator Tier (Step 2)');
    }

    // Show specific missing fields
    if (missingFields.length > 0) {
      const errorMessage = `Please fill in the following required fields:\n• ${missingFields.join('\n• ')}`;
      openNotification('error', errorMessage);

      // Navigate to first step with missing fields
      if (missingFields.some(f => f.includes('Step 1'))) {
        setStep(1);
      } else if (missingFields.some(f => f.includes('Step 2'))) {
        setStep(2);
      }
      return;
    }

    // Validate acceptance (Step 6)
    const isMixing = formData.services === 'MIXING';
    const requiredAcceptanceFields = [];

    if (isMixing) {
      if (!formData.acceptance.stemsReady) requiredAcceptanceFields.push('Stems are ready');
      if (!formData.acceptance.agreeSchedule) requiredAcceptanceFields.push('Agree to schedule');
      if (!formData.acceptance.understandStemLimit) requiredAcceptanceFields.push('Understand stem limit');
      if (!formData.acceptance.stemsConsolidated) requiredAcceptanceFields.push('Stems consolidated');
      if (!formData.acceptance.marketingConsent) requiredAcceptanceFields.push('Marketing consent');
      if (!formData.acceptance.understandQuality) requiredAcceptanceFields.push('Understand quality requirements');
      if (!formData.acceptance.declineFixes) requiredAcceptanceFields.push('Decline fixes acknowledgment');
    } else {
      if (!formData.acceptance.mixReady) requiredAcceptanceFields.push('Mix is ready');
      if (!formData.acceptance.agreeSchedule) requiredAcceptanceFields.push('Agree to schedule');
      if (!formData.acceptance.agreeRoyaltySplit) requiredAcceptanceFields.push('Agree to royalty split');
      if (!formData.acceptance.understandMixQuality) requiredAcceptanceFields.push('Understand mix quality');
      if (!formData.acceptance.declineImprovements) requiredAcceptanceFields.push('Decline improvements acknowledgment');
    }

    if (!formData.acceptance.legalName || formData.acceptance.legalName.trim().length < 3) {
      requiredAcceptanceFields.push('Legal Name (minimum 3 characters)');
    }

    if (requiredAcceptanceFields.length > 0) {
      const errorMessage = `Please complete the following in Step 6 (Final Acceptance):\n• ${requiredAcceptanceFields.join('\n• ')}`;
      openNotification('error', errorMessage);
      setStep(6);
      return;
    }

    try {
      // Prepare payload matching ServiceRequest schema
      const payload = {
        userId: session.user.id,
        projectName: formData.projectName,
        artistName: formData.artistName,
        projectType: formData.projectType,
        services: formData.services,
        mixingType: formData.mixingType || null,
        tier: formData.tier,
        description: formData.description || null,
        genreIds: formData.genreIds,
        addOns: formData.addOns,
        acceptance: formData.acceptance
      };

      // Prepare files object
      const files = {
        demoFile: formData.demoFile,
        stemsFile: formData.stemsFile
      };

      console.log('Service Request Payload:', payload);
      console.log('Files to upload:', {
        demo: formData.demoFile?.name,
        stems: formData.stemsFile?.name
      });

      // Create service request using the hook with files
      const result = await createServiceRequest(payload, files);

      // Redirect to matching page with the service request ID
      if (result?.data?.id) {
        router.push(`/artists/matching/${result.data.id}`);
      } else {
        // Fallback to home if no ID returned
        router.push('/artists/home');
      }
    } catch (error) {
      console.error('Error submitting service request:', error);
      // Error notification is already handled by the hook
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12 space-x-2">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border transition-all duration-300 ${step >= s
              ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-600'
              }`}
          >
            {step > s ? <CheckCircle2 size={14} /> : s}
          </div>
          {s < 6 && (
            <div className={`w-16 h-[2px] rounded-full transition-colors duration-300 ${step > s ? 'bg-amber-500/50' : 'bg-zinc-800'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white">
      <div className="w-full bg-black/40 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl">
        {/* Header */}
        <div className="bg-zinc-900/50 border-b border-zinc-800 p-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">MIXA<span className="text-amber-500">LAB</span></h1>
            </div>
          </div>
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Step 0{step} / 0{totalSteps}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 md:p-12 max-w-7xl mx-auto">
          {renderStepIndicator()}

          <div className="min-h-[450px]">
            {step === 1 && (
              <Step1_ProjectInfo
                formData={formData}
                handleChange={handleChange}
                setFormData={setFormData}
              />
            )}
            {step === 2 && (
              <Step2_Services
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {step === 3 && (
              <Step3_Uploads
                formData={formData}
                handleFileChange={handleFileChange}
              />
            )}
            {step === 4 && (
              <Step4_AddOns
                formData={formData}
                setFormData={setFormData}
              />
            )}
            {step === 5 && (
              <Step5_Review
                formData={formData}
              />
            )}
            {step === 6 && (
              <Step6_FinalAcceptance
                formData={formData}
                setFormData={setFormData}
              />
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-8 border-t border-zinc-800 flex justify-between bg-zinc-900/30 max-w-7xl mx-auto">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${step === 1
              ? 'text-zinc-700 cursor-not-allowed'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
          >
            <ChevronLeft size={20} className="mr-2" />
            Back
          </button>

          {step < totalSteps ? (
            <button
              onClick={nextStep}
              className="flex items-center bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all transform active:scale-95 shadow-lg shadow-white/5"
            >
              Continue
              <ChevronRight size={20} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center bg-amber-500 text-black px-8 py-3 rounded-lg font-bold hover:bg-amber-400 transition-all transform active:scale-95 shadow-lg shadow-amber-500/20"
            >
              Confirm Order
              <CheckCircle2 size={20} className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
