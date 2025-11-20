import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        const { role } = req.nextauth.token || {};
        console.log("I AM IN THE MIDDLEWARE")

        console.log("Role:", role)

        const pathname = req.nextUrl.pathname;

        // --- ADMIN ---
        if (pathname.startsWith("/dashboard-admin") && role !== "ADMIN") {
            return new Response("Unauthorized", { status: 403 });
        }

        // --- ARTISTS ---
        if (pathname.startsWith("/dashboard-artists") && role !== "ARTIST") {
            return new Response("Unauthorized", { status: 403 });
        }

        // --- CREATORS ---
        if (pathname.startsWith("/dashboard-creators") && role !== "CREATOR") {
            return new Response("Unauthorized", { status: 403 });
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token, // Solo usuarios autenticados
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
        "/artists/:path*",
        "/creators/:path*",
    ],
};
