'use client';
import React, { useState } from 'react';
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

// --- Tier Configuration ---
const TIER_CONFIG = {
  BRONZE: {
    name: 'Bronze',
    icon: Medal,
    color: 'text-orange-600',
    bgColor: 'bg-gradient-to-br from-orange-900/40 to-orange-800/20',
    borderColor: 'border-orange-600/50',
    badgeBg: 'bg-orange-600/20',
    badgeText: 'text-orange-400',
    badgeBorder: 'border-orange-600/30',
    glowColor: 'shadow-orange-600/20',
  },
  SILVER: {
    name: 'Silver',
    icon: Award,
    color: 'text-gray-300',
    bgColor: 'bg-gradient-to-br from-gray-700/40 to-gray-600/20',
    borderColor: 'border-gray-400/50',
    badgeBg: 'bg-gray-400/20',
    badgeText: 'text-gray-300',
    badgeBorder: 'border-gray-400/30',
    glowColor: 'shadow-gray-400/20',
  },
  GOLD: {
    name: 'Gold',
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-gradient-to-br from-yellow-600/40 to-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    badgeBg: 'bg-yellow-500/20',
    badgeText: 'text-yellow-400',
    badgeBorder: 'border-yellow-500/30',
    glowColor: 'shadow-yellow-500/20',
  },
  PLATINUM: {
    name: 'Platinum',
    icon: Crown,
    color: 'text-cyan-300',
    bgColor: 'bg-gradient-to-br from-cyan-600/40 to-purple-600/20',
    borderColor: 'border-cyan-400/50',
    badgeBg: 'bg-cyan-400/20',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/30',
    glowColor: 'shadow-cyan-400/20',
  },
};

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

const Step1_ProjectInfo = ({ formData, handleChange, setFormData }) => (
  <div className="animate-in fade-in slide-in-from-right-8 duration-500">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-white mb-2">Start Your Project</h2>
      <p className="text-gray-500">Define the core details of your request.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        label="Project / Song Name"
        name="projectName"
        value={formData.projectName}
        onChange={handleChange}
        placeholder="Ex: My New Hit"
        required
      />
      <Input
        label="Artist / Stage Name"
        name="artistName"
        value={formData.artistName}
        onChange={handleChange}
        placeholder="Ex: The Weeknd"
        required
      />
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
        onChange={(e) => setFormData({ ...formData, genreIds: e.target.value })}
        isMulti={true}
      />
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
    </div>
  </div>
);

