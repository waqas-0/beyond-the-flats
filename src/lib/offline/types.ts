// Local-first trip logging types. These mirror the Supabase `trips`/`catches`
// rows plus a few client-only sync fields. Records are created on-device with
// a client-generated UUID so the local id and the remote id are identical —
// that makes every push an idempotent upsert (safe to retry, never duplicates).

export type Species = "bonefish" | "tarpon" | "permit" | "other";

/** "dirty" = has local changes not yet pushed; "synced" = matches the server. */
export type SyncState = "dirty" | "synced";

export type LocalTrip = {
  id: string;
  title: string | null;
  client_name: string | null;
  anglers: number;
  permit_ref: string | null;
  location_note: string | null;
  notes: string | null;
  start_time: string; // ISO 8601
  end_time: string | null; // ISO 8601, null while the trip is active
  photo_url: string | null; // remote storage path, set after a photo syncs
  _sync: SyncState;
  _updatedAt: number; // epoch ms, for ordering / last-write-wins
};

export type LocalCatch = {
  id: string;
  trip_id: string;
  species: Species;
  count: number;
  logged_at: string; // ISO 8601
  _sync: SyncState;
  _updatedAt: number;
};

/** A captured photo, held as a Blob until it can be uploaded. */
export type LocalPhoto = {
  id: string;
  trip_id: string;
  blob: Blob;
  _sync: SyncState;
  _updatedAt: number;
};

export const SPECIES_LIST: { key: Species; label: string }[] = [
  { key: "bonefish", label: "Bonefish" },
  { key: "tarpon", label: "Tarpon" },
  { key: "permit", label: "Permit" },
  { key: "other", label: "Other" },
];
