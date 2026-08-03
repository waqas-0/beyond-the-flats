"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, TriangleAlert, X } from "lucide-react";

// Permanently delete a guide. Irreversible and cascades to all of their data,
// so the admin has to type DELETE to confirm.
export function DeleteGuideButton({
  guideId,
  guideName,
}: {
  guideId: string;
  guideName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  async function remove() {
    if (!canDelete) return;
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/admin/guides/${guideId}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      setError(json.error ?? "Could not delete this guide.");
      return;
    }
    router.replace("/admin/directory");
    router.refresh();
  }

  function close() {
    if (busy) return;
    setOpen(false);
    setConfirmText("");
    setError(null);
  }

  return (
    <>
      <div className="mt-6 rounded-2xl border border-danger/30 bg-danger-soft p-5">
        <h3 className="flex items-center gap-2 text-base font-bold text-danger">
          <TriangleAlert size={18} /> Danger zone
        </h3>
        <p className="mt-1.5 text-sm text-muted">
          Permanently delete this guide and all of their data — profile, licence,
          photos, trips and reviews. This cannot be undone.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger/90"
        >
          <Trash2 size={16} /> Delete guide
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-5"
          onClick={close}
        >
          <div
            className="w-full max-w-[440px] rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold text-ink">Delete this guide?</h3>
              <button
                onClick={close}
                disabled={busy}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-muted disabled:opacity-60"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-muted">
              <span className="font-semibold text-ink">{guideName}</span> and all
              of their data will be permanently removed. Their phone number is
              freed up, so they can register again later if needed.
            </p>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-muted">
              Type DELETE to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              autoFocus
              disabled={busy}
              className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-danger disabled:opacity-60"
            />

            {error && (
              <p className="mt-3 rounded-xl bg-danger-soft px-4 py-2.5 text-sm text-danger">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={close}
                disabled={busy}
                className="flex-1 rounded-full bg-card py-3 text-sm font-semibold text-ink disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={remove}
                disabled={!canDelete || busy}
                className="flex-1 rounded-full bg-danger py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {busy ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
