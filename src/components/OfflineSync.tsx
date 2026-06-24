"use client";

import { useEffect } from "react";
import { initSync } from "@/lib/offline/sync";

/** Mounts once in the root layout: wires reconnect/visibility sync triggers. */
export function OfflineSync() {
  useEffect(() => {
    initSync();
  }, []);
  return null;
}
