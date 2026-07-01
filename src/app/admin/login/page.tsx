"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, FileCheck2, Lock, Mail, ShieldCheck } from "lucide-react";

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
      {/* Brand panel — desktop only */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <ShieldCheck size={22} />
          </div>
          <span className="text-lg font-bold">Beyond The Flats</span>
        </div>

        <div className="max-w-sm">
          <h2 className="text-3xl font-bold leading-tight">
            Guide Verification Console
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">
            Review licences, approve trusted Bahamian guides, and keep the
            directory verified.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-white/80">
            <li className="flex items-center gap-3">
              <FileCheck2 size={18} className="text-accent" /> Review fishing
              licence uploads
            </li>
            <li className="flex items-center gap-3">
              <BadgeCheck size={18} className="text-accent" /> Approve or reject
              with a reason
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-accent" /> BTF team access
              only
            </li>
          </ul>
        </div>

        <p className="text-xs text-white/40">
          © 2026 Beyond The Flats — Admin
        </p>
      </aside>

      {/* Form */}
      <div className="flex min-h-screen items-center justify-center px-5 py-12 lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center text-center lg:hidden">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
              <ShieldCheck size={28} strokeWidth={1.8} />
            </div>
          </div>

          <div className="mt-5 rounded-[20px] border border-line bg-white p-7 shadow-sm sm:p-9 lg:mt-0">
            <h1 className="text-2xl font-bold text-ink">Admin sign in</h1>
            <p className="mt-1 text-sm text-muted">
              Sign in to review guide applications.
            </p>

            <form onSubmit={submit} className="mt-7 space-y-3.5">
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-bg px-4 py-3.5 focus-within:border-brand">
                <Mail size={20} className="shrink-0 text-muted" strokeWidth={1.8} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team@beyondtheflats.com"
                  autoComplete="email"
                  className="w-full bg-transparent text-base text-ink outline-none placeholder:text-faint"
                  required
                />
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-line bg-bg px-4 py-3.5 focus-within:border-brand">
                <Lock size={20} className="shrink-0 text-muted" strokeWidth={1.8} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full bg-transparent text-base text-ink outline-none placeholder:text-faint"
                  required
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
                className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-navy px-5 text-[15px] font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
