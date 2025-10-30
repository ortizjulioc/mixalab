// components/SocialsInput.js
import React, { useState } from 'react';
import { XCircle } from 'lucide-react';

const SOCIAL_PLATFORMS = [
  { value: '', label: 'Select Platform' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Twitter', label: 'Twitter / X' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'SoundCloud', label: 'SoundCloud' },
  { value: 'Spotify', label: 'Spotify' },
  { value: 'Website', label: 'Website / Other' },
];

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
                disabled={!newPlatform || !newLink.trim()}
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

export default SocialsInput;