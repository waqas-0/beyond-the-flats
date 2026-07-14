"use client";

import { useSyncExternalStore } from "react";
import { getStatus, subscribe } from "./sync";

/** Reactive sync status: { online, syncing, pending }. */
export function useSyncStatus() {
  return useSyncExternalStore(subscribe, getStatus, getStatus);
}
