// Minimal promise-based IndexedDB wrapper — no external dependency.
// This is the on-device source of truth for trip logging: the UI reads and
// writes here synchronously-ish (instant, fully offline), and the sync engine
// (sync.ts) mirrors it to Supabase when a connection is available.

import type { LocalCatch, LocalPhoto, LocalTrip } from "./types";

const DB_NAME = "btf-trips";
const DB_VERSION = 1;
const STORE_TRIPS = "trips";
const STORE_CATCHES = "catches";
const STORE_PHOTOS = "photos";

function hasIDB(): boolean {
  return typeof indexedDB !== "undefined";
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!hasIDB()) return Promise.reject(new Error("IndexedDB unavailable"));
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_TRIPS)) {
        db.createObjectStore(STORE_TRIPS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_CATCHES)) {
        const s = db.createObjectStore(STORE_CATCHES, { keyPath: "id" });
        s.createIndex("trip_id", "trip_id", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        const s = db.createObjectStore(STORE_PHOTOS, { keyPath: "id" });
        s.createIndex("trip_id", "trip_id", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(
  db: IDBDatabase,
  store: string,
  mode: IDBTransactionMode,
): IDBObjectStore {
  return db.transaction(store, mode).objectStore(store);
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function putRecord<T>(store: string, value: T): Promise<void> {
  const db = await openDB();
  await reqToPromise(tx(db, store, "readwrite").put(value));
}

async function getAllRecords<T>(store: string): Promise<T[]> {
  const db = await openDB();
  return reqToPromise(tx(db, store, "readonly").getAll() as IDBRequest<T[]>);
}

async function getByIndex<T>(
  store: string,
  index: string,
  key: IDBValidKey,
): Promise<T[]> {
  const db = await openDB();
  return reqToPromise(
    tx(db, store, "readonly").index(index).getAll(key) as IDBRequest<T[]>,
  );
}

// ── Trips ──────────────────────────────────────────────────────
export async function saveTrip(trip: LocalTrip): Promise<void> {
  return putRecord(STORE_TRIPS, trip);
}

export async function getTrip(id: string): Promise<LocalTrip | undefined> {
  const db = await openDB();
  return reqToPromise(
    tx(db, STORE_TRIPS, "readonly").get(id) as IDBRequest<LocalTrip | undefined>,
  );
}

export async function getAllTrips(): Promise<LocalTrip[]> {
  const trips = await getAllRecords<LocalTrip>(STORE_TRIPS);
  // Most recent first (by start time).
  return trips.sort((a, b) => b.start_time.localeCompare(a.start_time));
}

// ── Catches ────────────────────────────────────────────────────
export async function saveCatch(c: LocalCatch): Promise<void> {
  return putRecord(STORE_CATCHES, c);
}

export async function getCatchesForTrip(tripId: string): Promise<LocalCatch[]> {
  return getByIndex<LocalCatch>(STORE_CATCHES, "trip_id", tripId);
}

export async function deleteCatch(id: string): Promise<void> {
  const db = await openDB();
  await reqToPromise(tx(db, STORE_CATCHES, "readwrite").delete(id));
}

export async function getAllCatches(): Promise<LocalCatch[]> {
  return getAllRecords<LocalCatch>(STORE_CATCHES);
}

// ── Photos ─────────────────────────────────────────────────────
export async function savePhoto(p: LocalPhoto): Promise<void> {
  return putRecord(STORE_PHOTOS, p);
}

export async function getPhotosForTrip(tripId: string): Promise<LocalPhoto[]> {
  return getByIndex<LocalPhoto>(STORE_PHOTOS, "trip_id", tripId);
}

export async function getAllPhotos(): Promise<LocalPhoto[]> {
  return getAllRecords<LocalPhoto>(STORE_PHOTOS);
}

// ── Sync bookkeeping ───────────────────────────────────────────
export async function countDirty(): Promise<number> {
  const [trips, catches, photos] = await Promise.all([
    getAllRecords<LocalTrip>(STORE_TRIPS),
    getAllRecords<LocalCatch>(STORE_CATCHES),
    getAllRecords<LocalPhoto>(STORE_PHOTOS),
  ]);
  const dirty = (xs: { _sync: string }[]) => xs.filter((x) => x._sync !== "synced").length;
  return dirty(trips) + dirty(catches) + dirty(photos);
}

export { hasIDB };
