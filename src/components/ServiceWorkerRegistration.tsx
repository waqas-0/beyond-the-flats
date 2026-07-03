"use client";

import { useEffect } from "react";

/** Registers /sw.js in production. In development it unregisters any existing
 *  service worker so stale cached CSS/JS is never served (which breaks hot
 *  reloads and makes the app look outdated). Safe no-op in SSR. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      if (typeof caches !== "undefined") {
        caches
          .keys()
          .then((keys) => keys.forEach((k) => caches.delete(k)))
          .catch(() => {});
      }
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // SW registration failure is non-fatal — app works without it.
      });
  }, []);

  return null;
}
