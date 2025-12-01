'use client';
import React, { useState } from 'react';
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
  UserCheck,
  Info
} from 'lucide-react';

// --- UI Components (Dark & Premium Style) ---

const Label = ({ children, required }) => (
  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
    {children} {required && <span className="text-amber-500">*</span>}
  </label>
);

const Input = ({ label, type = "text", placeholder, value, onChange, name }) => (
  <div className="mb-5">
    {label && <Label>{label}</Label>}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
    />
  </div>
);

const TextArea = ({ label, placeholder, value, onChange, name, rows = 3 }) => (
  <div className="mb-5">
    {label && <Label>{label}</Label>}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none resize-none"
    />
  </div>
);

const SelectionCard = ({ icon: Icon, title, description, selected, onClick }) => (
  <div 
    onClick={onClick}
    className={`cursor-pointer group border rounded-xl p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:shadow-amber-900/10 ${
      selected 
        ? 'border-amber-500 bg-zinc-900/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
        : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900'
    }`}
  >
    <div className={`p-3 rounded-full mb-4 transition-colors ${
      selected ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-gray-400 group-hover:text-white'
    }`}>
      <Icon size={24} />
    </div>
    <h3 className={`font-bold text-lg mb-2 ${selected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
      {title}
    </h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </div>
);

const FileUploadZone = ({ label, onFileSelect, fileName }) => (
  <div className="mb-8">
    <Label>{label}</Label>
    <div className="group border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center hover:bg-zinc-900 hover:border-zinc-600 transition-all cursor-pointer relative bg-zinc-900/20">
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={(e) => onFileSelect(e.target.files[0])}
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
            <span className="text-xs text-zinc-600">WAV, MP3, AIFF (Max 2GB)</span>
          </>
        )}
      </div>
    </div>
  </div>
);

// --- Main Wizard Component ---

export default function ServiceRequestWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    projectName: '',
    artistName: '',
    projectType: 'single', // single, ep, album
    services: {
      mixing: false,
      mastering: false,
      production: false
    },
    tier: 'verified', // verified, industry
    genre: '',
    bpm: '',
    references: '',
    demoFile: null,
    stemsFile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleService = (service) => {
    setFormData(prev => ({
      ...prev,
      services: { ...prev.services, [service]: !prev.services[service] }
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12 space-x-2">
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div 
            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs border transition-all duration-300 ${
              step >= s 
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

  // --- Step Views (English) ---

  const Step1_ProjectInfo = () => (
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
        />
        <Input 
          label="Artist / Stage Name" 
          name="artistName" 
          value={formData.artistName} 
          onChange={handleChange} 
          placeholder="Ex: The Weekend"
        />
      </div>

      <div className="mt-4">
        <Label>Release Type (Bundles)</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
          <SelectionCard 
            icon={Disc}
            title="Single"
            description="1 Track"
            selected={formData.projectType === 'single'}
            onClick={() => setFormData({...formData, projectType: 'single'})}
          />
          <SelectionCard 
            icon={Layers}
            title="EP Bundle"
            description="2-5 Tracks"
            selected={formData.projectType === 'ep'}
            onClick={() => setFormData({...formData, projectType: 'ep'})}
          />
          <SelectionCard 
            icon={Music}
            title="Album Bundle"
            description="6+ Tracks"
            selected={formData.projectType === 'album'}
            onClick={() => setFormData({...formData, projectType: 'album'})}
          />
        </div>
      </div>
    </div>
  );

  const Step2_Services = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Select Services</h2>
        <p className="text-gray-500">What do you need from our engineers today?</p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        {[
          { id: 'mixing', icon: Sliders, title: 'Professional Mixing', desc: 'Balance, clarity, and depth for your tracks.' },
          { id: 'mastering', icon: Disc, title: 'Mastering', desc: 'The final polish for industry-standard loudness.' },
          { id: 'production', icon: Mic2, title: 'Recording / Production', desc: 'Technical or creative assistance.' }
        ].map((srv) => (
          <div 
            key={srv.id}
            onClick={() => toggleService(srv.id)}
            className={`p-5 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-200 group ${
              formData.services[srv.id] 
                ? 'border-amber-500 bg-zinc-900/80 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-600 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center space-x-5">
              <div className={`p-3 rounded-full ${formData.services[srv.id] ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-gray-400'}`}>
                <srv.icon size={20} />
              </div>
              <div>
                <h4 className={`font-bold text-lg ${formData.services[srv.id] ? 'text-white' : 'text-gray-300'}`}>{srv.title}</h4>
                <p className="text-sm text-gray-500">{srv.desc}</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
              formData.services[srv.id] 
                ? 'bg-amber-500 border-amber-500' 
                : 'border-zinc-700 bg-zinc-800'
            }`}>
              {formData.services[srv.id] && <CheckCircle2 size={16} className="text-black" />}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 border-t border-zinc-800">
        <Label>Engineer Tier</Label>
        <p className="text-xs text-gray-500 mb-4">Choose who works on your sound.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectionCard 
            icon={UserCheck}
            title="Mixa Verified"
            description="Vetted quality, standard turnaround."
            selected={formData.tier === 'verified'}
            onClick={() => setFormData({...formData, tier: 'verified'})}
          />
          <SelectionCard 
            icon={Music}
            title="Industry Pro"
            description="Work with chart-topping producers."
            selected={formData.tier === 'industry'}
            onClick={() => setFormData({...formData, tier: 'industry'})}
          />
        </div>
      </div>
    </div>
  );

  const Step3_Uploads = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Assets & Files</h2>
        <p className="text-gray-500">Securely upload your session materials.</p>
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

      <div className="grid grid-cols-2 gap-6 mt-6">
         <Input 
          label="BPM (Tempo)" 
          name="bpm" 
          value={formData.bpm} 
          onChange={handleChange} 
          placeholder="e.g. 120"
        />
        <Input 
          label="Genre" 
          name="genre" 
          value={formData.genre} 
          onChange={handleChange} 
          placeholder="e.g. Trap, Lo-fi"
        />
      </div>

      <TextArea 
        label="Reference Links (Spotify/YouTube)" 
        name="references"
        value={formData.references}
        onChange={handleChange}
        placeholder="Paste links to songs that have the vibe you are looking for..."
      />
    </div>
  );

  const Step4_Review = () => (
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
              <span className="text-amber-500 text-sm font-bold uppercase tracking-wide">{formData.projectType.toUpperCase()}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
              formData.tier === 'verified' 
                ? 'bg-zinc-800 text-white border-zinc-700' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              {formData.tier === 'verified' ? 'Mixa Verified' : 'Industry Pro'}
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">Services Requested</h4>
          <div className="flex flex-wrap gap-3">
            {formData.services.mixing && <span className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-gray-300">Mixing</span>}
            {formData.services.mastering && <span className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-gray-300">Mastering</span>}
            {formData.services.production && <span className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-gray-300">Production</span>}
            {!Object.values(formData.services).some(Boolean) && <span className="text-red-500 text-sm italic">No services selected</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">Technical Info</h4>
            <p className="text-sm text-white mb-1"><span className="text-gray-500">BPM:</span> {formData.bpm || 'N/A'}</p>
            <p className="text-sm text-white"><span className="text-gray-500">Genre:</span> {formData.genre || 'N/A'}</p>
          </div>
           <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-semibold">Files</h4>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <FileAudio size={14} className={`mr-2 ${formData.demoFile ? 'text-amber-500' : 'text-zinc-700'}`}/>
                {formData.demoFile ? <span className="text-white">{formData.demoFile.name}</span> : <span className="text-zinc-600 italic">No demo</span>}
              </div>
              <div className="flex items-center text-sm">
                <UploadCloud size={14} className={`mr-2 ${formData.stemsFile ? 'text-cyan-500' : 'text-zinc-700'}`}/>
                {formData.stemsFile ? <span className="text-white">{formData.stemsFile.name}</span> : <span className="text-zinc-600 italic">No stems</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-start space-x-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-lg text-sm mt-6">
         <div className="mt-0.5"><CheckCircle2 size={16} className="text-amber-500" /></div>
         <p>By submitting this request, you agree to our terms of service. An engineer will review your files and confirm the order within 24 hours.</p>
      </div>
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
              <h1 className="text-xl font-bold tracking-tight text-white">NEW <span className="text-amber-500">PROJECT</span></h1>
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
            {step === 1 && <Step1_ProjectInfo />}
            {step === 2 && <Step2_Services />}
            {step === 3 && <Step3_Uploads />}
            {step === 4 && <Step4_Review />}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-8 border-t border-zinc-800 flex justify-between bg-zinc-900/30">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              step === 1 
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
              onClick={() => alert("Order Submitted!")}
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