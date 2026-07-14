import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Fish, Star, MapPin, Clock, Plus } from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { GuideHeader } from "@/components/GuideHeader";
import { Stars } from "@/components/ui/Stars";
import { createClient } from "@/lib/supabase/server";
import type { Guide, Review } from "@/lib/supabase/types";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function GuideDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/guide/signin");

  const { data: guideRow } = await supabase
    .from("guides")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const guide = guideRow as Guide | null;

  // Trips + catches (empty while trip logging is disabled — handled gracefully).
  const { data: tripRows } = await supabase
    .from("trips")
    .select("id, title, client_name, start_time, end_time, location_note")
    .eq("guide_id", user.id)
    .order("start_time", { ascending: false });
  const trips = tripRows ?? [];

  let fishReleased = 0;
  if (trips.length) {
    const { data: catchRows } = await supabase
      .from("catches")
      .select("count")
      .in(
        "trip_id",
        trips.map((t) => t.id),
      );
    fishReleased = (catchRows ?? []).reduce((s, c) => s + (c.count ?? 0), 0);
  }

  // Approved reviews power the rating.
  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("*")
    .eq("guide_id", user.id)
    .eq("approved", true)
    .order("created_at", { ascending: false });
  const reviews = (reviewRows ?? []) as Review[];
  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length
    : null;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todaysTrips = trips.filter(
    (t) => new Date(t.start_time) >= startOfToday && !t.end_time,
  );

  const firstName = guide?.full_name?.split(" ")[0] ?? "Guide";
  const verified = guide?.verification_status === "approved";

  return (
    <AppShell homeIndicator={false}>
      <GuideHeader
        name={guide?.full_name ?? "Your Profile"}
        avatarUrl={guide?.avatar_url ?? null}
        verified={verified}
        subtitle={guide?.phone ?? undefined}
      />

      <div className="flex flex-1 flex-col gap-9 px-4 pb-8 pt-4">
        <section>
          <h1 className="text-[28px] font-bold leading-8 text-ink">
            Hi, {firstName}
          </h1>
          <p className="mt-1 text-base text-muted">
            Here&apos;s how your season is shaping up.
          </p>
        </section>

        {/* Season performance */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Season Performance</h2>
          <StatCard
            icon={<CalendarDays size={18} className="text-navy" />}
            iconBg="bg-navy/10"
            value={String(trips.length)}
            label="Trips Completed"
          />
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Fish size={20} className="text-brand" />}
              iconBg="bg-brand-soft"
              value={String(fishReleased)}
              label="Fish Released"
              stacked
            />
            <StatCard
              icon={<Star size={18} className="text-danger" fill="currentColor" />}
              iconBg="bg-danger-soft"
              value={avgRating ? avgRating.toFixed(1) : "New"}
              label="Client Rating"
              stacked
            />
          </div>
        </section>

        {/* Today's trips — Week-4 trip logging (gated behind FEATURES.tripLogging) */}
        {FEATURES.tripLogging && (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Today&apos;s Trips</h2>
          {todaysTrips.length ? (
            <div className="space-y-3">
              {todaysTrips.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-line bg-bg p-4"
                >
                  <p className="text-base font-semibold text-ink">
                    {t.title || t.client_name || "Trip in progress"}
                  </p>
                  <div className="mt-2 flex items-center gap-5 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} /> {fmtTime(t.start_time)}
                    </span>
                    {t.location_note && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} /> {t.location_note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Link
              href="/guide/trips/active"
              className="flex items-center justify-between rounded-xl border border-dashed border-line bg-bg p-5 text-muted"
            >
              <span className="text-sm">No trips logged today.</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-brand">
                <Plus size={16} /> Log a trip
              </span>
            </Link>
          )}
        </section>
        )}

        {/* Ratings */}
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Ratings</h2>
          {reviews.length ? (
            <>
              <div className="flex items-center gap-4 rounded-xl border border-line bg-card p-5">
                <div className="text-center">
                  <p className="text-4xl font-bold text-ink">
                    {avgRating!.toFixed(1)}
                  </p>
                  <Stars value={avgRating!} size={14} className="mt-1" />
                </div>
                <p className="text-sm text-muted">
                  Based on {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </p>
              </div>
              <div className="space-y-3">
                {reviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="rounded-xl border border-line p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink">
                        {r.visitor_name}
                      </p>
                      <Stars value={r.stars} size={13} />
                    </div>
                    {r.body && (
                      <p className="mt-1.5 text-xs leading-relaxed text-muted">
                        &ldquo;{r.body}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-line bg-bg p-5 text-sm text-muted">
              No reviews yet. Share your QR code so clients can rate their trip.
            </div>
          )}
        </section>
      </div>

      <BottomNav active="dashboard" />
    </AppShell>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
  stacked,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  stacked?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-card p-6 shadow-sm ${
        stacked ? "" : "flex items-center gap-4"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </span>
      <div className={stacked ? "mt-3" : ""}>
        <p className="text-4xl tracking-tight text-ink">{value}</p>
        <p className="text-sm uppercase tracking-wide text-muted">{label}</p>
      </div>
    </div>
  );
}
