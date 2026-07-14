// UI-facing trip-logging mutations. Every action writes to IndexedDB first
// (instant, fully offline) then fires a best-effort sync. The active trip id is
// kept in localStorage so a reload mid-trip resumes where the guide left off.

import {
  deleteCatch,
  getCatchesForTrip,
  getPhotosForTrip,
  getTrip,
  saveCatch,
  savePhoto,
  saveTrip,
} from "./db";
import { refreshPending, syncNow } from "./sync";
import type { LocalCatch, LocalPhoto, LocalTrip, Species } from "./types";

const ACTIVE_KEY = "btf_active_trip_id";

export function getActiveTripId(): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}
function setActiveTripId(id: string | null): void {
  if (typeof localStorage === "undefined") return;
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}

export type StartTripInput = {
  clientName: string;
  anglers: number;
  permitRef: string;
  location: string;
};

export async function startTrip(info: StartTripInput): Promise<LocalTrip> {
  const trip: LocalTrip = {
    id: crypto.randomUUID(),
    title: null,
    client_name: info.clientName.trim() || null,
    anglers: info.anglers,
    permit_ref: info.permitRef.trim() || null,
    location_note: info.location.trim() || null,
    notes: null,
    start_time: new Date().toISOString(),
    end_time: null,
    photo_url: null,
    _sync: "dirty",
    _updatedAt: Date.now(),
  };
  await saveTrip(trip);
  setActiveTripId(trip.id);
  await refreshPending();
  void syncNow();
  return trip;
}

/** Set the running tally for one species. count<=0 removes the row entirely. */
export async function setCatchCount(
  tripId: string,
  species: Species,
  count: number,
): Promise<void> {
  const existing = (await getCatchesForTrip(tripId)).find((c) => c.species === species);

  if (count <= 0) {
    if (existing) await deleteCatch(existing.id);
    await refreshPending();
    return;
  }

  const record: LocalCatch = {
    id: existing?.id ?? crypto.randomUUID(),
    trip_id: tripId,
    species,
    count,
    logged_at: existing?.logged_at ?? new Date().toISOString(),
    _sync: "dirty",
    _updatedAt: Date.now(),
  };
  await saveCatch(record);
  await refreshPending();
  void syncNow();
}

export async function addPhoto(tripId: string, file: Blob): Promise<LocalPhoto> {
  const photo: LocalPhoto = {
    id: crypto.randomUUID(),
    trip_id: tripId,
    blob: file,
    _sync: "dirty",
    _updatedAt: Date.now(),
  };
  await savePhoto(photo);
  await refreshPending();
  void syncNow();
  return photo;
}

export async function endTrip(
  tripId: string,
  data: { title?: string | null; notes?: string | null },
): Promise<void> {
  const trip = await getTrip(tripId);
  if (!trip) return;
  await saveTrip({
    ...trip,
    title: data.title?.trim() || trip.title,
    notes: data.notes?.trim() || trip.notes,
    end_time: new Date().toISOString(),
    _sync: "dirty",
    _updatedAt: Date.now(),
  });
  setActiveTripId(null);
  await refreshPending();
  void syncNow();
}

export type ActiveTripBundle = {
  trip: LocalTrip;
  catches: LocalCatch[];
  photos: LocalPhoto[];
};

/** Load the in-progress trip (if any) to resume after a reload. */
export async function loadActiveTrip(): Promise<ActiveTripBundle | null> {
  const id = getActiveTripId();
  if (!id) return null;
  const trip = await getTrip(id);
  if (!trip || trip.end_time) {
    setActiveTripId(null);
    return null;
  }
  const [catches, photos] = await Promise.all([
    getCatchesForTrip(id),
    getPhotosForTrip(id),
  ]);
  return { trip, catches, photos };
}
