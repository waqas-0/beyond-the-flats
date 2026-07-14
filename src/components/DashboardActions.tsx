"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, Clock, Lock, Pencil, RefreshCw, Sailboat } from "lucide-react";
import type { VerificationStatus } from "@/lib/supabase/types";

// Dashboard's interactive top: an approval banner for unverified guides + the
// primary "Start Trip" action, which is toast-blocked until the guide is
// approved. (Server-side enforcement on the trip APIs is the next layer.)
export function DashboardActions() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/guide/profile")
      .then((r) => r.json())
      .then((j) => {
        if (!active) return;
        setStatus(j.guide?.verification_status ?? null);
        setReason(j.guide?.rejection_reason ?? null);
        setLoaded(true);
      })
      .catch(() => active && setLoaded(true));
    return () => {
      active = false;
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const approved = status === "approved";
  const locked = loaded && !approved;

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4500);
  }

  function startTrip() {
    if (!loaded) return;
    if (!approved) {
      showToast(
        status === "rejected"
          ? "Your application wasn’t approved. Update & re-submit to start logging trips."
          : "Your profile is pending approval — trip logging unlocks once an admin approves you.",
      );
      return;
    }
    router.push("/guide/trips/active");
  }

  return (
    <section className="space-y-3">
      {/* Approval banner */}
      {locked && status === "pending" && (
        <div className="flex items-start gap-3 rounded-[20px] border border-gold/30 bg-gold/10 p-4">
          <Clock size={20} className="mt-0.5 shrink-0 text-gold" />
          <div>
            <p className="font-semibold text-ink">Profile under review</p>
            <p className="mt-0.5 text-sm text-muted">
              Verification takes 24–48 hours. You can look around, but trip
              logging unlocks once you’re approved.
            </p>
          </div>
        </div>
      )}
      {locked && status === "rejected" && (
        <div className="rounded-[20px] border border-danger/30 bg-danger-soft p-4">
          <div className="flex items-start gap-3">
            <CircleAlert size={20} className="mt-0.5 shrink-0 text-danger" />
            <div>
              <p className="font-semibold text-ink">Application not approved</p>
              {reason && <p className="mt-0.5 text-sm text-danger">{reason}</p>}
            </div>
          </div>
          <Link
            href="/guide/profile/edit"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-danger px-4 py-2 text-sm font-semibold text-white"
          >
            <Pencil size={15} /> Update &amp; re-submit
          </Link>
        </div>
      )}

      {/* Cloud status (mock for now — Week 6) */}
      <div className="flex items-center justify-between rounded-[20px] border border-line bg-card px-4 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
            <RefreshCw size={16} className="text-brand" />
          </span>
          <div>
            <p className="text-sm uppercase tracking-wide text-brand">Cloud Status</p>
            <p className="text-2xl text-ink">Data Synced</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-faint">Last update</p>
          <p className="text-xs text-muted">2 min ago</p>
        </div>
      </div>

      {/* Primary action — gated */}
      <button
        onClick={startTrip}
        className="flex w-full items-center justify-between rounded-[20px] bg-navy p-5 text-left shadow-lg shadow-black/10"
      >
        <div>
          <p className="text-sm tracking-wide text-accent">
            {locked ? "Locked until approved" : "Ready to cast?"}
          </p>
          <p className="text-2xl uppercase tracking-tight text-white">
            Start Today&apos;s Trip
          </p>
        </div>
        {locked ? (
          <Lock size={32} className="text-accent/50" />
        ) : (
          <Sailboat size={40} className="text-accent/40" />
        )}
      </button>

      {/* Toast */}
      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-40 mx-auto flex max-w-107.5 justify-center px-5">
          <div className="rounded-2xl bg-ink px-4 py-3 text-center text-sm font-medium text-white shadow-xl">
            {toast}
          </div>
        </div>
      )}
    </section>
  );
}
