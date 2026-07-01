"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export function ReviewModeration({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "reject">(null);

  async function act(kind: "approve" | "reject") {
    setBusy(kind);
    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: kind === "approve" ? "PATCH" : "DELETE",
    });
    if (!res.ok) {
      setBusy(null);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act("approve")}
        disabled={busy !== null}
        className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-60"
      >
        <Check size={16} /> {busy === "approve" ? "…" : "Approve"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={busy !== null}
        className="inline-flex items-center gap-1.5 rounded-full bg-danger-soft px-3.5 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-60"
      >
        <X size={16} /> {busy === "reject" ? "…" : "Reject"}
      </button>
    </div>
  );
}
