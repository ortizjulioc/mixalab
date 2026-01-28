'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import NotificationList from './NotificationList';
import useNotifications from '@/hooks/useNotifications';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { unreadCount } = useNotifications();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl liquid-glass border border-white/20 hover:bg-white/10 transition-colors group"
            >
                <Bell size={24} className={`text-white transition-transform duration-300 ${unreadCount > 0 ? 'animate-pulse-slow' : 'group-hover:rotate-12'}`} />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-bounce-subtle">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 md:w-96 origin-top-right rounded-2xl bg-[#0f0f0f] border border-white/10 shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden transform transition-all duration-200 ease-out scale-100 opacity-100">
                    <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    </div>
                    <NotificationList onClose={() => setIsOpen(false)} />
                </div>
            )}
        </div>
    );
}
