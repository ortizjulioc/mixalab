'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    CreditCard,
    Shield,
    CheckCircle2,
    ArrowLeft,
    Lock,
    DollarSign,
    Clock,
    User,
    Music,
    Award
} from 'lucide-react';

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const requestId = params.id;

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [addOns, setAddOns] = useState([]);

    useEffect(() => {
        if (requestId) {
            fetchRequestDetails();
        }
    }, [requestId]);

    const fetchRequestDetails = async () => {
        try {
            const response = await fetch(`/api/service-requests/${requestId}`);
            const data = await response.json();

            if (data.data) {
                console.log('Request data:', data.data);
                console.log('Add-ons from request:', data.data.addOns);
                setRequest(data.data);
                // Fetch add-ons details if they exist
                if (data.data.addOns && Object.keys(data.data.addOns).length > 0) {
                    await fetchAddOnsDetails(data.data.addOns, data.data.services);
                }
            }
        } catch (error) {
            console.error('Error fetching request:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAddOnsDetails = async (selectedAddOns, serviceType) => {
        try {
            const response = await fetch(`/api/add-ons?serviceType=${serviceType}`);
            const data = await response.json();

            // The API returns an array directly, not { addOns: [...] }
            const addOnsArray = Array.isArray(data) ? data : (data.addOns || []);

            if (addOnsArray.length > 0) {
                // Filter and map selected add-ons with their details
                const selectedAddOnsWithDetails = Object.entries(selectedAddOns).map(([addOnId, config]) => {
                    const addOnDetails = addOnsArray.find(a => a.id === addOnId);
                    if (addOnDetails) {
                        return {
                            ...addOnDetails,
                            quantity: config.quantity || 1,
                            selectedOptions: config.selectedOptions || [],
                        };
                    }
                    return null;
                }).filter(Boolean);

                console.log('Selected add-ons with details:', selectedAddOnsWithDetails);
                setAddOns(selectedAddOnsWithDetails);
            }
        } catch (error) {
            console.error('Error fetching add-ons:', error);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // Create Stripe Checkout session
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId: requestId,
                    tier: request.tier,
                    addOns: addOns,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create checkout session');
            }

            const { sessionUrl } = await response.json();

            // Redirect to Stripe Checkout
            window.location.href = sessionUrl;
        } catch (error) {
            console.error('Payment error:', error);
            // You might want to use a proper notification system here
            alert(error.message || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };
    const calculateTotal = () => {
        if (!request) return 0;

        const tierPrices = {
            BRONZE: 99,
            SILVER: 199,
            GOLD: 299,
            PLATINUM: 499,
        };

        const basePrice = tierPrices[request.tier] || 99;

        // Calculate add-ons price
        const addOnsPrice = addOns.reduce((total, addOn) => {
            // Handle both price and pricePerUnit
            const unitPrice = addOn.pricePerUnit || addOn.price || 0;
            const quantity = addOn.quantity || 1;
            return total + (unitPrice * quantity);
        }, 0);

        return basePrice + addOnsPrice;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                    <p className="text-gray-400 mt-4">Loading payment details...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Request not found</h1>
                    <button
                        onClick={() => router.push('/artists/home')}
                        className="text-amber-400 hover:text-amber-300"
                    >
                        Go back to dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (request.status !== 'AWAITING_PAYMENT' && request.status !== 'ACCEPTED') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <h1 className="text-2xl font-bold text-white mb-4">Payment Not Available</h1>
                    <p className="text-gray-400 mb-6">
                        This request is not ready for payment. Current status: {request.status}
                    </p>
                    <button
                        onClick={() => router.push('/artists/home')}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const total = calculateTotal();

    return (
        <div className="-m-4 md:-m-8 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Complete Your Payment</h1>
                    <p className="text-gray-400">Secure payment to start your project</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Payment Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Method Header */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                <CreditCard className="w-6 h-6 text-amber-400" />
                                Payment Method
                            </h2>
                            <p className="text-gray-400 text-sm">Enter your card details to complete the payment</p>
                        </div>

                        {/* Payment Method Selection */}
                        <div className="bg-zinc-900/40 border border-amber-500/50 rounded-xl p-4 cursor-pointer hover:border-amber-500 transition-colors">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-6 h-6 text-amber-400" />
                                <div className="flex-1">
                                    <p className="font-semibold text-white">Credit / Debit Card</p>
                                    <p className="text-sm text-gray-400">Visa, Mastercard, American Express</p>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                </div>
                            </div>
                        </div>

                        {/* Card Details Form */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Card Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        maxLength="3"
                                        className="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-300 mb-2">
                                    Cardholder Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-blue-300 font-semibold mb-1">Secure Payment</p>
                                    <p className="text-sm text-gray-300">
                                        Your payment information is encrypted and secure. We never store your card details.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-gray-600 disabled:to-gray-700 text-black font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 disabled:shadow-none flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Pay ${total} USD
                                </>
                            )}
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 border border-zinc-700/50 rounded-2xl p-6 sticky top-8">
                            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

                            {/* Project Details */}
                            <div className="space-y-4 mb-6 pb-6 border-b border-zinc-700">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Project</p>
                                    <p className="font-semibold text-white">{request.projectName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Artist</p>
                                    <p className="font-semibold text-white">{request.artistName}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Music className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-300">{request.services}</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-sm text-gray-300">{request.projectType}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-semibold text-amber-400">{request.tier} Tier</span>
                                </div>
                            </div>

                            {/* Engineer Info */}
                            {request.creator && (
                                <div className="mb-6 pb-6 border-b border-zinc-700">
                                    <p className="text-sm text-gray-400 mb-3">Your Engineer</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                                            <User className="w-5 h-5 text-black" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{request.creator.brandName}</p>
                                            <p className="text-xs text-gray-400">{request.creator.country}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-300">
                                    <span>{request.tier} Tier Service</span>
                                    <span>${(() => {
                                        const tierPrices = { BRONZE: 99, SILVER: 199, GOLD: 299, PLATINUM: 499 };
                                        return tierPrices[request.tier] || 99;
                                    })()}</span>
                                </div>

                                {/* Add-ons */}
                                {addOns.length > 0 && (
                                    <>
                                        <div className="pt-2 border-t border-zinc-700/50">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Add-ons</p>
                                        </div>
                                        {addOns.map((addOn, idx) => {
                                            const unitPrice = addOn.pricePerUnit || addOn.price || 0;
                                            const quantity = addOn.quantity || 1;
                                            return (
                                                <div key={idx} className="flex justify-between text-gray-300 text-sm">
                                                    <span className="flex items-center gap-2">
                                                        {addOn.name}
                                                        {quantity > 1 && (
                                                            <span className="text-xs text-gray-500">×{quantity}</span>
                                                        )}
                                                    </span>
                                                    <span>${(unitPrice * quantity).toFixed(2)}</span>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>

                            {/* Total */}
                            <div className="pt-4 border-t-2 border-amber-500/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-white">Total</span>
                                    <span className="text-2xl font-bold text-amber-400">${total}</span>
                                </div>
                            </div>

                            {/* Money Back Guarantee */}
                            <div className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    <p className="text-sm text-emerald-300 font-semibold">100% Money Back Guarantee</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
