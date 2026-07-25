"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Pencil } from "lucide-react";

// Admin-transcribed DMR licence number — read from the reviewed licence
// document. This is the legal verification signal shown on the guide's
// public profile, so it's admin-entered, not guide self-reported.
export function LicenseNumberField({
  guideId,
  licenseNumber,
}: {
  guideId: string;
  licenseNumber: string | null;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(licenseNumber ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    setBusy(true);
    const res = await fetch(`/api/admin/guides/${guideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "license_number", value }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          <BadgeCheck size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">DMR Licence Number</p>
          {editing ? (
            <div className="mt-1.5 flex gap-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. FF-2026-0003"
                autoFocus
                className="min-w-0 flex-1 rounded-lg border border-line bg-bg px-2.5 py-1.5 text-sm text-ink outline-none focus:border-brand"
              />
              <button
                onClick={save}
                disabled={busy}
                className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => {
                  setValue(licenseNumber ?? "");
                  setEditing(false);
                }}
                disabled={busy}
                className="shrink-0 rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-ink disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="mt-0.5 flex items-center gap-1.5 text-xs text-muted hover:text-ink"
            >
              {licenseNumber ?? "Not set — click to add"}
              <Pencil size={12} />
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
