'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { openNotification } from '@/utils/open-notification';

export default function StripeSettingsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [status, setStatus] = useState({
        isConnected: false,
        onboardingComplete: false,
        payoutsEnabled: false,
    });

    useEffect(() => {
        checkStatus();

        // Handle return from Stripe
        if (searchParams.get('success')) {
            openNotification('success', 'Stripe onboarding completed successfully!');
            router.replace('/creators/settings/stripe');
        } else if (searchParams.get('refresh')) {
            openNotification('info', 'Please complete the onboarding process.');
        }
    }, [searchParams]);

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/stripe/connect/account-status');
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            console.error('Error checking status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        setConnecting(true);
        try {
            const res = await fetch('/api/stripe/connect/onboard', {
                method: 'POST',
            });

            if (!res.ok) throw new Error('Failed to start onboarding');

            const { url } = await res.json();
            window.location.href = url;
        } catch (error) {
            console.error('Error connecting:', error);
            openNotification('error', 'Failed to connect Stripe account');
            setConnecting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Payment Settings</h1>
            <p className="text-gray-400 mb-8">
                Connect your Stripe account to receive payments for your projects.
            </p>

            <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            {status.isConnected && status.onboardingComplete ? (
                                <>
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    Stripe Account Connected
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-6 h-6 text-amber-500" />
                                    Account Not Connected
                                </>
                            )}
                        </h2>

                        <p className="text-gray-400 max-w-lg">
                            {status.isConnected && status.onboardingComplete
                                ? 'Your account is active and ready to receive payouts. Funds will be transferred automatically to your bank account.'
                                : 'You need to connect a Stripe account to accept projects and receive payments. We use Stripe for secure and automated payouts.'}
                        </p>

                        {!status.payoutsEnabled && status.isConnected && (
                            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <p className="text-amber-400 text-sm font-medium flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Your account is connected but payouts are restricted. Please check your Stripe dashboard for missing information.
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleConnect}
                        disabled={connecting || (status.isConnected && status.onboardingComplete && status.payoutsEnabled)}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${status.isConnected && status.onboardingComplete
                            ? 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                            : 'bg-[#635BFF] hover:bg-[#5851E3] text-white hover:scale-105'
                            }`}
                    >
                        {connecting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : status.isConnected && status.onboardingComplete ? (
                            <>
                                <ExternalLink className="w-5 h-5" />
                                Open Stripe Dashboard
                            </>
                        ) : (
                            <>
                                Connect with Stripe
                            </>
                        )}
                    </button>
                </div>

                {/* Benefits / Info Section */}
                <div className="grid md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-zinc-700/50">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-white">Secure Payouts</h3>
                        <p className="text-sm text-gray-400">
                            Receive funds directly to your bank account via Stripe's secure infrastructure.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-white">Auto-Transfers</h3>
                        <p className="text-sm text-gray-400">
                            Payments are transferred automatically once the project is marked as completed.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-white">Global Support</h3>
                        <p className="text-sm text-gray-400">
                            Support for bank accounts in 45+ countries and multiple currencies.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
