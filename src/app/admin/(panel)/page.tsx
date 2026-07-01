import Link from "next/link";
import { ChevronRight, Inbox, MapPin, User } from "lucide-react";
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
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Applications</h1>
          <p className="mt-1 text-sm text-muted">
            Review licences and approve or reject guide applications.
          </p>
        </div>
        <span className="rounded-full bg-navy/10 px-3.5 py-1.5 text-sm font-semibold text-navy">
          {pending.length} pending
        </span>
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          Failed to load applications: {error.message}
        </p>
      )}

      {!error && pending.length === 0 && (
        <div className="mt-8 flex flex-col items-center rounded-[20px] border border-line bg-white py-16 text-center">
          <Inbox size={44} className="text-faint" strokeWidth={1.6} />
          <p className="mt-4 text-base font-semibold text-ink">All caught up</p>
          <p className="mt-1 text-sm text-muted">
            No pending applications to review.
          </p>
        </div>
      )}

      {/* Responsive grid: 1 col mobile → 2 (md) → 3 (xl) */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pending.map((g) => (
          <Link
            key={g.id}
            href={`/admin/guides/${g.id}`}
            className="group flex flex-col rounded-[20px] border border-line bg-white p-5 transition-all hover:border-brand/40 hover:shadow-md"
          >
            <div className="flex items-center gap-4">
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
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  g.license_url
                    ? "bg-brand-soft text-brand"
                    : "bg-danger-soft text-danger"
                }`}
              >
                {g.license_url ? "Licence ✓" : "No licence"}
              </span>
            </div>

            {!!g.islands.length && (
              <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-muted">
                <MapPin size={13} className="shrink-0" /> {g.islands.join(", ")}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm font-semibold text-brand">
              Review application
              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
