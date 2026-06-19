"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";

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
    <main className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-[400px] rounded-[20px] bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-white">
            <ShieldCheck size={28} strokeWidth={1.8} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-ink">BTF Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Sign in to review guide applications
          </p>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-3.5">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-bg px-4 py-3.5 focus-within:border-brand">
            <Mail size={20} className="text-ink" strokeWidth={1.8} />
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
            <Lock size={20} className="text-ink" strokeWidth={1.8} />
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
    </main>
  );
}
