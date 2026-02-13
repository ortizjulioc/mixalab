"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

// 1. We extract the UI into a reusable Loading component
// so we can use it for both the Suspense fallback and the actual page state.
function LoadingUI({ text = "Switching role...", subtext = "Please wait a moment" }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                <p className="text-white text-lg">{text}</p>
                <p className="text-white/60 text-sm mt-2">{subtext}</p>
            </div>
        </div>
    );
}

// 2. This component holds your original logic involving useSearchParams
function RoleSwitchContent() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams(); // This is what causes the build error if not suspended
    const targetRole = searchParams.get("role");
    const [attempts, setAttempts] = useState(0);
    const MAX_ATTEMPTS = 5;

    useEffect(() => {
        const handleRoleSwitch = async () => {
            if (status === "loading") return;

            if (status === "unauthenticated") {
                router.push("/login");
                return;
            }

            const currentRole = session?.user?.role;
            const targetRoleFixed = targetRole ? targetRole.toUpperCase() : null;

            // 1. Check if we already have the correct role
            if (currentRole === targetRoleFixed || !targetRoleFixed) {
                console.log("✅ Role matched/not required, redirecting...");

                if (targetRoleFixed === "ARTIST" || currentRole === "ARTIST") {
                    router.push("/artists/home");
                } else if (targetRoleFixed === "CREATOR" || currentRole === "CREATOR") {
                    router.push("/creators/home");
                } else {
                    router.push("/");
                }
                return;
            }

            // 2. If attempts exhausted, force redirect
            if (attempts >= MAX_ATTEMPTS) {
                console.log("⚠️ Max attempts reached, forcing redirect...");
                if (targetRoleFixed === "ARTIST") {
                    router.push("/artists/home");
                } else if (targetRoleFixed === "CREATOR") {
                    router.push("/creators/home");
                } else {
                    router.push("/");
                }
                return;
            }

            // 3. Otherwise, try to update
            console.log("🔄 Role mismatch, updating session...", {
                targetRole: targetRoleFixed,
                currentRole: currentRole,
                attempts
            });

            // Force session update
            await update();

            // Increment attempts after update
            setAttempts(prev => prev + 1);
        };

        handleRoleSwitch();
    }, [status, session, targetRole, router, update, attempts]);

    // Return your visual UI with the specific attempt counters
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                <p className="text-white text-lg">Switching role...</p>
                <p className="text-white/60 text-sm mt-2">Please wait a moment</p>
                {attempts > 2 && (
                    <p className="text-white/40 text-xs mt-2">Attempt {attempts}/{MAX_ATTEMPTS}</p>
                )}
            </div>
        </div>
    );
}

// 3. The Default Export wraps the content in Suspense
export default function RoleSwitchPage() {
    return (
        <Suspense fallback={<LoadingUI />}>
            <RoleSwitchContent />
        </Suspense>
    );
}