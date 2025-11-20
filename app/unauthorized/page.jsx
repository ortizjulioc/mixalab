'use client';

import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <>
      {/* GLOBAL LIQUID GLASS STYLES */}
      <style>{`
        @keyframes pulse-bg {
          0% { opacity: 0.15; }
          100% { opacity: 0.35; }
        }
        .liquid-glass {
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 
            0 8px 32px rgba(31,38,135,0.37),
            inset 0 1px rgba(255,255,255,0.2);
        }
        .glow-border {
          box-shadow: 
            0 0 25px rgba(255, 70, 70, 0.4),
            inset 0 1px rgba(255,255,255,0.2);
        }
        @keyframes soft-glow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>

      <div
        className="min-h-screen flex items-center justify-center relative"
        style={{
          backgroundImage: 'linear-gradient(135deg, #0b0b0b, #000000)',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {/* BACKGROUND ATMOSPHERE */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle at top left, #333 1%, transparent 20%),
              radial-gradient(circle at bottom right, #333 1%, transparent 20%)
            `,
            opacity: 0.25,
            animation: 'pulse-bg 12s ease-in-out infinite alternate'
          }}
        />

        {/* CARD */}
        <div className="liquid-glass glow-border p-10 rounded-3xl max-w-lg w-[90%] text-center relative z-10 border border-white/20">
          <ShieldAlert
            size={80}
            className="mx-auto text-red-400 drop-shadow-[0_0_12px_rgba(255,0,0,0.5)] animate-soft-glow"
          />

          <h1 className="text-4xl font-bold text-white mt-6">
            Access Denied
          </h1>

          <p className="text-gray-300 mt-4 text-lg leading-relaxed">
            You do not have permission to access this section.
            <br /> Please contact the administrator if you believe this is an error.
          </p>

          {/* BUTTON */}
          <Link
            href="/"
            className="
              mt-8 inline-flex items-center space-x-3 px-6 py-3 
              liquid-glass border border-white/30 rounded-2xl 
              text-white font-semibold hover:bg-white/10 
              hover:-translate-y-1 hover:shadow-xl transition-all duration-300
            "
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </Link>
        </div>
      </div>
    </>
  );
}
