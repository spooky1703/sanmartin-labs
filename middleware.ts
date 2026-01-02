import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    // Detect public execution paths
    const isPublicPage = pathname === "/login" || pathname.startsWith("/consulta");
    const isPublicApi = pathname.startsWith("/api/auth") || pathname.startsWith("/api/consulta");
    const isPublic = isPublicPage || isPublicApi;

    // 1. If on login page and logged in, redirect to dashboard
    if (pathname === "/login" && isLoggedIn) {
        return NextResponse.redirect(new URL("/pacientes", req.nextUrl));
    }

    // 2. If it's a public route, allow access
    if (isPublic) {
        return NextResponse.next();
    }

    // 3. For ALL other routes (Protected), if not logged in:
    if (!isLoggedIn) {
        // If it's an API call, return 401 JSON instead of redirecting
        if (pathname.startsWith("/api")) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }
        // If it's a page navigation, redirect to login
        return NextResponse.redirect(new URL("/login", req.nextUrl));
    }

    // 4. Default root redirect for logged in users
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/pacientes", req.nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
