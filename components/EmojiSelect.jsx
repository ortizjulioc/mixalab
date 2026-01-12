'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Smile } from 'lucide-react';

const COMMON_EMOJIS = [
    '⚡', '🎵', '🎧', '💿', '💾', '🎤', '🎹', '🎸', '🎼',
    '🎚️', '🎛️', '📼', '📦', '🚀', '⭐', '🔥', '💎', '🎨',
    '🎬', '📢', '🔔', '✨', '🅰️', '🅱️', '🔁', '🔄', '📊',
    '🎉', '⚠️', '✅', '❌', '🔍', '📅', '📝', '🔒', '🔓',
    '🔥', '💯', '💸', '🏆', '👀', '👇', '👉', '👋', '🛑'
];

export default function EmojiSelect({ value, onChange, label, required = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const labelClassName = `text-sm font-medium ${required ? 'font-bold text-amber-400' : 'text-gray-300'}`;

    return (
        <div className="flex flex-col space-y-2 relative" ref={containerRef}>
            <label className={labelClassName}>
                {label} {required && <span className="text-red-400">*</span>}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-500 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out flex items-center justify-between ${isOpen ? 'border-amber-500 ring-1 ring-amber-500' : 'border-gray-700'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 flex items-center justify-center text-lg ${!value && 'text-gray-500'}`}>
                        {value || <Smile size={16} />}
                    </div>
                    <span className={`text-sm ${!value ? 'text-gray-500' : 'text-white'}`}>
                        {value ? value : 'Select Icon...'}
                    </span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 p-4 bg-black border border-gray-700 rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 top-full">
                    <div className="grid grid-cols-7 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                        {COMMON_EMOJIS.map((emoji, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    onChange(emoji);
                                    setIsOpen(false);
                                }}
                                className={`aspect-square flex items-center justify-center text-xl rounded-lg transition-all duration-200 ${value === emoji
                                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                                    }`}
                                title={emoji}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-700">
                        <div className="relative">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder="Type custom emoji..."
                                className="w-full px-4 py-2 border rounded-lg bg-black text-white placeholder-gray-500 focus:ring-amber-500 focus:border-amber-500 transition duration-150 ease-in-out border-gray-700 text-sm"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
