"use client";

import { useEffect } from "react";

/** Registers /sw.js once the page is interactive. Safe no-op in SSR. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // SW registration failure is non-fatal — app works without it.
        });
    }
  }, []);

  return null;
}
