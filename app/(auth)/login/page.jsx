"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("ARTIST"); // ARTIST or CREATORS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const notesRef = useRef([]);

  useEffect(() => {
    setError("");
  }, [mode, email, password]);

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

      // subtle gradient background
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#071226");
      g.addColorStop(1, "#0f1724");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // draw notes
      for (const n of notesRef.current) {
        ctx.save();
        ctx.globalAlpha = n.alpha * 0.9;
        ctx.translate(n.x, n.y);
        ctx.rotate(n.rot);
        ctx.font = `${n.size}px system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`;
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.08, Math.min(0.9, n.alpha))})`;
        ctx.fillText(n.char, 0, 0);
        ctx.restore();

        n.x += n.vx;
        n.y -= n.vy; // float upward
        n.rot += (Math.random() - 0.5) * 0.02;

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

    if (mode === "ARTIST") router.push("/dashboard/artist");
    else router.push("/dashboard/creators");
  };

  const handleSocial = async (provider) => {
    const callbackUrl = `/auth/redirect?role=${mode}`; // puedes redirigir a donde quieras

    await signIn(provider, { callbackUrl });
  };

  const isArtist = mode === "ARTIST";

  return (
    <div className="relative min-h-screen">
      {/* Animated musical-notes canvas background */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 rounded-2xl shadow-2xl overflow-hidden">

          {/* Left panel: selector */}
          <aside className={`p-8 flex flex-col justify-between ${isArtist ? 'bg-[rgba(0,0,0,0.35)]' : 'bg-[rgba(2,6,23,0.45)]'} sm:p-12`}>
            <div>
              <h2 className="text-3xl font-bold text-white">{isArtist ? 'Artist Login' : 'Creators Login'}</h2>
              <p className="mt-3 text-sm text-white/80">{isArtist ? 'Sign in to manage your artist profile and music.' : 'Sign in to manage projects, sales and collaborations.'}</p>

              <div className="mt-6 flex items-center gap-3">
                <span className="text-sm text-white/70">Mode:</span>
                <div className="flex rounded-full bg-white/10 p-1">
                  <button
                    onClick={() => setMode('ARTIST')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${isArtist ? 'bg-white/90 text-black' : 'text-white/80'}`}
                  >
                    Artist
                  </button>
                  <button
                    onClick={() => setMode('CREATOR')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${!isArtist ? 'bg-white/90 text-black' : 'text-white/80'}`}
                  >
                    Creators
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-sm text-white/80">
              <p><strong>Note:</strong> The switch only indicates which account type you are using; the backend should use the `role` value to select authentication logic.</p>
            </div>
          </aside>

          {/* Right panel: form */}
          <main className={`p-8 sm:p-12 flex items-center justify-center ${isArtist ? 'bg-transparent' : 'bg-transparent'}`}>
            <div className="w-full max-w-md">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-white">{isArtist ? 'Welcome, Artist' : 'Welcome, Creator'}</h3>
                <p className="mt-1 text-sm text-white/70">{isArtist ? 'Use your email and password to access your artist account.' : 'Sign in to access your creator workspace.'}</p>
              </div>

              <div className="flex gap-3 mb-6">
                <button onClick={() => handleSocial('google')} className="flex-1 py-2 rounded-lg cursor-pointer border border-white/10 bg-white/5 flex items-center justify-center gap-2 text-white text-sm hover:bg-white/6">
                  <FaGoogle /> Continue with Google
                </button>
                <button onClick={() => handleSocial('facebook')} className="py-2 px-3 rounded-lg border border-white/10 bg-white/5 flex items-center gap-2 text-white text-sm hover:bg-white/6">
                  <FaFacebook />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/80 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50"
                    placeholder="you@domain.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/80 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/50"
                    placeholder="••••••••"
                  />
                </div>

                {error && <div className="text-sm text-red-400">{error}</div>}

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-indigo-600 cursor-pointer hover:bg-indigo-700 text-white font-medium disabled:opacity-60"
                  >
                    {loading ? 'Signing in...' : `Sign in as ${isArtist ? 'Artist' : 'Creators'}`}
                  </button>

                  <Link href="/forgot-password" className="text-sm text-white/70 hover:underline">Forgot your password?</Link>
                </div>

                <div className="mt-4 text-center text-sm text-white/70">
                  Don’t have an account? <Link href={isArtist ? '/register/ARTIST' : '/register/CREATOR'} className="underline">Sign up</Link>
                </div>
              </form>

              <p className="mt-6 text-xs text-white/50">Tip: On the backend, use the `role` field (ARTIST | CREATORS) from credentials or social callbacks to branch authentication and post-login routing.</p>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
