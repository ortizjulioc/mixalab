'use client';
import React, { useState } from 'react';
import { Chrome, Mail, Lock, User, CheckCircle } from 'lucide-react';

// Componente para los botones de acceso social con estilo Liquid Glass
const SocialGlassButton = ({ icon: Icon, label, bgColor, textColor, shadowColor }) => (
    <button
        className={`w-full flex items-center justify-center space-x-3 py-3 px-4 mb-4 rounded-xl 
                bg-white/5 backdrop-blur-sm border border-white/20 text-white 
                transition duration-300 ease-in-out transform hover:scale-[1.02]
                hover:bg-white/10 shadow-lg shadow-black/30 focus:outline-none focus:ring-2 ${shadowColor}`}
    >
        <Icon className={`w-5 h-5 ${textColor}`} />
        <span className="font-semibold">{label}</span>
    </button>
);

// Componente reutilizable para los campos de entrada
const GlassInput = ({ id, name, type, label, placeholder, value, onChange, icon: Icon }) => (
    <div className="mb-6">
        <label htmlFor={id} className="block text-white text-sm font-semibold mb-2">
            {label}
        </label>
        <div className="relative">
            <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
                type={type}
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required
                // Input styles: slightly transparent background (glass) and rounded corners, plus padding for icon
                className="w-full pl-12 pr-4 py-3 bg-white/10 text-white placeholder-gray-400 rounded-xl
                   transition duration-300 ease-in-out focus:ring-4 focus:ring-white/50 focus:bg-white/20
                   border border-white/20 focus:outline-none shadow-inner"
            />
        </div>
    </div>
);

// Main component containing the registration form with "Liquid Glass" (Glassmorphism) style
const App = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [message, setMessage] = useState('');

    // Handles changes in the form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Simulates form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }
        // Simulated registration logic
        console.log('Registration Data:', formData);
        setMessage('Registration successful! (Simulation)');
        setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    };


    return (
        // Main container with dark, atmospheric background
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: 'linear-gradient(135deg, #101010 0%, #000000 100%)',
                fontFamily: 'Inter, sans-serif'
            }}>

            {/* Background Atmosphere/Particle Effect */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle at top left, #333 1%, transparent 20%),
                               radial-gradient(circle at bottom right, #333 1%, transparent 20%)`,
                    backgroundSize: '100% 100%',
                    animation: 'pulse 15s infinite alternate'
                }}
            />
            {/* Custom CSS for the pulse animation */}
            <style>{`
        @keyframes pulse {
          0% { opacity: 0.15; }
          100% { opacity: 0.3; }
        }
      `}</style>

            {/* Form Container with the enhanced Liquid Glass Effect */}
            <div
                className="relative max-w-md w-full p-8 md:p-12 
                   bg-white/10 backdrop-blur-2xl 
                   rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/30 
                   transform transition-all duration-500 hover:shadow-[0_20px_80px_rgba(0,0,0,0.9)] 
                   hover:border-white/50 z-10"
            >
                <h1 className="text-3xl font-extrabold text-white mb-8 text-center drop-shadow-md">
                    Join the Studio
                </h1>

                {/* Social Login Section - Now using available icons */}
                <div className="mb-8 space-y-3">
                    <SocialGlassButton
                        icon={Chrome} // Used Chrome icon as Google substitute
                        label="Continue with Google"
                        shadowColor="focus:ring-red-400/50"
                    />
                </div>

                {/* Separator */}
                <div className="flex items-center mb-8">
                    <div className="flex-grow border-t border-white/20"></div>
                    <span className="flex-shrink mx-4 text-white/70 text-sm font-medium">OR</span>
                    <div className="flex-grow border-t border-white/20"></div>
                </div>

                <form onSubmit={handleSubmit}>

                    <GlassInput
                        id="fullName"
                        name="fullName"
                        type="text"
                        label="Full Name"
                        placeholder="e.g., Your Stage Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        icon={User}
                    />

                    <GlassInput
                        id="email"
                        name="email"
                        type="email"
                        label="Email Address"
                        placeholder="studio.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        icon={Mail}
                    />

                    <GlassInput
                        id="password"
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        icon={Lock}
                    />

                    <GlassInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        icon={CheckCircle}
                    />

                    {/* Status Message */}
                    {message && (
                        <p className={`text-center font-medium mb-6 ${message.includes('successful') ? 'text-green-300' : 'text-red-300'}`}>
                            {message}
                        </p>
                    )}

                    {/* Submit Button (White, with an ethereal glow) */}
                    <button
                        type="submit"
                        className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-xl 
                       transition duration-300 ease-in-out transform hover:scale-[1.02] 
                       shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:shadow-[0_0_20px_rgba(255,255,255,0.8)]
                       focus:outline-none focus:ring-4 focus:ring-white/50"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default App;
