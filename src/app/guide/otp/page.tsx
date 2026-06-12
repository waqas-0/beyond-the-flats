"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { clsx } from "@/lib/clsx";

const RESEND_SECS = 60;

export default function OtpPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(RESEND_SECS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const p = sessionStorage.getItem("btf_pending_phone") ?? "";
    setPhone(p);
    // Focus first box on mount
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    setCode((c) => c.map((x, idx) => (idx === i ? d : x)));
    if (d && i < 5) inputs.current[i + 1]?.focus();
  }

  async function verify() {
    const token = code.join("");
    if (token.length < 6) return;

    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, token }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "Invalid code. Please try again.");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
      return;
    }

    sessionStorage.removeItem("btf_pending_phone");

    // New guide → registration flow; existing guide → dashboard
    router.push(json.hasProfile ? "/guide/dashboard" : "/guide/apply");
  }

  async function resend() {
    if (seconds > 0 || !phone) return;
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setSeconds(RESEND_SECS);
    setCode(["", "", "", "", "", ""]);
    inputs.current[0]?.focus();
  }

  // Mask the phone for display: +1 242 XXX XXXX
  const masked = phone
    ? phone.replace(/(\+\d{1,3})(\d+)(\d{4})$/, (_, cc, mid, last) =>
        `${cc} ${"X".repeat(mid.length)} ${last}`,
      )
    : "";

  return (
    <AppShell>
      <div className="flex flex-1 flex-col px-7">
        <div className="mt-10 flex justify-center">
          <Logo size="md" priority />
        </div>

        <div className="mt-14 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card">
            <MessageSquareText size={32} className="text-navy" />
          </div>
        </div>

        <h1 className="mt-6 text-center text-4xl font-bold text-ink">
          Check Your SMS
        </h1>
        <p className="mt-3 text-center text-base text-muted">
          Code sent to{" "}
          <span className="font-bold text-ink">{masked || "your number"}</span>
        </p>

        <div className="mt-8 flex justify-center gap-3">
          {code.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              inputMode="numeric"
              maxLength={1}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !code[i] && i > 0)
                  inputs.current[i - 1]?.focus();
              }}
              className={clsx(
                "h-14 w-12 rounded-2xl bg-card text-center text-xl font-semibold outline-none",
                d
                  ? "border-2 border-brand text-ink"
                  : "border border-line text-faint",
              )}
            />
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-center text-sm text-danger">
            {error}
          </p>
        )}

        <Button
          variant="primary"
          className="mt-6 tracking-wide"
          onClick={verify}
          disabled={loading || code.join("").length < 6}
        >
          {loading ? "Verifying…" : "VERIFY"}
        </Button>

        <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted">
          <Clock size={16} />
          {seconds > 0 ? (
            <>
              Resend code in{" "}
              <span className="font-semibold text-brand">{seconds}s</span>
            </>
          ) : (
            <button
              onClick={resend}
              className="font-semibold text-brand underline-offset-2 hover:underline"
            >
              Resend code
            </button>
          )}
        </p>
      </div>
    </AppShell>
  );
}
