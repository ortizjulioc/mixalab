'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
                <div className="inline-flex p-4 bg-green-500/10 rounded-full mb-6">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">Payment Successful!</h1>
                <p className="text-gray-400 mb-8">
                    Your payment has been processed successfully. The funds are now held in escrow by Mixa Lab and will be released to the creator once the project is completed.
                </p>

                <div className="bg-zinc-800/50 rounded-lg p-4 mb-8 text-left">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Transaction ID</p>
                    <p className="text-sm font-mono text-gray-300 break-all">{sessionId}</p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/artists/my-requests"
                        className="block w-full bg-[#635BFF] hover:bg-[#5851E3] text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        Go to My Requests <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/artists/home"
                        className="block w-full bg-zinc-800 hover:bg-zinc-700 text-gray-300 font-semibold py-3 px-6 rounded-xl transition-all"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
