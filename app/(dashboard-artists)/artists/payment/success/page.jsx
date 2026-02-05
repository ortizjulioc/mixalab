'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const sessionId = searchParams.get('session_id');

    const [status, setStatus] = useState('loading'); // loading, processing, success, error
    const [projectId, setProjectId] = useState(null);
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
                const data = await response.json();

                if (data.status === 'paid') {
                    if (data.projectId) {
                        setProjectId(data.projectId);
                        setStatus('success');
                    } else {
                        // Payment paid but project not created (Webhook delay)
                        setStatus('processing');
                        // Retry matching if attempts < 10
                        if (attempts < 10) {
                            setTimeout(() => {
                                setAttempts(prev => prev + 1);
                            }, 2000); // Poll every 2s
                        }
                    }
                } else {
                    setStatus('error');
                }
            } catch (error) {
                console.error("Verification error", error);
                setStatus('error');
            }
        };

        checkStatus();
    }, [sessionId, attempts]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">

                {status === 'loading' || status === 'processing' ? (
                    <>
                        <div className="inline-flex p-4 bg-amber-500/10 rounded-full mb-6">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Processing Payment...</h1>
                        <p className="text-gray-400 mb-8">
                            We are confirming your transaction and setting up your project workspace. This usually takes a few seconds.
                        </p>
                    </>
                ) : status === 'success' ? (
                    <>
                        <div className="inline-flex p-4 bg-green-500/10 rounded-full mb-6">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
                        <p className="text-gray-400 mb-8">
                            Your project has been created successfully! You can now access your workspace.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-6">
                            <CheckCircle2 className="w-16 h-16 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-gray-400 mb-8">
                            We received your payment but couldn't load the project details immediately. Please check "My requests".
                        </p>
                    </>
                )}

                <div className="bg-zinc-800/50 rounded-lg p-4 mb-8 text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transaction ID</p>
                    <p className="text-sm font-mono text-gray-300 break-all">{sessionId}</p>
                </div>

                <div className="space-y-3">
                    {projectId && (
                        <button
                            onClick={() => router.push(`/artists/projects/${projectId}`)}
                            className="w-full bg-[#635BFF] hover:bg-[#5851E3] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            Go to Project Workspace <ArrowRight className="w-5 h-5" />
                        </button>
                    )}

                    <Link
                        href="/artists/my-requests"
                        className={`block w-full ${!projectId ? 'bg-[#635BFF] hover:bg-[#5851E3] text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-gray-300'} font-semibold py-3 px-6 rounded-xl transition-all`}
                    >
                        {projectId ? 'Return to Dashboard' : 'Go to My Requests'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
