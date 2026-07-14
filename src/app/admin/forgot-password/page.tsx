"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
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

          <h1 className="mt-9 text-3xl font-bold text-ink">Reset your password</h1>
          <p className="mt-1.5 text-sm text-muted">
            Enter the email to get the reset password link.
          </p>

          {sent ? (
            <div className="mt-7 rounded-2xl border border-brand/30 bg-brand-soft p-6 text-center">
              <p className="text-sm font-semibold text-ink">Check your email</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                If an account exists for {email}, a password reset link is on its way.
              </p>
              <Link
                href="/admin/login"
                className="mt-4 inline-block text-sm font-semibold text-brand"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-5">
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
                {loading ? "Sending…" : "Send reset link"}
              </button>

              <p className="text-center text-xs text-muted">
                Remember Password?{" "}
                <Link href="/admin/login" className="font-semibold text-brand">
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
