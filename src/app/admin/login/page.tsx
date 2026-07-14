"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-bg lg:grid lg:grid-cols-2">
      {/* Coastal photo — desktop only (Figma asset) */}
      <div
        className="hidden bg-cover bg-center lg:block"
        style={{ backgroundImage: "url('/brand/admin-login-bg.jpg')" }}
      >
        <div className="h-full w-full bg-black/40" />
      </div>

      {/* Form */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex justify-center">
            <Logo size="md" priority />
          </div>

          <h1 className="mt-9 text-3xl font-bold text-ink">Sign in to your portal</h1>
          <p className="mt-1.5 text-sm text-muted">
            Manage guide verification, reviews, and platform tools.
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="text-sm font-semibold text-ink">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team@beyondtheflats.com"
                autoComplete="email"
                required
                className="mt-1.5 w-full rounded-2xl border border-line bg-card px-5 py-3.5 text-sm text-ink outline-none focus:border-brand placeholder:text-faint"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-ink">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="mt-1.5 w-full rounded-2xl border border-line bg-card px-5 py-3.5 text-sm text-ink outline-none focus:border-brand placeholder:text-faint"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" className="accent-navy" /> Remember me
              </label>
              <Link
                href="/admin/forgot-password"
                className="text-sm font-semibold text-brand hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-navy py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy/90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