const Step2_Services = ({ formData, setFormData }) => (
  <div className="animate-in fade-in slide-in-from-right-8 duration-500">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-white mb-2">Select Service</h2>
      <p className="text-gray-500">Choose the main service you need for this project.</p>
    </div>

    <div className="grid grid-cols-1 gap-4 mb-8">
      {[
        { id: 'MIXING', icon: Sliders, title: 'Professional Mixing', desc: 'Balance, clarity, and depth for your tracks.' },
        { id: 'MASTERING', icon: Disc, title: 'Mastering', desc: 'The final polish for industry-standard loudness.' },
        { id: 'RECORDING', icon: Mic2, title: 'Recording / Production', desc: 'Technical or creative assistance.' }
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

    <div className="pt-8 border-t border-zinc-800">
      <Label required>Creator Tier</Label>
      <p className="text-xs text-gray-500 mb-4">Choose the tier level for your project.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(TIER_CONFIG).map(([tierKey, tierConfig]) => {
          const TierIcon = tierConfig.icon;
          const isSelected = formData.tier === tierKey;

          return (
            <div
              key={tierKey}
              onClick={() => setFormData({ ...formData, tier: tierKey })}
              className={`cursor-pointer group border-2 rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg ${isSelected
                ? `${tierConfig.borderColor} ${tierConfig.bgColor} shadow-lg ${tierConfig.glowColor}`
                : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900'
                }`}
            >
              <div className={`p-3 rounded-full mb-4 transition-colors ${isSelected ? `${tierConfig.badgeBg} ${tierConfig.color}` : 'bg-zinc-800 text-gray-400 group-hover:text-white'
                }`}>
                <TierIcon size={24} />
              </div>
              <h3 className={`font-bold text-lg mb-2 ${isSelected ? tierConfig.color : 'text-gray-300 group-hover:text-white'}`}>
                {tierConfig.name}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                {tierKey === 'BRONZE' && 'Entry level creators'}
                {tierKey === 'SILVER' && 'Experienced creators'}
                {tierKey === 'GOLD' && 'Premium quality'}
                {tierKey === 'PLATINUM' && 'Industry leaders'}
              </p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isSelected
                ? `${tierConfig.badgeBg} ${tierConfig.badgeText} ${tierConfig.badgeBorder}`
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                }`}>
                {tierKey === 'BRONZE' && 'Budget Friendly'}
                {tierKey === 'SILVER' && 'Recommended'}
                {tierKey === 'GOLD' && 'Pro Level'}
                {tierKey === 'PLATINUM' && 'Elite'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

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

const Step4_Review = ({ formData }) => (
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
          {(() => {
            const tierConfig = TIER_CONFIG[formData.tier];
            const TierIcon = tierConfig.icon;
            return (
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${tierConfig.badgeBg} ${tierConfig.badgeText} ${tierConfig.badgeBorder}`}>
                <TierIcon size={14} />
                {tierConfig.name.toUpperCase()} TIER
              </span>
            );
          })()}
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
                Genre #{genreId}
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

    <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-lg text-sm mt-6">
      <div className="mt-0.5"><CheckCircle2 size={16} className="text-amber-500" /></div>
      <p>By submitting this request, you agree to our terms of service. A creator will review your files and confirm the order within 24 hours.</p>
    </div>
  </div>
);

// --- Main Wizard Component ---

export default function ServiceRequestWizard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { createServiceRequest } = useServiceRequests();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    projectName: '',
    artistName: '',
    projectType: 'SINGLE', // SINGLE, EP, ALBUM
    services: 'MIXING', // MIXING, MASTERING, RECORDING (single selection)
    tier: 'BRONZE', // BRONZE, SILVER, GOLD, PLATINUM
    description: '',
    genreIds: [], // Array of genre IDs
    demoFile: null,
    stemsFile: null,
    // creatorId will be assigned automatically by backend based on tier/service/availability
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    // Validate user is authenticated
    if (!session?.user?.id) {
      alert('Please log in to submit a service request');
      router.push('/login');
      return;
    }

    // Validate required fields
    if (!formData.projectName || !formData.artistName || formData.genreIds.length === 0) {
      alert('Please fill in all required fields');
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
        tier: formData.tier,
        description: formData.description || null,
        genreIds: formData.genreIds,
        // creatorId will be assigned by backend
        // files will be uploaded separately and linked
      };

      console.log('Service Request Payload:', payload);
      console.log('Files to upload:', {
        demo: formData.demoFile?.name,
        stems: formData.stemsFile?.name
      });

      // Create service request using the hook
      await createServiceRequest(payload);

      // TODO: Upload files if present
      // if (formData.demoFile || formData.stemsFile) {
      //   await uploadFiles(serviceRequestId, formData.demoFile, formData.stemsFile);
      // }

      // Redirect to requests page after successful creation
      router.push('/artists/home');
    } catch (error) {
      console.error('Error submitting service request:', error);
      // Error notification is already handled by the hook
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12 space-x-2">
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border transition-all duration-300 ${step >= s
              ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-600'
              }`}
          >
            {step > s ? <CheckCircle2 size={14} /> : s}
          </div>
          {s < 4 && (
            <div className={`w-16 h-[2px] rounded-full transition-colors duration-300 ${step > s ? 'bg-amber-500/50' : 'bg-zinc-800'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-4xl bg-black/40 backdrop-blur-xl border border-zinc-800/50 rounded-3xl shadow-2xl overflow-hidden">
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
        <div className="p-8 md:p-12">
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
              <Step4_Review
                formData={formData}
              />
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-8 border-t border-zinc-800 flex justify-between bg-zinc-900/30">
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