"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Clock, MapPin, Fish, Plus, ShieldCheck, Sailboat } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { SyncStatus } from "@/components/SyncStatus";
import { getAllCatches, getAllPhotos, getAllTrips } from "@/lib/offline/db";
import { SPECIES_LIST, type LocalCatch, type LocalTrip } from "@/lib/offline/types";

const LABEL = Object.fromEntries(SPECIES_LIST.map((s) => [s.key, s.label])) as Record<
  string,
  string
>;

function fmtDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

function fmtDuration(start: string, end: string | null) {
  if (!end) return "In progress";
  const s = Math.max(0, Math.floor((Date.parse(end) - Date.parse(start)) / 1000));
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}m`;
}

function catchSummary(cs: LocalCatch[]) {
  const txt = cs
    .filter((c) => c.count > 0)
    .map((c) => `${c.count} ${LABEL[c.species] ?? c.species}`)
    .join(", ");
  return txt || "No catches logged";
}

type TripVM = LocalTrip & { _catches: LocalCatch[]; _photo: string | null };

export default function TripHistoryPage() {
  const [items, setItems] = useState<TripVM[]>([]);
  const [loading, setLoading] = useState(true);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([getAllTrips(), getAllCatches(), getAllPhotos()])
      .then(([trips, catches, photos]) => {
        if (!active) return;
        const byTrip = new Map<string, LocalCatch[]>();
        for (const c of catches) {
          const list = byTrip.get(c.trip_id) ?? [];
          list.push(c);
          byTrip.set(c.trip_id, list);
        }
        const photoByTrip = new Map<string, Blob>();
        for (const p of photos) if (!photoByTrip.has(p.trip_id)) photoByTrip.set(p.trip_id, p.blob);

        const urls: string[] = [];
        const vm: TripVM[] = trips.map((t) => {
          const blob = photoByTrip.get(t.id);
          let photo: string | null = null;
          if (blob) {
            photo = URL.createObjectURL(blob);
            urls.push(photo);
          }
          return { ...t, _catches: byTrip.get(t.id) ?? [], _photo: photo };
        });
        urlsRef.current = urls;
        setItems(vm);
        setLoading(false);
      })
      .catch(() => active && setLoading(false));

    return () => {
      active = false;
      for (const u of urlsRef.current) URL.revokeObjectURL(u);
    };
  }, []);

  return (
    <AppShell homeIndicator={false}>
      <header className="flex items-center justify-between px-5 pb-3 pt-2">
        <h1 className="text-[28px] font-bold text-ink">Trip History</h1>
        <div className="flex items-center gap-2">
          <SyncStatus />
          <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line text-navy">
            <Bell size={22} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-5 pb-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? "Loading…" : `${items.length} ${items.length === 1 ? "trip" : "trips"} logged`}
          </p>
          <Link
            href="/guide/trips/active"
            className="flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={16} /> New Trip
          </Link>
        </div>

        {!loading && items.length === 0 && (
          <div className="mt-10 flex flex-col items-center rounded-[20px] bg-white py-14 text-center">
            <Sailboat size={40} className="text-faint" strokeWidth={1.6} />
            <p className="mt-3 text-base font-semibold text-ink">No trips yet</p>
            <p className="mt-1 max-w-[16rem] text-sm text-muted">
              Tap “New Trip” to start logging. Everything saves on-device and syncs when you’re back online.
            </p>
          </div>
        )}

        <div className="mt-4 space-y-5">
          {items.map((t) => (
            <article
              key={t.id}
              className="overflow-hidden rounded-[20px] border border-line bg-bg"
            >
              {t._photo && (
                <div className="relative h-48 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t._photo} alt={t.title ?? "Trip"} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {fmtDate(t.start_time)}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-ink">
                      {t.title || t.location_note || "Untitled trip"}
                    </h2>
                  </div>
                  {t._sync !== "synced" && (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-gold">
                      Unsynced
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-5 text-sm text-muted">
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} /> {fmtDuration(t.start_time, t.end_time)}
                  </span>
                  {t.location_note && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} /> {t.location_note}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-sm font-medium text-brand">
                  <Fish size={16} /> {catchSummary(t._catches)}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Off-grid reliability */}
        <div className="mt-5 rounded-[20px] bg-navy p-6 text-white">
          <h3 className="text-xl font-bold">Off-Grid Reliability</h3>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Your logs are saved on this device the moment you tap. Sync resumes
            automatically as soon as you reach a cellular or Wi-Fi signal at the
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
