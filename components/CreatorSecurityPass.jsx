'use client'
import React from 'react'
import { useRouter } from 'next/navigation'

export default function CreatorSecurityPass({ creatorProfile, loading }) {
    const router = useRouter();

    const handleCompleteData = () => {
        router.push('/creators/securitypass');
    };

    // Don't show anything while loading
    if (loading) {
        return null;
    }

    // Check if profile exists and has all required fields
    // Required fields from Prisma model: brandName, yearsOfExperience, mainDaw, gearList, availability
    const isProfileComplete = creatorProfile &&
        creatorProfile.brandName &&
        creatorProfile.yearsOfExperience !== null &&
        creatorProfile.yearsOfExperience !== undefined &&
        creatorProfile.mainDaw &&
        creatorProfile.gearList &&
        creatorProfile.availability;

    // Only show the alert if profile is incomplete
    if (isProfileComplete) {
        return null;
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 my-12">
            <div className="bg-amber-900/40 border-2 border-amber-600/70 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 shadow-2xl backdrop-blur-sm">

                <div className="flex items-center space-x-4 flex-grow text-center md:text-left">
                    {/* Security Alert Icon (Lock and Exclamation) */}
                    <svg className="w-10 h-10 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6-6h6m-6 0a9 9 0 1118 0 9 9 0 01-18 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14h4"></path>
                    </svg>

                    <div>
                        <h3 className="text-2xl font-bold text-amber-100 mb-1">Creator Security Pass</h3>
                        <p className="text-amber-200 text-base">
                            Attention! To activate automatic project assignment and profile verification, you must complete your security and payment information.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleCompleteData}
                    className="bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold text-sm px-8 py-3 rounded-xl transition transform hover:scale-[1.02] shadow-lg flex-shrink-0 w-full md:w-auto"
                >
                    Complete Data Now
                </button>
            </div>
        </div>
    );
}
