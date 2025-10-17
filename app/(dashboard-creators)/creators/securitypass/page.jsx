'use client'
import React, { useState, useCallback, useMemo } from 'react';
import { Mail, User, MapPin, Link, Twitter, Clock, Zap, Headphones, Mic, Sparkles, Sliders, Music, CheckCircle, XCircle, Tag } from 'lucide-react';

// Lista de plataformas sociales para el nuevo input
const SOCIAL_PLATFORMS = [
  { value: '', label: 'Select Platform' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Twitter', label: 'Twitter / X' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'SoundCloud', label: 'SoundCloud' },
  { value: 'Spotify', label: 'Spotify' },
  { value: 'Website', label: 'Website / Other' },
];

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


// Utility component for form field
const FormInput = ({ label, id, type = 'text', required = false, placeholder, value, onChange, className = '' }) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <label htmlFor={id} className="text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      id={id}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out placeholder-gray-500"
    />
  </div>
);

// Utility component for select field
const FormSelect = ({ label, id, required = false, options, value, onChange, className = '' }) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <label htmlFor={id} className="text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <select
      id={id}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out appearance-none"
    >
      {options.map((opt, index) => (
        <option key={index} value={opt.value || opt.label} disabled={index === 0 && !opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

/**
 * Utility component for tag-style input (for DAW, Plugins, Socials, and Genres).
 * It simulates a multi-select field using tags/badges.
 */
const TagInput = ({ label, id, required = false, placeholder, tags, setTags, className = '' }) => {
  const [inputValue, setInputValue] = useState('');

  // Function to add a tag
  const addTag = useCallback((tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setInputValue('');
  }, [tags, setTags]);

  // Handle key presses (Enter or Comma)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault(); // Prevents form submission and comma entry
      addTag(inputValue);
    }
  };

  // Handle paste for quick entry
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    const newTags = paste.split(/, |[\n,]/).map(t => t.trim()).filter(t => t && !tags.includes(t));
    setTags([...tags, ...newTags]);
    setInputValue('');
  };

  // Function to remove a tag
  const removeTag = useCallback((indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  }, [tags, setTags]);

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
        <span className="text-xs text-gray-500 ml-2">(Type, then press Enter or Comma)</span>
      </label>
      
      {/* Container for badges/tags */}
      <div className="flex flex-wrap gap-2 p-2 min-h-[40px] border border-gray-700 bg-black rounded-lg">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="flex items-center space-x-1 px-3 py-1 bg-amber-600/30 text-amber-300 text-sm font-medium rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-amber-300 hover:text-white transition duration-150"
              aria-label={`Remove ${tag}`}
            >
              <XCircle className="w-4 h-4 ml-1" />
            </button>
          </span>
        ))}
        
        {/* Input field */}
        <input
          type="text"
          id={id}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)} // Add tag on blur if input exists
          onPaste={handlePaste}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-grow min-w-[100px] bg-transparent text-white focus:outline-none placeholder-gray-500"
          required={required && tags.length === 0}
        />
        {/* Hidden field to enforce required validation if tags are empty */}
        {required && tags.length === 0 && (
          <input type="hidden" required aria-hidden="true" value="" />
        )}
      </div>
      {/* container */}
    </div>
  );
};

/**
 * Component to handle dynamic addition of social media links with platform selection.
 */
