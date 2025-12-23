"use client";
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

            console.log("🔄 Role switch page:", {
                targetRole,
                currentRole: session?.user?.role,
                attempts
            });

            // Force session update
            await update();

            // Wait a moment for token update
            await new Promise(resolve => setTimeout(resolve, 300));

            // Check if role updated
            const currentRole = session?.user?.role;

            if (currentRole === targetRole || !targetRole) {
                console.log("✅ Role updated successfully, redirecting...");

                if (targetRole === "ARTIST" || currentRole === "ARTIST") {
                    router.push("/artists/home");
                } else if (targetRole === "CREATOR" || currentRole === "CREATOR") {
                    router.push("/creators/home");
                } else {
                    router.push("/");
                }
            } else if (attempts < MAX_ATTEMPTS) {
                console.log(`⏳ Role not updated yet, retrying... (${attempts + 1}/${MAX_ATTEMPTS})`);
                setAttempts(prev => prev + 1);
            } else {
                console.log("⚠️ Max attempts reached, forcing redirect...");
                if (targetRole === "ARTIST") {
                    router.push("/artists/home");
                } else if (targetRole === "CREATOR") {
                    router.push("/creators/home");
                } else {
                    router.push("/");
                }
            }
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