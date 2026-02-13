'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const requestId = searchParams.get('requestId');

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
                <div className="inline-flex p-4 bg-red-500/10 rounded-full mb-6">
                    <XCircle className="w-16 h-16 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">Payment Cancelled</h1>
                <p className="text-gray-400 mb-8">
                    The payment process was cancelled or interrupted. No charges have been made to your account.
                </p>

                <div className="space-y-3">
                    {requestId && (
                        <button
                            onClick={() => router.push(`/artists/payment/${requestId}`)}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" /> Retry Payment
                        </button>
                    )}

                    <button
                        onClick={() => router.push('/artists/home')}
                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" /> Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
