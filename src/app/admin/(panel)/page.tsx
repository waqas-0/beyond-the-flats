import Link from "next/link";
import { ChevronRight, Inbox, User } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import type { Guide } from "@/lib/supabase/types";

// Application queue — pending guide applications awaiting verification.
// Server component: admin access is already enforced by the (panel) layout.
export const dynamic = "force-dynamic";

export default async function AdminQueuePage() {
  const service = createServiceClient();
  const { data: guides, error } = await service
    .from("guides")
    .select("*")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  const pending = (guides ?? []) as Guide[];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-ink">Applications</h1>
        <span className="text-sm font-semibold text-muted">
          {pending.length} pending
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        Review licences and approve or reject guide applications.
      </p>

      {error && (
        <p className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          Failed to load applications: {error.message}
        </p>
      )}

      {!error && pending.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-[20px] bg-white py-14 text-center">
          <Inbox size={40} className="text-faint" strokeWidth={1.6} />
          <p className="mt-3 text-base font-semibold text-ink">All caught up</p>
          <p className="mt-1 text-sm text-muted">
            No pending applications to review.
          </p>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {pending.map((g) => (
          <Link
            key={g.id}
            href={`/admin/guides/${g.id}`}
            className="flex items-center gap-4 rounded-[20px] bg-white p-4 transition-colors hover:bg-card"
          >
            {g.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={g.avatar_url}
                alt={g.full_name ?? "Guide"}
                className="h-14 w-14 shrink-0 rounded-full object-cover"
                width={56}
                height={56}
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-card">
                <User size={26} className="text-muted" strokeWidth={1.6} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-ink">
                {g.full_name ?? "Unnamed guide"}
              </p>
              <p className="truncate text-sm text-muted">{g.phone}</p>
              {!!g.islands.length && (
                <p className="mt-0.5 truncate text-xs text-muted">
                  🏝️ {g.islands.join(", ")}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-semibold text-navy">
                {g.license_url ? "Licence ✓" : "No licence"}
              </span>
              <span className="flex items-center text-xs text-muted">
                Review <ChevronRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
