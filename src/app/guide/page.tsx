import Image from "next/image";
import {
  BadgeCheck,
  MapPin,
  Briefcase,
  Clock,
  Fish,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { guide } from "@/lib/data";
import { FEATURES } from "@/lib/features";

export const metadata: Metadata = { title: guide.name };

export default function VisitorGuideProfilePage() {
  const { stats } = guide;
  return (
    <AppShell homeIndicator={false}>
      <div className="flex justify-center px-5 pb-3 pt-1">
        <Logo size="sm" priority />
      </div>

      <article>
        {/* Hero photo */}
        <div className="px-5">
          <div className="relative h-52 overflow-hidden rounded-2xl">
            <Image
              src="/photos/captain-elias.png"
              alt={guide.name}
              fill
              className="object-cover"
              sizes="430px"
              priority
            />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              <BadgeCheck size={13} /> Verified Pro
            </span>
          </div>
        </div>

        {/* Identity */}
        <div className="px-5 pt-4">
          <h1 className="text-2xl font-bold text-ink">{guide.name}</h1>
          <p className="mt-1 text-sm font-medium text-brand">{guide.specialty}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <InfoPill
              icon={<Briefcase size={14} />}
              label="Experience"
              value={guide.experience}
            />
            <InfoPill
              icon={<MapPin size={14} />}
              label="Location"
              value={guide.location}
            />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">{guide.bio}</p>
        </div>

        {/* Stats */}
        <div className="px-5 pt-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl bg-navy p-5 text-white">
            {FEATURES.tripLogging && (
              <Stat label="Trips Logged" value={stats.tripsLogged} />
            )}
            {FEATURES.tripLogging && (
              <Stat label="Fish Released" value={stats.fishReleased} />
            )}
            <Stat label="Guide Rating" value={stats.rating} />
            <Stat label="Satisfaction" value={stats.satisfaction} />
          </div>
        </div>

        {/* Recent trips — parked with Week-4 trip logging (FEATURES.tripLogging) */}
        {FEATURES.tripLogging && (
        <section className="pt-7">
          <div className="flex items-end justify-between px-5">
            <div>
              <h2 className="text-lg font-bold text-ink">Recent Trips</h2>
              <p className="text-xs text-muted">Real-time reports</p>
            </div>
            <button className="flex items-center gap-1 text-xs font-semibold text-brand">
              VIEW ALL <ChevronRight size={14} />
            </button>
          </div>

          <div className="no-scrollbar mt-4 flex gap-4 overflow-x-auto px-5 pb-1">
            {guide.recentTrips.map((trip) => (
              <div
                key={trip.title}
                className="w-56 shrink-0 overflow-hidden rounded-2xl border border-line"
              >
                <div className="relative h-28 w-full">
                  <Image
                    src={trip.photo}
                    alt={trip.title}
                    fill
                    className="object-cover"
                    sizes="224px"
                  />
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {trip.date}
                  </p>
                  <h3 className="mt-0.5 text-sm font-bold text-ink">
                    {trip.title}
                  </h3>
                  <div className="mt-2 space-y-1 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} /> {trip.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={12} /> {trip.location}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-2 text-xs font-medium text-brand">
                    <Fish size={13} /> {trip.catch}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* Guide rating */}
        <section className="px-5 pt-8">
          <h2 className="text-lg font-bold uppercase tracking-wide text-ink">
            Guide Rating
          </h2>
          <p className="text-xs text-muted">
            Review other visitors feedbacks for this guide
          </p>

          <div className="mt-4 flex flex-col items-center">
            <span className="text-4xl font-bold text-ink">
              {guide.reviewScore}
            </span>
            <Stars value={guide.reviewScore} size={18} className="mt-1" />
          </div>

          <div className="mt-5 space-y-4">
            {guide.reviews.map((r) => (
              <div key={r.name} className="rounded-2xl border border-line p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.name}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted">
                      {r.date}
                    </p>
                  </div>
                  <Stars value={r.stars} size={13} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  &ldquo;{r.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-8 pt-7">
          <div className="rounded-2xl bg-linear-to-br from-navy to-brand p-6 text-white">
            <h3 className="text-xl font-bold">Ready to fish?</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/80">
              Book your expedition for the upcoming season. Capt. Elias fills up
              fast, especially during the spring migration.
            </p>
            <Button variant="whatsapp" className="mt-5 uppercase tracking-wide">
              <MessageCircle size={16} /> WhatsApp Captain
            </Button>
          </div>
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
      <p className="mt-0.5 text-sm font-semibold text-ink">{value}</p>
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
