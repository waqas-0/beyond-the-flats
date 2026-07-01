import {
  Users,
  BadgeCheck,
  Clock,
  CircleAlert,
  Sailboat,
  Fish,
  QrCode,
  Star,
  MessageSquareQuote,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
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

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthIso = monthStart.toISOString();

  const [
    totalGuides,
    approved,
    pending,
    rejected,
    totalTrips,
    totalScans,
    scansThisMonth,
    totalReviews,
    pendingReviews,
  ] = await Promise.all([
    cnt("guides"),
    cnt("guides", (q) => q.eq("verification_status", "approved")),
    cnt("guides", (q) => q.eq("verification_status", "pending")),
    cnt("guides", (q) => q.eq("verification_status", "rejected")),
    cnt("trips"),
    cnt("qr_scans"),
    cnt("qr_scans", (q) => q.gte("scanned_at", monthIso)),
    cnt("reviews"),
    cnt("reviews", (q) => q.eq("approved", false)),
  ]);

  const { data: catchRows } = await service.from("catches").select("count");
  const fishReleased = ((catchRows ?? []) as { count: number | null }[]).reduce(
    (s, c) => s + (c.count ?? 0),
    0,
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Analytics</h1>
      <p className="mt-1 text-sm text-muted">Platform activity at a glance.</p>

      {/* Guides */}
      <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
        Guides
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={<Users size={18} />} value={totalGuides} label="Total" tone="navy" />
        <Metric icon={<BadgeCheck size={18} />} value={approved} label="Approved" tone="brand" />
        <Metric icon={<Clock size={18} />} value={pending} label="Pending" tone="gold" />
        <Metric icon={<CircleAlert size={18} />} value={rejected} label="Rejected" tone="danger" />
      </div>

      {/* Activity */}
      <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
        Activity
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={<Sailboat size={18} />} value={totalTrips} label="Trips Logged" tone="navy" />
        <Metric icon={<Fish size={18} />} value={fishReleased} label="Fish Released" tone="brand" />
        <Metric icon={<QrCode size={18} />} value={totalScans} label="QR Scans" tone="navy" />
        <Metric icon={<QrCode size={18} />} value={scansThisMonth} label="Scans (Month)" tone="brand" />
      </div>

      {/* Engagement */}
      <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
        Reviews
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={<Star size={18} />} value={totalReviews} label="Total Reviews" tone="navy" />
        <Metric
          icon={<MessageSquareQuote size={18} />}
          value={pendingReviews}
          label="Awaiting Moderation"
          tone="gold"
        />
      </div>

      {totalTrips === 0 && (
        <p className="mt-6 rounded-xl bg-card px-4 py-3 text-xs text-muted">
          Trip logging is not enabled in this build, so trip and fish counts stay
          at zero.
        </p>
      )}
    </div>
  );
}

const TONES: Record<string, string> = {
  navy: "bg-navy/10 text-navy",
  brand: "bg-brand-soft text-brand",
  gold: "bg-gold/15 text-gold",
  danger: "bg-danger-soft text-danger",
};

function Metric({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  tone: keyof typeof TONES | string;
}) {
  return (
    <div className="rounded-[20px] border border-line bg-white p-4">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONES[tone] ?? TONES.navy}`}
      >
        {icon}
      </span>
      <p className="mt-3 text-3xl font-bold text-ink">{value.toLocaleString()}</p>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
