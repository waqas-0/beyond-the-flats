"use client";

import { useEffect } from "react";

// Fires a single QR-scan log per browser session when the public profile is
// opened via a QR code (…?src=qr). No UI.
export function ScanLogger({ guideId }: { guideId: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("src") !== "qr") return;

    const key = `btf_scan_${guideId}`;
    if (sessionStorage.getItem(key)) return; // de-dupe within the session
    sessionStorage.setItem(key, "1");

    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guide_id: guideId }),
    }).catch(() => {});
  }, [guideId]);

  return null;
}
