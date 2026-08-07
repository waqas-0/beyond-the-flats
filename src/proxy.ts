// Next.js 16: middleware is deprecated — this file is the replacement.
// Export a function named `proxy` (not `middleware`).
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { FEATURES } from "@/lib/features";

const PROTECTED = ["/guide/dashboard", "/guide/trips", "/guide/profile"];

// The admin panel has its own hostname; the public site lives on the other one.
const ADMIN_HOST = "admin.beyondtheflats.co";
const PUBLIC_HOST = "portal.beyondtheflats.co";

// Routes that need a session check, on any hostname.
const isGated = (pathname: string) =>
  pathname.startsWith("/admin") ||
  pathname === "/guide/signin" ||
  pathname === "/guide/otp" ||
  PROTECTED.some((p) => pathname.startsWith(p));

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  const onAdminHost = host === ADMIN_HOST;
  const { pathname: requestPath } = request.nextUrl;

  // The matcher is deliberately broad so admin-host traffic is always seen.
  // Everything else on the public site skips the session lookup below.
  if (!onAdminHost && !isGated(requestPath)) {
    return NextResponse.next();
  }

  if (onAdminHost && !requestPath.startsWith("/admin")) {
    // The admin hostname serves the panel and nothing else. Its root maps to
    // the panel (the auth gate below sends signed-out visitors to the login
    // page); any other path belongs to the public site, so hand it back.
    if (requestPath !== "/") {
      const publicUrl = new URL(request.nextUrl);
      publicUrl.host = PUBLIC_HOST;
      publicUrl.protocol = "https:";
      publicUrl.port = "";
      return NextResponse.redirect(publicUrl, 308);
    }
  }

  const rewriteTo =
    onAdminHost && requestPath === "/"
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
  // Every page request, so admin-host traffic is always seen — the proxy bails
  // out early for public-site paths. Excludes /api, Next internals, and
  // anything with a file extension (assets, /sw.js, /manifest.webmanifest).
  matcher: ["/((?!api|_next|.*\\.).*)"],
};
