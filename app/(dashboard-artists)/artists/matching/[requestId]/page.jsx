'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Star, MapPin, Award, Clock, CheckCircle2, Zap, Crown, TrendingUp } from 'lucide-react';

export default function MixaMatchingPage() {
    const params = useParams();
    const router = useRouter();
    const requestId = params.requestId;

    const [matching, setMatching] = useState(true);
    const [matchedCreator, setMatchedCreator] = useState(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate matching process
        const matchingTimer = setTimeout(() => {
            // Try to find a matching creator
            findMatchingCreator();
        }, 3000);

        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 60);

        return () => {
            clearTimeout(matchingTimer);
            clearInterval(progressInterval);
        };
    }, [requestId]);

    const findMatchingCreator = async () => {
        try {
            const response = await fetch(`/api/service-requests/${requestId}/match`);
            const data = await response.json();

            setMatching(false);
            if (data.creator) {
                setMatchedCreator(data.creator);
            }
        } catch (error) {
            console.error('Error finding match:', error);
            setMatching(false);
        }
    };

    const handleContinue = () => {
        router.push('/artists/home');
    };

    if (matching) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full">
                    {/* Animated Logo/Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 rounded-full border-2 border-amber-500/30">
                                <Sparkles className="w-16 h-16 text-amber-400 animate-spin" style={{ animationDuration: '3s' }} />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-3">
                            Mixa<span className="text-amber-500">MATCHING</span>
                        </h1>
                        <p className="text-xl text-gray-400">Finding the perfect engineer for your project...</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="bg-zinc-800/50 rounded-full h-3 overflow-hidden border border-zinc-700/50">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 via-amber-500 to-purple-500 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-500 mt-2">{progress}% Complete</p>
                    </div>

                    {/* Matching Steps */}
                    <div className="space-y-3">
                        {[
                            { icon: Zap, text: 'Analyzing your project requirements', delay: 0 },
                            { icon: Star, text: 'Searching our network of top engineers', delay: 1000 },
                            { icon: Award, text: 'Matching tier and specialization', delay: 2000 }
                        ].map((step, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 animate-in fade-in slide-in-from-left-4"
                                style={{ animationDelay: `${step.delay}ms` }}
                            >
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <step.icon className="w-5 h-5 text-amber-400" />
                                </div>
                                <span className="text-gray-300">{step.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // No match available state
    if (!matching && !matchedCreator) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
                <div className="max-w-3xl w-full">
                    {/* No Match Available */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-4 bg-zinc-800/50 rounded-full border border-zinc-700/50 mb-6">
                            <Clock className="w-12 h-12 text-gray-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-3">All Engineers Are Currently Busy</h1>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto">
                            Your project is important — please wait patiently. We'll automatically assign your project to the next available engineer that matches your tier and requirements.
                        </p>
                    </div>

                    {/* Upgrade Offer */}
                    <div className="bg-gradient-to-br from-amber-900/20 via-zinc-900/60 to-purple-900/20 border-2 border-amber-500/30 rounded-2xl p-8 relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                        <div className="relative z-10">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-full mb-6">
                                <Crown className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-bold text-amber-400">UPGRADE YOUR EXPERIENCE</span>
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-2">
                                MixaLab <span className="text-amber-400">One</span> — $0 Today
                            </h2>
                            <p className="text-gray-400 mb-6">Lock in your rate forever at $34.99/month with AutoPay</p>

                            {/* Benefits */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                                {[
                                    { icon: TrendingUp, text: 'Front-of-queue Production Priority' },
                                    { icon: Zap, text: 'Automatic 1-Day Faster Delivery' },
                                    { icon: CheckCircle2, text: '1 Extra Revision per Song' },
                                    { icon: Sparkles, text: 'Access to Future Features' },
                                    { icon: Award, text: '10% Off Add-On Services' },
                                    { icon: Crown, text: 'MixaLab One Status Badge' }
                                ].map((benefit, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="p-1.5 bg-amber-500/10 rounded-lg shrink-0 mt-0.5">
                                            <benefit.icon className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <span className="text-sm text-gray-300">{benefit.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02]">
                                    Add MixaLab One
                                </button>
                                <button
                                    onClick={handleContinue}
                                    className="flex-1 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300"
                                >
                                    No Thanks
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                Cancel anytime. No commitments.
                            </p>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <div className="text-center mt-6">
                        <button
                            onClick={handleContinue}
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            Continue to Dashboard →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-full border border-emerald-500/30 mb-6 animate-in zoom-in">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-3 animate-in fade-in slide-in-from-bottom-4">
                        🎯 Engineer Matched!
                    </h1>
                    <p className="text-lg text-gray-400">We've assigned a compatible engineer to your project</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-300 font-semibold">Waiting for engineer's response</span>
                    </div>
                </div>

                {/* Creator Card */}
                <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 mb-6" style={{ animationDelay: '200ms' }}>
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        {/* Header with badges */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">{matchedCreator.brandName}</h2>
                                <div className="flex items-center gap-2 text-amber-400 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-current" />
                                    ))}
                                    <span className="text-white font-semibold ml-2">{matchedCreator.rating || '4.9'}</span>
                                </div>
                            </div>

                            {/* Favorite Button */}
                            <button className="p-3 bg-zinc-700/50 hover:bg-zinc-600/50 rounded-full transition-colors">
                                <Star className="w-6 h-6 text-gray-400 hover:text-amber-400 transition-colors" />
                            </button>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-bold rounded-full">
                                Mixa's Choice
                            </span>
                            <span className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-bold rounded-full">
                                {matchedCreator.tier || 'Platinum'}
                            </span>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-700/30 rounded-lg">
                                    <Award className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Specialization</p>
                                    <p className="text-sm font-semibold text-white">{matchedCreator.specialization || 'Hybrid Analog'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-zinc-700/30 rounded-lg">
                                    <MapPin className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Location</p>
                                    <p className="text-sm font-semibold text-white">{matchedCreator.country || '🇮🇹 Italy'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-700/30 mb-6">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{matchedCreator.projectsCompleted || '0'}</p>
                                <p className="text-xs text-gray-500">Projects</p>
                            </div>
                            <div className="text-center border-l border-r border-zinc-700/30">
                                <p className="text-2xl font-bold text-white">{matchedCreator.yearsOfExperience || '0'} yrs</p>
                                <p className="text-xs text-gray-500">Experience</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">{matchedCreator.onTimePercentage || '0'}%</p>
                                <p className="text-xs text-gray-500">On-Time</p>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Clock className="w-5 h-5 text-blue-400 mt-0.5" />
                                <div>
                                    <h4 className="font-bold text-blue-300 mb-1">What happens next?</h4>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        The engineer has been notified about your project and will review it shortly.
                                        <span className="font-semibold text-blue-200"> This may take a few hours.</span>
                                        {' '}You'll receive a notification once they accept. You can track the status in your dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={handleContinue}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
