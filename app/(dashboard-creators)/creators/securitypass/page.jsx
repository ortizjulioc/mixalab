'use client'
import React, { useState } from 'react';
import { User, Zap, Headphones, Mic, Sparkles, Sliders, Music } from 'lucide-react';
import Checkbox from '@/components/Checkbox';
import SectionHeader from '@/components/SectionHeader';
import Input from '@/components/Input';
import Select from '@/components/Select';
import SocialsInput from './SocialsInput';
import FileUploadPlaceholder from '@/components/FileUploadPlaceholder';
import Button from '@/components/Button';



// Lista simplificada de países para el campo de selección
const COUNTRIES = [
  { value: '', label: 'Select a Country' },
  { label: 'Argentina', value: 'AR' },
  { label: 'Australia', value: 'AU' },
  { label: 'Brazil', value: 'BR' },
  { label: 'Canada', value: 'CA' },
  { label: 'France', value: 'FR' },
  { label: 'Germany', value: 'DE' },
  { label: 'India', value: 'IN' },
  { label: 'Japan', value: 'JP' },
  { label: 'Mexico', value: 'MX' },
  { label: 'Spain', value: 'ES' },
  { label: 'United Kingdom', value: 'GB' },
  { label: 'United States', value: 'US' },
  { label: 'Other', value: 'OTHER' },
];

