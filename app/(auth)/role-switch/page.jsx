"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RoleSwitchPage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
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

            // Forzar actualización de la sesión
            await update();

            // Esperar un momento para que el token se actualice
            await new Promise(resolve => setTimeout(resolve, 300));

            // Verificar si el rol se actualizó correctamente
            const currentRole = session?.user?.role;

            if (currentRole === targetRole || !targetRole) {
                // El rol está actualizado, redirigir al dashboard
                console.log("✅ Role updated successfully, redirecting...");

                if (targetRole === "ARTIST" || currentRole === "ARTIST") {
                    router.push("/artists/home");
                } else if (targetRole === "CREATOR" || currentRole === "CREATOR") {
                    router.push("/creators/home");
                } else {
                    router.push("/");
                }
            } else if (attempts < MAX_ATTEMPTS) {
                // El rol aún no se actualizó, reintentar
                console.log(`⏳ Role not updated yet, retrying... (${attempts + 1}/${MAX_ATTEMPTS})`);
                setAttempts(prev => prev + 1);
            } else {
                // Máximo de intentos alcanzado, forzar redirección de todos modos
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
