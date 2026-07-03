import Link from "next/link";
import { Users, ClipboardList, BadgeCheck, Sailboat, Fish, QrCode } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import type { Guide } from "@/lib/supabase/types";
import { StatCard, StatusPill, Initials, IslandCell } from "./ui";

export const dynamic = "force-dynamic";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const service = createServiceClient();

  const cnt = async (
    table: string,
    build?: (q: ReturnType<ReturnType<typeof service.from>["select"]>) => unknown,
  ) => {
    let q = service.from(table).select("*", { count: "exact", head: true });
    if (build) q = build(q) as typeof q;
    const { count } = await q;
    return count ?? 0;
  };

  const [total, pending, approved, trips, scans] = await Promise.all([
    cnt("guides"),
    cnt("guides", (q) => q.eq("verification_status", "pending")),
    cnt("guides", (q) => q.eq("verification_status", "approved")),
    cnt("trips"),
    cnt("qr_scans"),
  ]);
  const { data: catchRows } = await service.from("catches").select("count");
  const fish = ((catchRows ?? []) as { count: number | null }[]).reduce(
    (s, c) => s + (c.count ?? 0),
    0,
  );
  const approvalRate = total ? Math.round((approved / total) * 100) : 0;

  const { data: recentRows } = await service
    .from("guides")
    .select("id, full_name, avatar_url, islands, verification_status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  const recent = (recentRows ?? []) as Guide[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Monitor guide activity, verification requests, and platform performance.
      </p>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={<Users size={18} />} label="Total Guides" value={total} />
        <StatCard
          icon={<ClipboardList size={18} />}
          label="Pending Applications"
          value={pending}
          note={pending ? "Immediate Action" : undefined}
        />
        <StatCard
          icon={<BadgeCheck size={18} />}
          label="Approved Guides"
          value={approved}
          note={`${approvalRate}% Approval Rate`}
        />
        <StatCard icon={<Sailboat size={18} />} label="Trips Logged" value={trips} />
        <StatCard icon={<Fish size={18} />} label="Fish Released" value={fish} />
        <StatCard icon={<QrCode size={18} />} label="QR Scans" value={scans} />
      </div>

      {/* Recent applications */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-lg font-bold text-ink">Recent Applications</h2>
            <p className="text-sm text-muted">
              Review and manage incoming guide registrations.
            </p>
          </div>
          <Link
            href="/admin/applications"
            className="shrink-0 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-line bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Guide Name</th>
                <th className="px-5 py-3">Island</th>
                <th className="px-5 py-3">Submission Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((g) => (
                <tr key={g.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Initials name={g.full_name} url={g.avatar_url} size={36} />
                      <span className="font-semibold text-ink">
                        {g.full_name ?? "Unnamed guide"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <IslandCell islands={g.islands} />
                  </td>
                  <td className="px-5 py-4 text-muted">{fmtDate(g.created_at)}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={g.verification_status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/guides/${g.id}`}
                      className="text-sm font-semibold text-navy hover:underline"
                    >
                      {g.verification_status === "pending" ? "Review" : "View Details"}
                    </Link>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted">
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
