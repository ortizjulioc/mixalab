"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Link from "next/link";

// Loading component for Suspense fallback
function LoadingUI() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    </div>
  );
}

// Main login content component
function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState("ARTIST"); // ARTIST or CREATOR
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const notesRef = useRef([]);

  useEffect(() => {
    setError("");
  }, [mode, email, password]);

  // Handle automatic role selection via query params
  useEffect(() => {
    const slug = searchParams.get("slug") || searchParams.get("role") || searchParams.get("mode");
    if (slug) {
      const upperSlug = slug.toUpperCase();
      if (upperSlug === "ARTIST") setMode("ARTIST");
      else if (upperSlug === "CREATOR") setMode("CREATOR");
    }
  }, [searchParams]);

  // --- Lightweight animated musical-notes background (2D canvas) ---
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
          hue: Math.random() * 60 + 260, // Purple to cyan range
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

      // Background gradient matching main page
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#000000"); // Pure black
      g.addColorStop(0.5, "#0a0a0a"); // Almost black
      g.addColorStop(1, "#000000"); // Pure black
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Add subtle glowing orbs matching main page
      const gradient1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.4);
      gradient1.addColorStop(0, "rgba(135, 206, 235, 0.08)"); // Sky blue glow (subtle)
      gradient1.addColorStop(1, "transparent");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, w, h);

      const gradient2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, w * 0.5);
      gradient2.addColorStop(0, "rgba(135, 206, 235, 0.05)"); // Sky blue glow (very subtle)
      gradient2.addColorStop(1, "transparent");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, w, h);

      // draw notes with subtle colors matching main page
      for (const n of notesRef.current) {
        ctx.save();
        ctx.globalAlpha = n.alpha * 0.5;
        ctx.translate(n.x, n.y);
        ctx.rotate(n.rot);
        ctx.font = `${n.size}px system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`;

        // Subtle white/cyan color
        const brightness = 200 + Math.sin(n.hue * 0.1) * 55;
        ctx.fillStyle = `rgba(${brightness}, ${brightness}, 255, ${Math.max(0.05, Math.min(0.3, n.alpha))})`;
        ctx.fillText(n.char, 0, 0);
        ctx.restore();

        n.x += n.vx;
        n.y -= n.vy; // float upward
        n.rot += (Math.random() - 0.5) * 0.02;
        n.hue = (n.hue + 0.05) % 360; // Slowly shift

        if (n.y < -50 || n.x < -100 || n.x > w + 100) {
          // recycle
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

  // --- Authentication handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      role: mode,
    });

    setLoading(false);

    if (!res) {
      setError("Unknown error. Please try again.");
      return;
    }
    if (res.error) {
      setError(res.error);
      return;
    }

    // Obtener la sesión actualizada para verificar el rol real del usuario
    const { getSession } = await import("next-auth/react");
    const session = await getSession();

    if (session?.user?.role) {
      // Redirigir basándose en el rol real del usuario
      if (session.user.role === "ARTIST") {
        router.push("/artists/home");
      } else if (session.user.role === "CREATOR") {
        router.push("/creators/home");
      } else {
        router.push("/");
      }
    } else {
      // Fallback: usar el modo seleccionado si no hay sesión
      if (mode === "ARTIST") router.push("/artists/home");
      else router.push("/creators/home");
    }
  };

  const handleSocial = async (provider) => {
    const callbackUrl = `/auth/redirect?role=${mode}`; // puedes redirigir a donde quieras

    await signIn(provider, { callbackUrl });
  };

  const isArtist = mode === "ARTIST";

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated musical-notes canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />

      <div className="min-h-screen flex items-center justify-center p-6">
        {/* Liquid glass container with subtle border matching main page */}
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden relative">
          {/* Subtle border glow matching main page */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-400/20 via-transparent to-sky-400/10 blur-xl -z-10"></div>

          {/* Glass container */}
          <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(135,206,235,0.2)]"></div>

          {/* Left panel: selector */}
          <aside className="relative p-8 sm:p-12 flex flex-col justify-between transition-all duration-500">
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 backdrop-blur-md bg-white/[0.03]"></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                {isArtist ? 'Artist Login' : 'Creators Login'}
              </h2>
              <p className="mt-3 text-sm text-gray-300">
                {isArtist
                  ? 'Sign in as an artist to discover and request music services.'
                  : 'Sign in as a creator to offer your services and collaborate.'}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-gray-400">Mode:</span>
                <div className="flex rounded-full bg-white/10 backdrop-blur-sm p-1 border border-white/20">
                  <button
                    onClick={() => setMode('ARTIST')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isArtist
                      ? 'bg-white text-black shadow-lg shadow-white/30'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Artist
                  </button>
                  <button
                    onClick={() => setMode('CREATOR')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${!isArtist
                      ? 'bg-white text-black shadow-lg shadow-white/30'
                      : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Creators
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 text-xs text-gray-400 bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <p className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <span><strong className="text-white">Tip:</strong> You can switch between Artist and Creator modes anytime you login. Your account will be updated to the selected role.</span>
              </p>
            </div>
          </aside>

          {/* Right panel: form */}
          <main className="relative p-8 sm:p-12 flex items-center justify-center">
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 backdrop-blur-md bg-white/[0.02]"></div>

            <div className="w-full max-w-md relative z-10">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                  {isArtist ? 'Welcome, Artist' : 'Welcome, Creator'}
                </h3>
                <p className="mt-1 text-sm text-gray-300">
                  {isArtist
                    ? 'Use your email and password to access your artist account.'
                    : 'Sign in to access your creator workspace.'}
                </p>
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => handleSocial('google')}
                  className="flex-1 py-3 rounded-xl cursor-pointer border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center gap-2 text-white text-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
                >
                  <FaGoogle className="text-lg" /> Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-transparent text-gray-500">Or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                    placeholder="you@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-300 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl p-3">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/20 hover:shadow-white/30 hover:scale-105"
                  >
                    {loading ? 'Signing in...' : `Sign in as ${isArtist ? 'Artist' : 'Creator'}`}
                  </button>

                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="mt-6 text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    href={isArtist ? '/register/ARTIST' : '/register/CREATOR'}
                    className="font-medium text-white hover:text-gray-300 transition-colors duration-300"
                  >
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}

// Default export wraps content in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <LoginPageContent />
    </Suspense>
  );
}
