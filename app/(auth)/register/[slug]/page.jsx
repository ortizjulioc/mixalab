'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaGoogle } from 'react-icons/fa';
import Link from 'next/link';

export default function RegisterPage() {
    const router = useRouter();
    const { slug } = useParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: slug
    });
    const [message, setMessage] = useState('');

    const canvasRef = useRef(null);
    const notesRef = useRef([]);

    // Clear message when form data changes
    useEffect(() => {
        setMessage('');
    }, [formData]);

    // Animated musical notes background (same as login)
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

            // Background gradient matching main page
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, "#000000");
            g.addColorStop(0.5, "#0a0a0a");
            g.addColorStop(1, "#000000");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);

            // Add subtle glowing orbs
            const gradient1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 0, w * 0.2, h * 0.3, w * 0.4);
            gradient1.addColorStop(0, "rgba(135, 206, 235, 0.08)");
            gradient1.addColorStop(1, "transparent");
            ctx.fillStyle = gradient1;
            ctx.fillRect(0, 0, w, h);

            const gradient2 = ctx.createRadialGradient(w * 0.8, h * 0.7, 0, w * 0.8, h * 0.7, w * 0.5);
            gradient2.addColorStop(0, "rgba(135, 206, 235, 0.05)");
            gradient2.addColorStop(1, "transparent");
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 0, w, h);

            // Draw notes with subtle colors
            for (const n of notesRef.current) {
                ctx.save();
                ctx.globalAlpha = n.alpha * 0.5;
                ctx.translate(n.x, n.y);
                ctx.rotate(n.rot);
                ctx.font = `${n.size}px system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`;

                const brightness = 200 + Math.sin(n.hue * 0.1) * 55;
                ctx.fillStyle = `rgba(${brightness}, ${brightness}, 255, ${Math.max(0.05, Math.min(0.3, n.alpha))})`;
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        setLoading(true);
        setMessage("");

        const dataSend = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
        };

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataSend),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Registration successful!");

                await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    callbackUrl: `/api/auth/finalize?role=${slug}`,
                });
            } else {
                setMessage(data.message || "Error during registration.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocial = async (provider) => {
        await signIn(provider, { callbackUrl: `/api/auth/finalize?role=${slug}` });
    };

    const isArtist = slug === "ARTIST";

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Animated musical-notes canvas background */}
            <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />

            <div className="min-h-screen flex items-center justify-center p-6">
                {/* Liquid glass container */}
                <div className="max-w-md w-full rounded-3xl overflow-hidden relative">
                    {/* Subtle border glow */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-400/20 via-transparent to-sky-400/10 blur-xl -z-10"></div>

                    {/* Glass container */}
                    <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(135,206,235,0.2)]"></div>

                    {/* Content */}
                    <div className="relative p-8 sm:p-12">
                        {/* Glassmorphism overlay */}
                        <div className="absolute inset-0 backdrop-blur-md bg-white/[0.02] rounded-3xl"></div>

                        <div className="relative z-10">
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent">
                                    Join Mixa Lab
                                </h1>
                                <p className="mt-2 text-sm text-gray-300">
                                    {isArtist
                                        ? 'Create your artist account and start collaborating'
                                        : 'Join as a creator and showcase your talent'}
                                </p>
                            </div>

                            {/* Google Sign Up */}
                            <div className="mb-6">
                                <button
                                    onClick={() => handleSocial('google')}
                                    className="w-full py-3 rounded-xl cursor-pointer border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center gap-2 text-white text-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
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
                                    <span className="px-2 bg-transparent text-gray-500">Or sign up with email</span>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-2 font-medium">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder="Your name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2 font-medium">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder="you@domain.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2 font-medium">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder="Create a strong password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-2 font-medium">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all duration-300"
                                        placeholder="Confirm your password"
                                    />
                                </div>

                                {message && (
                                    <div className={`text-sm backdrop-blur-sm rounded-xl p-3 ${message.includes('successful')
                                            ? 'text-green-300 bg-green-500/10 border border-green-500/20'
                                            : 'text-red-300 bg-red-500/10 border border-red-500/20'
                                        }`}>
                                        {message}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/20 hover:shadow-white/30 hover:scale-105"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                                </svg>
                                                <span>Creating account...</span>
                                            </div>
                                        ) : (
                                            `Sign up as ${isArtist ? 'Artist' : 'Creator'}`
                                        )}
                                    </button>
                                </div>

                                <div className="mt-6 text-center text-sm text-gray-400">
                                    Already have an account?{' '}
                                    <Link
                                        href="/login"
                                        className="font-medium text-white hover:text-gray-300 transition-colors duration-300"
                                    >
                                        Sign in
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
