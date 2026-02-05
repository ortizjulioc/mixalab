import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    const { role } = req.nextauth.token || {};

    console.log("Role:", role);

    const pathname = req.nextUrl.pathname;

    // --- ADMIN ---
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }

    // --- ARTISTS ---
    if (pathname.startsWith("/artists") && role !== "ARTIST") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }

    // --- CREATORS ---
    if (pathname.startsWith("/creators") && role !== "CREATOR") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Solo usuarios autenticados
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/artists/:path*", "/creators/:path*"],
};