// Main Application Form Component
const App = () => {
  const [roles, setRoles] = useState({
    mixing: false,
    mastering: false,
    recording: false,
  });
  const [tunedVocalExampleNeeded, setTunedVocalExampleNeeded] = useState(false);
  
  // --- Estado para campos de General Info ---
  const [stageName, setStageName] = useState(''); 
  const [country, setCountry] = useState('');
  const [mainDAWs, setMainDAWs] = useState([]);
  const [pluginChains, setPluginChains] = useState([]);
  
  // Lista de objetos para Socials (nueva estructura)
  const [socialLinks, setSocialLinks] = useState([]); 
  
  // --- Estados para las listas de Géneros y Habilidades (Ahora usando MultiSelect) ---
  const [generalGenres, setGeneralGenres] = useState([]);
  const [mixingGenresList, setMixingGenresList] = useState([]);
  const [masteringGenresList, setMasteringGenresList] = useState([]);
  // NUEVOS ESTADOS para Recording Section
  const [instrumentsPlayed, setInstrumentsPlayed] = useState([]);
  const [recordingGenresList, setRecordingGenresList] = useState([]);

  // Estados para campos sin estado específico (ejemplos, se pueden agregar useState si es necesario)
  const [yearsExperience, setYearsExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [yearsMixing, setYearsMixing] = useState('');
  const [mixingTurnaround, setMixingTurnaround] = useState('');
  const [notableArtists, setNotableArtists] = useState('');
  const [yearsMastering, setYearsMastering] = useState('');
  const [masteringTurnaround, setMasteringTurnaround] = useState('');
  const [loudnessRange, setLoudnessRange] = useState('');
  const [yearsRecording, setYearsRecording] = useState('');
  const [studioSetup, setStudioSetup] = useState('');

  const handleRoleChange = (role) => {
    setRoles(prev => ({ ...prev, [role]: !prev[role] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // En una aplicación real, se incluiría el fullName y email del contexto de autenticación.
    const formData = {
        stageName, 
        country,
        mainDAWs,
        pluginChains,
        socialLinks, // Lista de objetos {platform, link}
        generalGenres, 
        mixingGenresList, 
        masteringGenresList, 
        instrumentsPlayed, // NUEVO
        recordingGenresList, // NUEVO
        // ... otros campos del formulario
    };
    console.log('Form Submitted!', formData);
    console.log("Application submitted! (This is a placeholder submission).");
    // Usamos alert temporalmente, pero se recomienda un modal personalizado.
    // NOTE: In a production app, replace 'alert' with a custom modal.
    alert("Application submitted! (This is a placeholder submission).");
  };

  const isAnyRoleSelected = roles.mixing || roles.mastering || roles.recording;

  return (
      <div className="max-w-4xl mx-auto bg-white/5 p-6 sm:p-10 rounded-xl shadow-2xl border-t-4 border-amber-500">
        
        {/* Header */}
        <header className="text-center mb-10">
          <p className="text-sm font-mono text-gray-400 mb-2">MIXA CREATOR SECURITY PASS</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center">
            <Zap className="w-8 h-8 mr-3 text-amber-500 animate-pulse" />
            Access the Lab. Prove your Precision.
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Role Selection */}
          <div className="bg-gray-700/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-amber-300">Select Your Role(s)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['mixing', 'mastering', 'recording'].map(role => (
                <label key={role} className="flex items-center p-3 rounded-lg cursor-pointer bg-black hover:bg-gray-900 transition duration-150 ease-in-out border border-transparent has-[:checked]:border-amber-500 has-[:checked]:bg-gray-700/70">
                  <Checkbox
                    id={`${role}-checkbox`}
                    checked={roles[role]}
                    onChange={() => handleRoleChange(role)}
                    label={
                      role === 'mixing' ? 'Mixing Engineer' :
                      role === 'mastering' ? 'Mastering Engineer' :
                      'Recording Session (Musician)'
                    }
                    className="capitalize text-gray-200"
                    containerClassName="w-full"
                  />
                </label>
              ))}
            </div>
            {!isAnyRoleSelected && (
                <p className="text-red-400 text-sm mt-3">Please select at least one role to continue.</p>
            )}
          </div>
          
          {/* 🔐 GENERAL INFO SECTION (Required for all applicants) */}
          <SectionHeader title="General Info" icon={User} id="general-info" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Row 1: Stage Name & Country */}
            <Input
                label="Stage / Brand Name" 
                id="stageName" 
                required={true} 
                placeholder="Miksa-Aurelius or Studio Echo"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
            />
            <Select
                label="Country of Residence" 
                id="country" 
                required={true} 
                options={COUNTRIES} 
                value={country} 
                onChange={setCountry}
            />
            
            {/* Row 2: Years of Experience & Availability */}
            <Input 
              label="Years of Experience" 
              id="yearsExperience" 
              required={true} 
              type="number" 
              placeholder="5" 
              min="0"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
            />
            <Select
                label="Availability"
                id="availability"
                required={true}
                options={[
                    { label: 'Full-Time', value: 'FT' },
                    { label: 'Part-Time', value: 'PT' },
                    { label: 'On-Demand', value: 'OD' },
                ]}
                value={availability}
                onChange={setAvailability}
            />
            
            {/* Row 3: Portfolio Link & Main DAW */}
            <Input 
                label="Portfolio or Sample Link (optional)" 
                id="portfolioLink" 
                placeholder="Drive, Dropbox, or website link"
                value={portfolioLink}
                onChange={(e) => setPortfolioLink(e.target.value)}
            />
            <Select 
                label="Main DAW" 
                id="mainDaw" 
                required={true} 
                placeholder="Type DAW names, press Enter to add"
                value={mainDAWs}
                onChange={setMainDAWs}
                isMulti={true}
                isCreatable={true}
                options={
                  [
                    { label: 'Ableton Live', value: 'ableton_live' },
                    { label: 'FL Studio', value: 'fl_studio' },
                    { label: 'Logic Pro', value: 'logic_pro' },
                    { label: 'Pro Tools', value: 'pro_tools' },
                    { label: 'Cubase', value: 'cubase' },
                    { label: 'Studio One', value: 'studio_one' },
                    { label: 'Reaper', value: 'reaper' },
                    { label: 'Other', value: 'other' },
                  ]
                }
            />

            {/* Row 4: Socials (Full Width) */}
            <SocialsInput
                label="Social Media Links"
                socials={socialLinks}
                setSocials={setSocialLinks}
                className="sm:col-span-2"
                required={true}
            />
            
            {/* Row 5: Plugin Chain / Gear List (Full Width) */}
            <Select
                label="Plugin Chain / Gear List"
                id="gearList"
                required={true}
                placeholder="Type gear names, press Enter to add"
                value={pluginChains}
                onChange={setPluginChains}
                isMulti={true}
                isCreatable={true}
                options={
                  [
                    { label: 'Waves', value: 'waves' },
                    { label: 'FabFilter', value: 'fabfilter' },
                    { label: 'Universal Audio', value: 'universal_audio' },
                    { label: 'iZotope', value: 'izotope' },
                    { label: 'Native Instruments', value: 'native_instruments' },
                    { label: 'Other', value: 'other' },
                  ]
                }
                className="sm:col-span-2"
            />
            
            {/* Row 6: Genres You Specialize In (Full Width) */}
            <Select
                label="Genres You Specialize In"
                id="genresSpecialized"
                required={true}
                placeholder="Type genre names, press Enter to add"
                value={generalGenres}
                onChange={setGeneralGenres}
                isMulti={true}
                isCreatable={true}
                options={[]}
                className="sm:col-span-2"
            />
          </div>

          {/* 🎧 MIXING ENGINEER SECTION */}
          {roles.mixing && (
            <>
              <SectionHeader title="Mixing Engineer" icon={Headphones} id="mixing-engineer" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Row 1: Years Mixing & Turnaround Time (Paired) */}
                <Input 
                  label="Years Mixing" 
                  id="yearsMixing" 
                  required={true} 
                  type="number" 
                  placeholder="3" 
                  min="0"
                  value={yearsMixing}
                  onChange={(e) => setYearsMixing(e.target.value)}
                />
                <Input 
                  label="Average Turnaround Time (days)" 
                  id="mixingTurnaround" 
                  required={true} 
                  type="number" 
                  placeholder="3" 
                  min="1"
                  value={mixingTurnaround}
                  onChange={(e) => setMixingTurnaround(e.target.value)}
                />

                {/* Row 2: Genres You Mix (Full Width) */}
                <Select
                    label="Genres You Mix"
                    id="mixingGenres"
                    required={true}
                    placeholder="Type genre names, press Enter to add"
                    value={mixingGenresList}
                    onChange={setMixingGenresList}
                    isMulti={true}
                    isCreatable={true}
                    options={[]}
                    className="sm:col-span-2"
                />

                {/* Row 3: Notable Artists (Full Width) */}
                <Input 
                  label="Notable Artists You’ve Worked With (optional)" 
                  id="notableArtists" 
                  placeholder="Artist X, Band Y" 
                  value={notableArtists}
                  onChange={(e) => setNotableArtists(e.target.value)}
                  className="sm:col-span-2" 
                />
                
                {/* Row 4: Vocal Tuning Conditional (Full Width) */}
                <div className="sm:col-span-2 space-y-3">
                    <label className="text-sm font-medium text-gray-300 block">Do You Tune Vocals? <span className="text-red-400">*</span></label>
                    <div className="flex space-x-6">
                        <Checkbox
                            id="tuneVocals-yes"
                            checked={tunedVocalExampleNeeded}
                            onChange={() => setTunedVocalExampleNeeded(true)}
                            label="Yes"
                            containerClassName="mr-4"
                        />
                        <Checkbox
                            id="tuneVocals-no"
                            checked={!tunedVocalExampleNeeded}
                            onChange={() => setTunedVocalExampleNeeded(false)}
                            label="No"
                        />
                    </div>

                    {tunedVocalExampleNeeded && (
                         <FileUploadPlaceholder
                            label="Upload Example with Tuned Vocals"
                            id="tunedVocalsExample"
                            required={true}
                            helperText="Upload an audio example showcasing your vocal tuning skill."
                            icon={Sparkles}
                        />
                    )}
                </div>
                
                {/* Row 5: Upload Mix (Full Width, al final) */}
                <FileUploadPlaceholder
                    label="Upload 1 Before & After Mix"
                    id="mixExample"
                    required={true}
                    helperText="Please upload one pair of 'before' (raw) and 'after' (mixed) files."
                    icon={Music}
                    className="sm:col-span-2"
                />
              </div>
            </>
          )}

          {/* 🔊 MASTERING ENGINEER SECTION */}
          {roles.mastering && (
            <>
              <SectionHeader title="Mastering Engineer" icon={Sliders} id="mastering-engineer" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Row 1: Years Mastering & Turnaround Time (Paired) */}
                <Input 
                  label="Years Mastering" 
                  id="yearsMastering" 
                  required={true} 
                  type="number" 
                  placeholder="2" 
                  min="0"
                  value={yearsMastering}
                  onChange={(e) => setYearsMastering(e.target.value)}
                />
                <Input 
                  label="Average Turnaround Time (days)" 
                  id="masteringTurnaround" 
                  required={true} 
                  type="number" 
                  placeholder="2" 
                  min="1"
                  value={masteringTurnaround}
                  onChange={(e) => setMasteringTurnaround(e.target.value)}
                />

                {/* Row 2: Genres You Master (Full Width) */}
                <Select
                    label="Genres You Master"
                    id="masteringGenres"
                    required={true}
                    placeholder="Type genre names, press Enter to add"
                    value={masteringGenresList}
                    onChange={setMasteringGenresList}
                    isMulti={true}
                    isCreatable={true}
                    options={[]}
                    className="sm:col-span-2"
                />

                {/* Row 3: Preferred Loudness Range (Full Width) */}
                <Input 
                  label="Preferred Loudness Range (LUFS or RMS, optional)" 
                  id="loudnessRange" 
                  placeholder="-12 LUFS to -8 LUFS"
                  value={loudnessRange}
                  onChange={(e) => setLoudnessRange(e.target.value)}
                  className="sm:col-span-2" 
                />

                {/* Row 4: Upload Master (Full Width, al final) */}
                <FileUploadPlaceholder
                    label="Upload 1 Before & After Master"
                    id="masterExample"
                    required={true}
                    helperText="Please upload one pair of 'before' (mixed) and 'after' (mastered) files."
                    icon={Music}
                    className="sm:col-span-2"
                />
              </div>
            </>
          )}

          {/* 🎙️ RECORDING SESSION SECTION */}
          {roles.recording && (
            <>
              <SectionHeader title="Recording Session (Instrumentalist)" icon={Mic} id="recording-session" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Row 1: Years of Recording (1/2) + Spacer */}
                <Input 
                  label="Years of Recording or Playing" 
                  id="yearsRecording" 
                  required={true} 
                  type="number" 
                  placeholder="10" 
                  min="0"
                  value={yearsRecording}
                  onChange={(e) => setYearsRecording(e.target.value)}
                />
                {/* Div vacío para mantener la alineación en desktop */}
                <div></div>

                {/* Row 2: Instruments (Full Width MultiSelect) */}
                <Select 
                    label="What Instruments do you play" 
                    id="instrumentsPlayed" 
                    required={true} 
                    placeholder="Type instrument names, press Enter to add" 
                    value={instrumentsPlayed}
                    onChange={setInstrumentsPlayed}
                    isMulti={true}
                    isCreatable={true}
                    options={[]}
                    className="sm:col-span-2"
                />
                
                {/* Row 3: Genres (Full Width MultiSelect) */}
                <Select 
                    label="Genres You Record or Perform" 
                    id="recordingGenres" 
                    required={true} 
                    placeholder="Type genre names, press Enter to add" 
                    value={recordingGenresList}
                    onChange={setRecordingGenresList}
                    isMulti={true}
                    isCreatable={true}
                    options={[]}
                    className="sm:col-span-2"
                />

                {/* Row 4: Studio Setup (Full Width Text Area) */}
                <Input 
                    label="Studio Setup (brief description)" 
                    id="studioSetup" 
                    required={true} 
                    placeholder="Home studio, custom acoustic treatment, Focusrite interface, specific mic models." 
                    as="textarea"
                    value={studioSetup}
                    onChange={(e) => setStudioSetup(e.target.value)}
                    className="sm:col-span-2" 
                />

                {/* Row 5: Upload Example (Full Width, al final) */}
                <FileUploadPlaceholder
                    label="Upload Audio or Video Example"
                    id="performanceExample"
                    required={true}
                    helperText="Upload an example showcasing your performance/recording quality."
                    icon={Music}
                    className="sm:col-span-2"
                />
              </div>
            </>
          )}

          {/* Submission Button */}
          <div className="pt-8 border-t border-gray-700 mt-10">
            <Button
              type="submit"
              disabled={!isAnyRoleSelected}
              className={`w-full py-3 rounded-xl text-lg font-bold transition duration-300 ease-in-out ${
                isAnyRoleSelected
                  ? 'bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-lg shadow-amber-500/50'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Creator Pass Application
            </Button>
            {!isAnyRoleSelected && (
                <p className="text-center text-sm text-gray-400 mt-3">You must select at least one role to submit the application.</p>
            )}
          </div>
        </form>
      </div>
  );
};

export default App;