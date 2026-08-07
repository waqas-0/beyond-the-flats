// Next.js 16: middleware is deprecated — this file is the replacement.
// Export a function named `proxy` (not `middleware`).
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FEATURES } from "@/lib/features";

const PROTECTED = ["/guide/dashboard", "/guide/trips", "/guide/profile"];

// The admin panel has its own hostname. Only its bare root needs mapping —
// every link inside the panel is already an absolute /admin/... path, so those
// resolve normally on this host (and so do /_next assets and /api routes).
const ADMIN_HOST = "admin.beyondtheflats.co";

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const atAdminHostRoot =
    host === ADMIN_HOST && request.nextUrl.pathname === "/";

  // Root of the admin host serves the panel; the auth gate below bounces
  // signed-out visitors on to /admin/login, and signed-in admins skip it.
  const rewriteTo = atAdminHostRoot
    ? new URL("/admin", request.nextUrl)
    : null;

  // Cookies are collected rather than written straight to a response, because
  // the response may end up being a rewrite, a redirect, or a plain pass-through.
  const freshCookies: { name: string; value: string; options?: object }[] = [];
  const finalResponse = () => {
    const response = rewriteTo
      ? NextResponse.rewrite(rewriteTo, { request })
      : NextResponse.next({ request });
    freshCookies.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options),
    );
    return response;
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            freshCookies.push({ name, value, options });
          });
        },
      },
    },
  );

  // Refresh session — keeps the auth cookie alive
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = rewriteTo ? rewriteTo.pathname : request.nextUrl.pathname;

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

  return finalResponse();
}

export const config = {
  matcher: [
    // Bare root of the admin hostname (matcher values must be literals).
    {
      source: "/",
      has: [{ type: "header", key: "host", value: "admin.beyondtheflats.co" }],
    },
    "/guide/dashboard/:path*",
    "/guide/trips/:path*",
    "/guide/profile/:path*",
    "/guide/signin",
    "/guide/otp",
    "/admin/:path*",
  ],
};
