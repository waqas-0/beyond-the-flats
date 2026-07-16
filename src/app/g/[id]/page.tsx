import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  MapPin,
  Ship,
  Clock,
  Fish,
  MessageSquareText,
  User,
  ShieldCheck,
  ExternalLink,
  Ticket,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { ScanLogger } from "@/components/ScanLogger";
import { ReviewForm } from "@/components/ReviewForm";
import { createClient } from "@/lib/supabase/server";
import { FEATURES } from "@/lib/features";
import type { Catch, Guide, Review, Trip } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const SPECIES_LABEL: Record<string, string> = {
  bonefish: "Bonefish",
  tarpon: "Tarpon",
  permit: "Permit",
  other: "Other",
};

// Official Go Outdoors Bahamas licensing portal — visitors buy their fishing
// permit here (day/weekly, pay by card), then send the receipt number to the guide.
const PERMIT_URL =
  "https://license.gooutdoorsbahamas.com/Licensing/CustomerLookup.aspx";

function fmtDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}
function fmtDuration(start: string, end: string | null) {
  if (!end) return null;
  const s = Math.max(0, Math.floor((Date.parse(end) - Date.parse(start)) / 1000));
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
}

export default async function PublicGuideProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Only approved guides have a public profile (RLS enforces this too).
  const { data: guideRow } = await supabase
    .from("guides")
    .select("*")
    .eq("id", id)
    .eq("verification_status", "approved")
    .maybeSingle();

  if (!guideRow) notFound();
  const guide = guideRow as Guide;

  const { data: tripRows } = await supabase
    .from("trips")
    .select("id, title, location_note, start_time, end_time")
    .eq("guide_id", id)
    .order("start_time", { ascending: false });
  const trips = (tripRows ?? []) as Pick<
    Trip,
    "id" | "title" | "location_note" | "start_time" | "end_time"
  >[];

  const tripIds = trips.map((t) => t.id);
  let catches: Pick<Catch, "trip_id" | "species" | "count">[] = [];
  if (tripIds.length) {
    const { data } = await supabase
      .from("catches")
      .select("trip_id, species, count")
      .in("trip_id", tripIds);
    catches = data ?? [];
  }

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("*")
    .eq("guide_id", id)
    .eq("approved", true)
    .order("created_at", { ascending: false });
  const reviews = (reviewRows ?? []) as Review[];

  // Stats
  const fishReleased = catches.reduce((sum, c) => sum + c.count, 0);
  const rating = reviews.length
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : null;

  // Catch summary per trip (for the recent-trips list)
  const catchesByTrip = new Map<string, string>();
  for (const t of trips) {
    const cs = catches.filter((c) => c.trip_id === t.id && c.count > 0);
    if (cs.length)
      catchesByTrip.set(
        t.id,
        cs.map((c) => `${c.count} ${SPECIES_LABEL[c.species] ?? c.species}`).join(", "),
      );
  }
  const recent = trips.slice(0, 5);
  const waDigits = guide.phone ? guide.phone.replace(/\D/g, "") : "";
  const waHref = waDigits ? `https://wa.me/${waDigits}` : undefined;
  const browseIsland = guide.islands[0];

  return (
    <AppShell homeIndicator={false}>
      <ScanLogger guideId={guide.id} />

      <div className="flex justify-center px-5 pb-3 pt-1">
        <Logo size="sm" priority />
      </div>

      <article>
        {/* Hero */}
        <div className="px-5">
          <div className="relative h-52 overflow-hidden rounded-2xl bg-linear-to-br from-navy to-brand">
            {guide.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={guide.avatar_url}
                alt={guide.full_name ?? "Guide"}
                className="h-full w-full object-cover"
              />
            )}
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              <BadgeCheck size={13} /> Verified Pro
            </span>
          </div>
        </div>

        {/* Identity */}
        <div className="px-5 pt-4">
          <h1 className="text-2xl font-bold text-ink">
            {guide.full_name ?? "Beyond The Flats Guide"}
          </h1>
          {!!guide.specialties.length && (
            <p className="mt-1 text-sm font-medium text-brand">
              {guide.specialties.join(", ")}
            </p>
          )}

          {guide.reef_ambassador && (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              <ShieldCheck size={14} /> Reef Ambassador Certified
            </span>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoPill
              icon={<Ship size={14} />}
              label="Boat"
              value={guide.boat_type ?? "—"}
            />
            <InfoPill
              icon={<MapPin size={14} />}
              label="Islands"
              value={guide.islands.join(", ") || "—"}
            />
          </div>

          {guide.bio && (
            <p className="mt-4 text-sm leading-relaxed text-muted">{guide.bio}</p>
          )}
        </div>

        {/* Stats */}
        <div className="px-5 pt-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl bg-navy p-5 text-white">
            {FEATURES.tripLogging && (
              <Stat label="Trips Logged" value={String(trips.length)} />
            )}
            {FEATURES.tripLogging && (
              <Stat label="Fish Released" value={String(fishReleased)} />
            )}
            <Stat
              label="Years Guiding"
              value={guide.years_experience != null ? String(guide.years_experience) : "—"}
            />
            <Stat label="Guide Rating" value={rating ?? "New"} />
          </div>
        </div>

        {/* Recent trips — parked with Week-4 trip logging (FEATURES.tripLogging) */}
        {FEATURES.tripLogging && recent.length > 0 && (
          <section className="px-5 pt-7">
            <h2 className="text-lg font-bold text-ink">Recent Trips</h2>
            <p className="text-xs text-muted">Real-time reports</p>
            <div className="mt-4 space-y-3">
              {recent.map((t) => {
                const dur = fmtDuration(t.start_time, t.end_time);
                return (
                  <div key={t.id} className="rounded-2xl border border-line p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                      {fmtDate(t.start_time)}
                    </p>
                    <h3 className="mt-0.5 text-sm font-bold text-ink">
                      {t.title || t.location_note || "Flats trip"}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      {dur && (
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} /> {dur}
                        </span>
                      )}
                      {t.location_note && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} /> {t.location_note}
                        </span>
                      )}
                    </div>
                    {catchesByTrip.get(t.id) && (
                      <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-2 text-xs font-medium text-brand">
                        <Fish size={13} /> {catchesByTrip.get(t.id)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="px-5 pt-8">
            <h2 className="text-lg font-bold uppercase tracking-wide text-ink">
              Guide Rating
            </h2>
            <div className="mt-4 flex flex-col items-center">
              <span className="text-4xl font-bold text-ink">{rating}</span>
              <Stars value={Number(rating)} size={18} className="mt-1" />
            </div>
            <div className="mt-5 space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">{r.visitor_name}</p>
                      <p className="text-[10px] uppercase tracking-wide text-muted">
                        {fmtDate(r.created_at)}
                      </p>
                    </div>
                    <Stars value={r.stars} size={13} />
                  </div>
                  {r.body && (
                    <p className="mt-2 text-xs leading-relaxed text-muted">
                      &ldquo;{r.body}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Leave a review */}
        <section className="px-5 pt-8">
          <ReviewForm guideId={guide.id} />
        </section>

        {/* CTA */}
        <section className="px-5 pt-7">
          <div className="rounded-2xl bg-linear-to-br from-navy to-brand p-6 text-white">
            <h3 className="text-xl font-bold">Ready to fish?</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Message {guide.full_name?.split(" ")[0] ?? "this guide"} to plan your
              next expedition on the flats.
            </p>
            {waHref ? (
              <Button href={waHref} variant="brand" className="mt-5 uppercase tracking-wide">
                <MessageSquareText size={16} /> Message this guide
              </Button>
            ) : (
              <div className="mt-5 flex items-center gap-2 text-sm text-white/70">
                <User size={16} /> Contact unavailable
              </div>
            )}
            {guide.website_url && (
              <a
                href={guide.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white underline-offset-2 hover:underline"
              >
                Visit my website <ExternalLink size={14} />
              </a>
            )}
          </div>
        </section>

        {/* Permit prompt + browse other guides */}
        <section className="space-y-5 px-5 pb-8 pt-5">
          <div className="rounded-2xl border border-line bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Ticket size={18} />
              </span>
              <div>
                <p className="text-sm text-ink">
                  New to fishing the Bahamas flats? Get your permit before you
                  hit the water — quick and easy online.
                </p>
                <a
                  href={PERMIT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand"
                >
                  Get your fishing permit <ExternalLink size={14} />
                </a>
              </div>
            </div>
            <p className="mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">
              Got your permit? Great — send your receipt number to your guide on
              WhatsApp before your trip so they can confirm you&apos;re good to go.
            </p>
          </div>

          {browseIsland && (
            <div className="text-center">
              <Link
                href={`/guides?island=${encodeURIComponent(browseIsland)}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink"
              >
                Browse other guides on {browseIsland}
                <ChevronRight size={15} />
              </Link>
            </div>
          )}
        </section>
      </article>

      <SiteFooter />
    </AppShell>
  );
}

function InfoPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2.5">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
        {icon} {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-accent">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
