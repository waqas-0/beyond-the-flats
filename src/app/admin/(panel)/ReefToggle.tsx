"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { clsx } from "@/lib/clsx";

// Grant / revoke a guide's Reef Ambassador certification. The badge on the
// public profile shows only while certified.
export function ReefToggle({
  guideId,
  certified,
}: {
  guideId: string;
  certified: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/admin/guides/${guideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reef", value: !certified }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={clsx(
              "flex h-9 w-9 items-center justify-center rounded-full",
              certified ? "bg-brand-soft text-brand" : "bg-card text-muted",
            )}
          >
            <ShieldCheck size={18} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Reef Ambassador</p>
            <p className="text-xs text-muted">
              {certified
                ? "Certified — badge shows on their profile"
                : "Not certified"}
            </p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={busy}
          className={clsx(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
            certified
              ? "border border-danger/40 bg-white text-danger hover:bg-danger-soft"
              : "bg-brand text-white hover:bg-brand/90",
          )}
        >
          {busy ? "Saving…" : certified ? "Revoke" : "Certify"}
        </button>
      </div>
      {error && (
        <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
