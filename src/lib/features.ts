// Central feature flags.
//
// Flip a flag to enable/disable a whole feature across the app (UI entry points
// + data/sync). Kept in one place so a feature can be parked out of a
// deliverable without deleting its code — then re-enabled later by a one-line
// change.

export const FEATURES: {
  /**
   * Week-4 offline trip logging: the trip logger UI (`/guide/trips`,
   * `/guide/trips/active`), the "Trips" nav tab + dashboard "Start Trip" CTA,
   * the local IndexedDB store, and the sync engine that talks to
   * `/api/guide/{trips,catches}`.
   *
   * Excluded from the current deliverable, so it is hidden everywhere and the
   * sync engine makes no API calls (the `trips` table also still needs the
   * Week-4 column migration in `schema.sql` before this can be turned back on).
   * Set to `true` to bring the whole feature back.
   */
  tripLogging: boolean;
} = {
  tripLogging: false,
};
