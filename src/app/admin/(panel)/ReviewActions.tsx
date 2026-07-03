"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function ReviewActions({ guideId }: { guideId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "reject">(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function decide(action: "approve" | "reject", reasonText?: string) {
    setError(null);
    setBusy(action);
    const res = await fetch(`/api/admin/guides/${guideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: reasonText }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);

    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    setRejecting(false);
    setReason("");
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => decide("approve")}
          disabled={busy !== null}
          className="order-2 inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-60"
        >
          <Check size={18} /> {busy === "approve" ? "Approving…" : "Approve Guide"}
        </button>
        <button
          onClick={() => setRejecting(true)}
          disabled={busy !== null}
          className="order-1 inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-danger/40 bg-white px-5 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft disabled:opacity-60"
        >
          <X size={18} /> Reject Application
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {rejecting && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-6"
          onClick={() => !busy && setRejecting(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-ink">Reject application</h3>
            <p className="mt-1.5 text-sm text-muted">
              The guide will be notified with this reason so they can fix and
              re-submit.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Licence photo is blurry — please re-upload a clear image."
              className="mt-4 w-full resize-none rounded-2xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-brand placeholder:text-faint"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setRejecting(false)}
                disabled={busy !== null}
                className="flex-1 rounded-full bg-card py-3 text-sm font-semibold text-ink disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => decide("reject", reason)}
                disabled={busy !== null || !reason.trim()}
                className="flex-1 rounded-full bg-danger py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy === "reject" ? "Rejecting…" : "Confirm reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
