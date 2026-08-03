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
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-5"
          onClick={close}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              disabled={busy}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-card disabled:opacity-60"
            >
              <X size={15} />
            </button>

            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
              <TriangleAlert size={22} />
            </span>

            <h3 className="mt-4 text-lg font-bold text-ink">Delete this guide?</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              <span className="font-semibold text-ink">{guideName}</span> and all
              of their data will be permanently removed. This can&apos;t be
              undone.
            </p>

            <div className="mt-5 text-left">
              <label
                htmlFor="delete-confirm"
                className="block text-xs text-muted"
              >
                Type{" "}
                <span className="rounded bg-danger-soft px-1.5 py-0.5 font-bold tracking-wide text-danger">
                  DELETE
                </span>{" "}
                to confirm
              </label>
              <input
                id="delete-confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                autoFocus
                disabled={busy}
                className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-ink outline-none focus:border-danger disabled:opacity-60"
              />
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-danger-soft px-4 py-2.5 text-left text-xs text-danger">
                {error}
              </p>
            )}

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={close}
                disabled={busy}
                className="flex-1 rounded-full bg-card py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-line disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={remove}
                disabled={!canDelete || busy}
                className="flex-1 rounded-full bg-danger py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:opacity-40"
              >
                {busy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
