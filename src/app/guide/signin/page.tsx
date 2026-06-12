"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageSquareText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function GuideSigninPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }

    // Carry the normalised phone number to the OTP screen
    sessionStorage.setItem("btf_pending_phone", json.phone);
    router.push("/guide/otp");
  }

  return (
    <AppShell>
      <div className="flex flex-1 flex-col px-7">
        <div className="mt-10 flex justify-center">
          <Logo size="md" priority />
        </div>

        <h1 className="mt-14 text-center text-4xl font-bold text-ink">
          Welcome back
        </h1>
        <p className="mt-3 text-center text-base text-muted">
          Enter your phone number to continue
        </p>

        <form onSubmit={submit} className="mt-9 space-y-3.5">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-bg px-4 py-4 focus-within:border-brand">
            <Phone size={22} className="text-ink" strokeWidth={1.8} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 242 555-0123"
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-faint"
              required
            />
          </div>

          {error && (
            <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={loading}>
            <MessageSquareText size={20} />
            {loading ? "Sending…" : "Send Code via SMS"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
