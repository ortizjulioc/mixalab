'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, CreditCard, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { openNotification } from '@/utils/open-notification';

export default function CheckoutPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: session } = useSession();
    const [request, setRequest] = useState(null);
    const [addOnsDetails, setAddOnsDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Pricing Logic
    const TIER_PRICES = {
        'BRONZE': 99,
        'SILVER': 199,
        'GOLD': 299,
        'PLATINUM': 499
    };

    // Calculate totals safely
    const basePrice = request ? (TIER_PRICES[request.tier] || 0) : 0;
    const addonsTotal = addOnsDetails.reduce((acc, addon) => acc + (Number(addon.price) || 0), 0);
    const subtotal = basePrice + addonsTotal;
    const serviceFee = subtotal * 0.10;
    const totalAmount = subtotal + serviceFee;

    useEffect(() => {
        if (session?.user?.id) {
            fetchRequestDetails();
        }
    }, [session, id]);

    const fetchRequestDetails = async () => {
        try {
            const res = await fetch(`/api/artists/my-requests/${id}`);
            if (!res.ok) throw new Error('Failed to load request');
            const data = await res.json();
            setRequest(data.request);

            // Fetch add-ons details if there are any
            if (data.request.addOns && typeof data.request.addOns === 'object') {
                const addonIds = Object.keys(data.request.addOns);
                if (addonIds.length > 0) {
                    await fetchAddOnsDetails(addonIds);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            openNotification('error', 'Error loading request details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAddOnsDetails = async (addonIds) => {
        try {
            const res = await fetch(`/api/service-add-ons?ids=${addonIds.join(',')}`);
            if (!res.ok) throw new Error('Failed to load add-ons');
            const data = await res.json();
            setAddOnsDetails(data.addOns || []);
        } catch (error) {
            console.error('Error fetching add-ons:', error);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/service-requests/${id}/payment`, {
                method: 'POST',
                body: JSON.stringify({ amount: totalAmount }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Payment failed');
            }

            openNotification('success', 'Payment successful! Project started.');
            router.push(`/artists/my-requests/${id}`);
        } catch (error) {
            console.error('Payment error:', error);
            openNotification('error', error.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white">
                <p>Request not found</p>
                <button onClick={() => router.back()} className="text-amber-400 mt-4">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Request
                </button>

                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 p-6 border-b border-zinc-800">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-amber-400" />
                                Checkout
                            </h1>
                            <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm font-semibold border border-amber-500/30">
                                Secure Payment
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid md:grid-cols-2 gap-8">
                        {/* Order Summary */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-200 border-b border-zinc-800 pb-2">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Project Name</span>
                                    <span className="font-medium">{request.projectName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Service Type</span>
                                    <span className="font-medium">{request.services}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Tier</span>
                                    <span className={`font-bold ${request.tier === 'PLATINUM' ? 'text-cyan-400' :
                                        request.tier === 'GOLD' ? 'text-amber-400' :
                                            request.tier === 'SILVER' ? 'text-gray-300' : 'text-orange-400'
                                        }`}>{request.tier}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Creator</span>
                                    <span className="font-medium text-amber-400">
                                        {request.creator?.brandName || 'Assigned Creator'}
                                    </span>
                                </div>

                                {/* Add-ons Section */}
                                {addOnsDetails.length > 0 && (
                                    <div className="border-t border-zinc-800 pt-3 mt-3">
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Add-ons</p>
                                        {addOnsDetails.map((addon) => (
                                            <div key={addon.id} className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-300">+ {addon.name}</span>
                                                <span className="text-gray-400">${addon.price?.toFixed(2) || '0.00'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 mt-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Base Price ({request.tier})</span>
                                    <span className="font-medium">${basePrice.toFixed(2)}</span>
                                </div>
                                {addonsTotal > 0 && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-400">Add-ons Total</span>
                                        <span className="font-medium">${addonsTotal.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mb-2 border-t border-zinc-700/50 pt-2">
                                    <span className="text-gray-400">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400">Service Fee (10%)</span>
                                    <span className="font-medium">${serviceFee.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-zinc-700 my-2 pt-2 flex justify-between items-center">
                                    <span className="text-lg font-bold text-white">Total</span>
                                    <span className="text-2xl font-bold text-amber-400">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method (Mock) */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-200 border-b border-zinc-800 pb-2">Payment Details</h2>

                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4 opacity-75 pointer-events-none">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 uppercase font-semibold">Card Number</label>
                                    <div className="flex items-center bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
                                        <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                                        <span className="text-gray-400">•••• •••• •••• 4242</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase font-semibold">Expiry</label>
                                        <div className="bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
                                            <span className="text-gray-400">12 / 28</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-400 uppercase font-semibold">CVC</label>
                                        <div className="bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-700">
                                            <span className="text-gray-400">•••</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                                <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-blue-300">Secure Transaction</h4>
                                    <p className="text-xs text-blue-200/70 mt-1">
                                        Your payment is protected by 256-bit encryption. Funds are held in escrow until the project is completed.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300
                                    ${processing
                                        ? 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/20 hover:shadow-amber-500/40'
                                    }`}
                            >
                                {processing ? (
                                    <>
                                        <Clock className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