const SocialsInput = ({ label, required = false, socials, setSocials, className = '' }) => {
  const [newPlatform, setNewPlatform] = useState('');
  const [newLink, setNewLink] = useState('');

  const addSocial = () => {
    if (newPlatform && newLink.trim()) {
      // Check for duplicates (same platform, same link)
      const isDuplicate = socials.some(
          s => s.platform === newPlatform && s.link === newLink.trim()
      );
      // NOTE: Using alert here, but custom modal is recommended in production
      if (isDuplicate) {
          alert("This social link is already added.");
          return;
      }
      
      setSocials(prev => [...prev, { platform: newPlatform, link: newLink.trim() }]);
      setNewPlatform('');
      setNewLink('');
    }
  };

  const removeSocial = (indexToRemove) => {
    setSocials(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {/* Existing Social Links Display */}
      <div className="flex flex-col gap-2 p-3 border border-gray-700 bg-black rounded-lg">
        {socials.length === 0 && (
            <p className="text-sm text-gray-500 italic">No social links added yet.</p>
        )}
        {socials.map((social, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
            <div className="text-sm text-white truncate">
              <span className="font-semibold text-amber-300 mr-2">{social.platform}:</span>
              <a href={social.link.startsWith('http') ? social.link : `#`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition">
                {social.link}
              </a>
            </div>
            <button
              type="button"
              onClick={() => removeSocial(index)}
              className="ml-4 text-red-400 hover:text-red-300 transition"
              aria-label={`Remove ${social.platform} link`}
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Add New Social Input Group */}
        <div className="flex space-x-2 pt-2 border-t border-black/50">
            <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className="w-1/3 min-w-[120px] px-2 py-1 text-sm border border-gray-600 bg-black text-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
            >
                {SOCIAL_PLATFORMS.map(opt => (
                    <option key={opt.value} value={opt.value} disabled={!opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Handle or URL (e.g., @miksa_lab or full link)"
                className="flex-grow px-3 py-1 text-sm border border-gray-600 bg-black text-white rounded-lg placeholder-gray-500 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
                type="button"
                onClick={addSocial}
                disabled={!newPlatform || !newLink}
                className="px-3 py-1 text-sm font-semibold bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-400 disabled:bg-gray-600 disabled:text-gray-400 transition"
            >
                Add
            </button>
        </div>
        
        {/* Hidden field to enforce required validation if list is empty */}
        {required && socials.length === 0 && (
          <input type="hidden" required aria-hidden="true" value="" />
        )}
      </div>
    </div>
  );
};


// Utility component for text area
const FormTextArea = ({ label, id, required = false, placeholder, className = '' }) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <label htmlFor={id} className="text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <textarea
      id={id}
      rows="3"
      required={required}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-700 bg-black text-white rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out placeholder-gray-500"
    ></textarea>
  </div>
);

// Utility component for conditional file upload (Placeholder)
const FileUploadPlaceholder = ({ label, id, required = false, helperText, icon: Icon, className = '' }) => (
  <div className={`flex flex-col space-y-2 ${className}`}>
    <label htmlFor={id} className="text-sm font-medium text-gray-300">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <div className="flex items-center justify-between p-4 border border-dashed border-gray-600 bg-gray-700/30 rounded-lg">
        <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-amber-500" />
            <span className="text-sm text-gray-400">{helperText}</span>
        </div>
        {/* Actual file input is hidden for styling, click triggers input */}
        <button
            type="button"
            onClick={() => document.getElementById(id).click()}
            className="px-3 py-1 text-sm font-semibold text-gray-900 bg-amber-500 rounded-md hover:bg-amber-400 transition"
        >
            Choose File
        </button>
        <input type="file" id={id} required={required} className="hidden" />
    </div>
  </div>
);

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
  
  // --- Estados para las listas de Géneros y Habilidades (Usando TagInput para multi-selección) ---
  const [generalGenres, setGeneralGenres] = useState([]);
  const [mixingGenresList, setMixingGenresList] = useState([]);
  const [masteringGenresList, setMasteringGenresList] = useState([]);
  // NUEVOS ESTADOS para Recording Section (consistencia con TagInput)
  const [instrumentsPlayed, setInstrumentsPlayed] = useState([]);
  const [recordingGenresList, setRecordingGenresList] = useState([]);
  

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

  const SectionHeader = ({ title, icon: Icon, id }) => (
    <h2 id={id} className="flex items-center space-x-3 text-2xl font-bold text-amber-400 mt-10 mb-6 border-b border-gray-700 pb-2">
      <Icon className="w-6 h-6" />
      <span>{title}</span>
    </h2>
  );

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
                  <input
                    type="checkbox"
                    checked={roles[role]}
                    onChange={() => handleRoleChange(role)}
                    className="form-checkbox h-5 w-5 text-amber-500 rounded border-black focus:ring-amber-500"
                  />
                  <span className="ml-3 font-medium capitalize text-gray-200">
                    {role === 'mixing' && 'Mixing Engineer'}
                    {role === 'mastering' && 'Mastering Engineer'}
                    {role === 'recording' && 'Recording Session (Musician)'}
                  </span>
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
            <FormInput 
                label="Stage / Brand Name" 
                id="stageName" 
                required={true} 
                placeholder="Miksa-Aurelius or Studio Echo"
                value={stageName}
                onChange={(e) => setStageName(e.target.value)}
            />
            <FormSelect 
                label="Country of Residence" 
                id="country" 
                required={true} 
                options={COUNTRIES} 
                value={country} 
                onChange={(e) => setCountry(e.target.value)}
            />
            
            {/* Row 2: Years of Experience & Availability */}
            <FormInput label="Years of Experience" id="yearsExperience" required={true} type="number" placeholder="5" min="0" />
            <FormSelect
                label="Availability"
                id="availability"
                required={true}
                options={[
                    { label: 'Full-Time', value: 'FT' },
                    { label: 'Part-Time', value: 'PT' },
                    { label: 'On-Demand', value: 'OD' },
                ]}
            />
            
            {/* Row 3: Portfolio Link & Main DAW */}
            <FormInput 
                label="Portfolio or Sample Link (optional)" 
                id="portfolioLink" 
                placeholder="Drive, Dropbox, or website link"
            />
            <TagInput 
                label="Main DAW" 
                id="mainDaw" 
                required={true} 
                placeholder="Pro Tools, Logic Pro X, Ableton Live" 
                tags={mainDAWs}
                setTags={setMainDAWs}
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
            <TagInput
                label="Plugin Chain / Gear List"
                id="gearList"
                required={true}
                placeholder="UAD Apollo x8, FabFilter Pro-Q 3, Neumann U87, Waves SSL E-Channel"
                tags={pluginChains}
                setTags={setPluginChains}
                className="sm:col-span-2"
            />
            
            {/* Row 6: Genres You Specialize In (Full Width) */}
            <TagInput
                label="Genres You Specialize In"
                id="genresSpecialized"
                required={true}
                placeholder="Hip-Hop, EDM, Pop, Indie Rock (be specific)"
                tags={generalGenres}
                setTags={setGeneralGenres}
                className="sm:col-span-2"
            />
          </div>

          {/* 🎧 MIXING ENGINEER SECTION */}
          {roles.mixing && (
            <>
              <SectionHeader title="Mixing Engineer" icon={Headphones} id="mixing-engineer" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Row 1: Years Mixing & Turnaround Time (Paired) */}
                <FormInput label="Years Mixing" id="yearsMixing" required={true} type="number" placeholder="3" min="0" />
                <FormInput label="Average Turnaround Time (days)" id="mixingTurnaround" required={true} type="number" placeholder="3" min="1" />

                {/* Row 2: Genres You Mix (Full Width) */}
                <TagInput
                    label="Genres You Mix"
                    id="mixingGenres"
                    required={true}
                    placeholder="Pop, Trap, Orchestral, R&B"
                    tags={mixingGenresList}
                    setTags={setMixingGenresList}
                    className="sm:col-span-2"
                />

                {/* Row 3: Notable Artists (Full Width) */}
                <FormInput label="Notable Artists You’ve Worked With (optional)" id="notableArtists" placeholder="Artist X, Band Y" className="sm:col-span-2" />
                
                {/* Row 4: Vocal Tuning Conditional (Full Width) */}
                <div className="sm:col-span-2 space-y-3">
                    <label className="text-sm font-medium text-gray-300 block">Do You Tune Vocals? <span className="text-red-400">*</span></label>
                    <div className="flex space-x-6">
                        <label className="flex items-center text-gray-200">
                            <input
                                type="radio"
                                name="tuneVocals"
                                value="Yes"
                                required
                                onChange={() => setTunedVocalExampleNeeded(true)}
                                className="form-radio h-4 w-4 text-amber-500 border-gray-600 focus:ring-amber-500"
                            />
                            <span className="ml-2">Yes</span>
                        </label>
                        <label className="flex items-center text-gray-200">
                            <input
                                type="radio"
                                name="tuneVocals"
                                value="No"
                                required
                                onChange={() => setTunedVocalExampleNeeded(false)}
                                className="form-radio h-4 w-4 text-amber-500 border-gray-600 focus:ring-amber-500"
                            />
                            <span className="ml-2">No</span>
                        </label>
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
                <FormInput label="Years Mastering" id="yearsMastering" required={true} type="number" placeholder="2" min="0" />
                <FormInput label="Average Turnaround Time (days)" id="masteringTurnaround" required={true} type="number" placeholder="2" min="1" />

                {/* Row 2: Genres You Master (Full Width) */}
                <TagInput
                    label="Genres You Master"
                    id="masteringGenres"
                    required={true}
                    placeholder="Electronic, Rock, Lo-Fi, Podcast"
                    tags={masteringGenresList}
                    setTags={setMasteringGenresList}
                    className="sm:col-span-2"
                />

                {/* Row 3: Preferred Loudness Range (Full Width) */}
                <FormInput label="Preferred Loudness Range (LUFS or RMS, optional)" id="loudnessRange" placeholder="-12 LUFS to -8 LUFS" className="sm:col-span-2" />

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
                <FormInput label="Years of Recording or Playing" id="yearsRecording" required={true} type="number" placeholder="10" min="0" />
                {/* Div vacío para mantener la alineación en desktop */}
                <div></div>

                {/* Row 2: Instruments (Full Width TagInput, mejor consistencia) */}
                <TagInput 
                    label="What Instruments do you play" 
                    id="instrumentsPlayed" 
                    required={true} 
                    placeholder="Guitar, Drums, Cello, Synthesizer" 
                    tags={instrumentsPlayed}
                    setTags={setInstrumentsPlayed}
                    className="sm:col-span-2"
                />
                
                {/* Row 3: Genres (Full Width TagInput, mejor consistencia) */}
                <TagInput 
                    label="Genres You Record or Perform" 
                    id="recordingGenres" 
                    required={true} 
                    placeholder="Jazz Fusion, Metalcore, Cinematic Orchestral" 
                    tags={recordingGenresList}
                    setTags={setRecordingGenresList}
                    className="sm:col-span-2"
                />

                {/* Row 4: Studio Setup (Full Width Text Area) */}
                <FormTextArea 
                    label="Studio Setup (brief description)" 
                    id="studioSetup" 
                    required={true} 
                    placeholder="Home studio, custom acoustic treatment, Focusrite interface, specific mic models." 
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
            <button
              type="submit"
              disabled={!isAnyRoleSelected}
              className={`w-full py-3 rounded-xl text-lg font-bold transition duration-300 ease-in-out ${
                isAnyRoleSelected
                  ? 'bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-lg shadow-amber-500/50'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Creator Pass Application
            </button>
            {!isAnyRoleSelected && (
                <p className="text-center text-sm text-gray-400 mt-3">You must select at least one role to submit the application.</p>
            )}
          </div>
        </form>
      </div>
  );
};

export default App;
