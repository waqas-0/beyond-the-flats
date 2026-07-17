// Next.js 16: middleware is deprecated — this file is the replacement.
// Export a function named `proxy` (not `middleware`).
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FEATURES } from "@/lib/features";

const PROTECTED = ["/guide/dashboard", "/guide/trips", "/guide/profile"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — keeps the auth cookie alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Week-4 trip logging is parked (FEATURES.tripLogging) — the trip logger
  // pages stay in the codebase but aren't reachable while it's off.
  if (!FEATURES.tripLogging && pathname.startsWith("/guide/trips")) {
    const url = request.nextUrl.clone();
    url.pathname = "/guide/dashboard";
    return NextResponse.redirect(url);
  }

  // Admin panel requires a session (admin_users membership is enforced in the
  // panel layout, which can read that service-role-only table). The auth pages
  // (/admin/login, /admin/forgot-password) are the routes left open.
  const ADMIN_PUBLIC = ["/admin/login", "/admin/forgot-password"];
  const isAdminArea =
    pathname.startsWith("/admin") && !ADMIN_PUBLIC.includes(pathname);
  if (isAdminArea && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // Protected routes require a session
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/guide/signin";
    return NextResponse.redirect(url);
  }

  // Auth pages redirect already-signed-in users to dashboard
  const isAuthPage =
    pathname === "/guide/signin" || pathname === "/guide/otp";
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/guide/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/guide/dashboard/:path*",
    "/guide/trips/:path*",
    "/guide/profile/:path*",
    "/guide/signin",
    "/guide/otp",
    "/admin/:path*",
  ],
};
