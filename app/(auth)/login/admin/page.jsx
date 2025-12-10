"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaShieldAlt } from "react-icons/fa";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const notesRef = useRef([]);

  useEffect(() => {
    setError("");
  }, [email, password]);

  // Animated musical notes background with RED accent for admin
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const NOTES = ["♪", "♫", "♬", "♩"];
    const count = Math.floor((w * h) / 50000) + 30;

    function initNotes() {
      notesRef.current = [];
      for (let i = 0; i < count; i++) {
        notesRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vy: 0.3 + Math.random() * 1,
          vx: -0.5 + Math.random() * 1,
          size: 12 + Math.random() * 28,
          char: NOTES[Math.floor(Math.random() * NOTES.length)],
          alpha: 0.2 + Math.random() * 0.8,
          rot: (Math.random() - 0.5) * 0.4,
          hue: Math.random() * 60 + 260,
        });
      }
    }

    function onResize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initNotes();
    }

    initNotes();
    window.addEventListener("resize", onResize);

    let raf = null;
    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Background gradient - darker for admin
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#000000");
      g.addColorStop(0.5, "#0a0000"); // Slight red tint
      g.addColorStop(1, "#000000");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Add RED glowing orbs for admin distinction
      const gradient1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.4);
      gradient1.addColorStop(0, "rgba(239, 68, 68, 0.08)"); // Red glow
      gradient1.addColorStop(1, "transparent");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, w, h);

      const gradient2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, w * 0.5);
      gradient2.addColorStop(0, "rgba(249, 115, 22, 0.05)"); // Orange glow
      gradient2.addColorStop(1, "transparent");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, w, h);

      // Draw notes with subtle red/orange tint
      for (const n of notesRef.current) {
        ctx.save();
        ctx.globalAlpha = n.alpha * 0.5;
        ctx.translate(n.x, n.y);
        ctx.rotate(n.rot);
        ctx.font = `${n.size}px system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`;

        // Subtle red/orange color
        const red = 220 + Math.sin(n.hue * 0.1) * 35;
        const green = 180 + Math.sin(n.hue * 0.1) * 35;
        ctx.fillStyle = `rgba(${red}, ${green}, 200, ${Math.max(0.05, Math.min(0.3, n.alpha))})`;
        ctx.fillText(n.char, 0, 0);
        ctx.restore();

        n.x += n.vx;
        n.y -= n.vy;
        n.rot += (Math.random() - 0.5) * 0.02;
        n.hue = (n.hue + 0.05) % 360;

        if (n.y < -50 || n.x < -100 || n.x > w + 100) {
          n.x = Math.random() * w;
          n.y = h + 30 + Math.random() * 200;
          n.vy = 0.3 + Math.random() * 1.2;
          n.vx = -0.5 + Math.random() * 1;
          n.size = 12 + Math.random() * 28;
          n.alpha = 0.2 + Math.random() * 0.9;
        }
      }

      raf = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("admin-login", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (!res) {
      setError("Unknown error. Please try again.");
      return;
    }
    if (res.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/admin/home");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated musical-notes canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />

      <div className="min-h-screen flex items-center justify-center p-6">
        {/* Liquid glass container with RED accent for admin */}
        <div className="max-w-md w-full rounded-3xl overflow-hidden relative">
          {/* RED border glow for admin distinction */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/20 via-orange-500/10 to-red-500/20 blur-xl -z-10"></div>

          {/* Glass container */}
          <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.2)]"></div>

          {/* Content */}
          <div className="relative p-8 sm:p-12">
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 backdrop-blur-md bg-white/[0.02] rounded-3xl"></div>

            <div className="relative z-10">
              {/* Admin Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                  <FaShieldAlt className="text-red-400" />
                  <span className="text-sm font-medium text-red-300">Admin Access</span>
                </div>
              </div>

              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-300 via-orange-200 to-red-300 bg-clip-text text-transparent">
                  Mixa Lab Admin
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                  Secure administrative access
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-red-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/40 focus:bg-white/10 transition-all duration-300"
                    placeholder="admin@mixalab.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-red-500/20 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/40 focus:bg-white/10 transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-300 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-3">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105"
                  >
                    {loading ? 'Signing in...' : 'Admin Sign In'}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-300 inline-flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to main site
                  </Link>
                </div>
              </form>

              {/* Security Notice */}
              <div className="mt-8 p-3 rounded-xl bg-red-500/5 border border-red-500/10 backdrop-blur-sm">
                <p className="text-xs text-gray-400 text-center">
                  🔒 This is a secure admin area. All access is logged and monitored.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
