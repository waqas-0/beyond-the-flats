// Sync engine — mirrors the local IndexedDB store to Supabase.
//
// Push order matters: photos first (so the trip row can carry its photo_url),
// then trips (the FK target), then catches. Any network/server failure leaves
// the record "dirty" so the next run retries it — pushes are idempotent upserts
// keyed by the client-generated UUID, so retries never duplicate.

import {
  countDirty,
  getAllCatches,
  getAllPhotos,
  getAllTrips,
  getTrip,
  hasIDB,
  saveCatch,
  savePhoto,
  saveTrip,
} from "./db";
import type { LocalCatch, LocalTrip } from "./types";
import { FEATURES } from "@/lib/features";

type Status = { online: boolean; syncing: boolean; pending: number };

// Gated by the Week-4 trip-logging feature flag. While it's off, the sync
// engine makes NO /api/guide/{trips,catches} calls from any page (including
// /admin, where OfflineSync also mounts) — which is what was returning 500
// ("column trips.title does not exist") before the Week-4 DB migration.
const TRIP_SYNC_ENABLED: boolean = FEATURES.tripLogging;

let status: Status = { online: true, syncing: false, pending: 0 };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function setStatus(patch: Partial<Status>) {
  status = { ...status, ...patch };
  emit();
}

export function getStatus(): Status {
  return status;
}
export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

function online(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

function toRemoteTrip(t: LocalTrip) {
  return {
    id: t.id,
    title: t.title,
    client_name: t.client_name,
    anglers: t.anglers,
    permit_ref: t.permit_ref,
    location_note: t.location_note,
    notes: t.notes,
    start_time: t.start_time,
    end_time: t.end_time,
    photo_url: t.photo_url,
  };
}

async function pushPhotos(): Promise<void> {
  for (const p of await getAllPhotos()) {
    if (p._sync === "synced") continue;
    const fd = new FormData();
    fd.append("trip_id", p.trip_id);
    fd.append("file", p.blob, `${p.id}.jpg`);
    const res = await fetch("/api/guide/trips/photo", { method: "POST", body: fd });
    if (!res.ok) throw new Error(`photo upload failed: ${res.status}`);
    const { path } = await res.json();
    const trip = await getTrip(p.trip_id);
    if (trip) {
      // Trip now needs to push its photo_url — mark it dirty for pushTrips().
      await saveTrip({ ...trip, photo_url: path, _sync: "dirty", _updatedAt: Date.now() });
    }
    // Keep the blob locally for instant display; just flag it synced.
    await savePhoto({ ...p, _sync: "synced" });
  }
}

async function pushTrips(): Promise<void> {
  for (const t of await getAllTrips()) {
    if (t._sync === "synced") continue;
    const res = await fetch("/api/guide/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toRemoteTrip(t)),
    });
    if (!res.ok) throw new Error(`trip push failed: ${res.status}`);
    await saveTrip({ ...t, _sync: "synced" });
  }
}

async function pushCatches(): Promise<void> {
  for (const c of await getAllCatches()) {
    if (c._sync === "synced") continue;
    const res = await fetch("/api/guide/catches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: c.id,
        trip_id: c.trip_id,
        species: c.species,
        count: c.count,
        logged_at: c.logged_at,
      }),
    });
    if (!res.ok) throw new Error(`catch push failed: ${res.status}`);
    await saveCatch({ ...c, _sync: "synced" });
  }
}

let inFlight: Promise<void> | null = null;

/** Push all dirty records. De-duplicated: concurrent calls share one run. */
export function syncNow(): Promise<void> {
  if (!TRIP_SYNC_ENABLED) return Promise.resolve();
  if (inFlight) return inFlight;
  inFlight = run().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

async function run(): Promise<void> {
  if (!hasIDB()) return;
  if (!online()) {
    setStatus({ online: false, pending: await safeCount() });
    return;
  }
  setStatus({ syncing: true, online: true });
  try {
    await pushPhotos();
    await pushTrips();
    await pushCatches();
  } catch {
    // Leave remaining records dirty; a later trigger retries them.
    setStatus({ online: online() });
  } finally {
    setStatus({ syncing: false, pending: await safeCount() });
  }
}

async function safeCount(): Promise<number> {
  try {
    return await countDirty();
  } catch {
    return status.pending;
  }
}

/** Pull server trips/catches into the local store (fresh device / cleared cache). */
export async function hydrateFromServer(): Promise<void> {
  if (!TRIP_SYNC_ENABLED) return;
  if (!hasIDB() || !online()) return;
  try {
    const res = await fetch("/api/guide/trips");
    if (!res.ok) return;
    const { trips = [], catches = [] } = await res.json();

    const localTrips = await getAllTrips();
    const dirtyTripIds = new Set(localTrips.filter((t) => t._sync !== "synced").map((t) => t.id));
    for (const t of trips as LocalTrip[]) {
      if (dirtyTripIds.has(t.id)) continue; // never clobber un-pushed local edits
      await saveTrip({ ...t, _sync: "synced", _updatedAt: Date.now() });
    }

    const localCatches = await getAllCatches();
    const dirtyCatchIds = new Set(localCatches.filter((c) => c._sync !== "synced").map((c) => c.id));
    for (const c of catches as LocalCatch[]) {
      if (dirtyCatchIds.has(c.id)) continue;
      await saveCatch({ ...c, _sync: "synced", _updatedAt: Date.now() });
    }
  } catch {
    // Hydration is best-effort; the local store remains usable offline.
  }
}

let inited = false;

/** Wire reconnect/visibility triggers and run an initial hydrate + sync. */
export function initSync(): void {
  if (!TRIP_SYNC_ENABLED) return;
  if (inited || typeof window === "undefined") return;
  inited = true;

  setStatus({ online: online() });
  window.addEventListener("online", () => {
    setStatus({ online: true });
    void syncNow();
  });
  window.addEventListener("offline", () => setStatus({ online: false }));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && online()) void syncNow();
  });

  void safeCount().then((pending) => setStatus({ pending }));
  void hydrateFromServer().then(() => syncNow());
}

/** Recompute the pending badge (call after a local mutation). */
export async function refreshPending(): Promise<void> {
  setStatus({ pending: await safeCount() });
}
