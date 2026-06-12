import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Clock,
  MapPin,
  Fish,
  MoreVertical,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { tripHistory } from "@/lib/data";

export const metadata: Metadata = { title: "Trip History" };

export default function TripHistoryPage() {
  return (
    <AppShell homeIndicator={false}>
      <header className="flex items-center justify-between px-5 pb-3 pt-2">
        <h1 className="text-[28px] font-bold text-ink">Trip History</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line text-navy">
          <Bell size={22} strokeWidth={1.8} />
        </button>
      </header>

      <div className="flex flex-1 flex-col px-5 pb-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm font-medium text-ink">
          <CalendarDays size={16} className="text-muted" /> 21 Apr 2026 - 23 Apr
          2026
        </div>

        <div className="relative mt-4 space-y-5">
          {tripHistory.map((t) => (
            <article
              key={t.title}
              className="overflow-hidden rounded-[20px] border border-line bg-bg"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={t.photo}
                  alt={t.title}
                  fill
                  className="object-cover"
                  sizes="430px"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {t.date}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-ink">{t.title}</h2>
                  </div>
                  <MoreVertical size={20} className="text-muted" />
                </div>
                <div className="mt-3 flex items-center gap-5 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} /> {t.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} /> {t.location}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-sm font-medium text-brand">
                  <Fish size={16} /> {t.catch}
                </div>
              </div>
            </article>
          ))}

          <Link
            href="/guide/trips/active"
            className="absolute -top-16 right-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white shadow-lg"
            aria-label="Start a trip"
          >
            <Plus size={24} />
          </Link>
        </div>

        {/* Off-grid reliability */}
        <div className="mt-5 rounded-[20px] bg-navy p-6 text-white">
          <h3 className="text-xl font-bold">Off-Grid Reliability</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Your logs are automatically cached when offline. Sync resumes
            seamlessly as soon as you reach a cellular or Wi-Fi signal at the
            marina.
          </p>
          <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4 text-sm text-white/80">
            <ShieldCheck size={18} className="text-accent" /> Data integrity
            guaranteed.
          </div>
        </div>
      </div>

      <BottomNav active="trips" />
    </AppShell>
  );
}
