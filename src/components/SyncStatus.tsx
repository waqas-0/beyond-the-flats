"use client";

import { Check, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useSyncStatus } from "@/lib/offline/useSync";
import { clsx } from "@/lib/clsx";

/** Small pill showing offline / syncing / pending / synced state. */
export function SyncStatus({ className }: { className?: string }) {
  const { online, syncing, pending } = useSyncStatus();

  let icon: React.ReactNode;
  let text: string;
  let tone: string;

  if (!online) {
    icon = <CloudOff size={14} />;
    text = pending ? `Offline · ${pending} queued` : "Offline";
    tone = "bg-gold/15 text-gold";
  } else if (syncing) {
    icon = <RefreshCw size={14} className="animate-spin" />;
    text = "Syncing…";
    tone = "bg-navy/10 text-navy";
  } else if (pending) {
    icon = <Cloud size={14} />;
    text = `${pending} to sync`;
    tone = "bg-navy/10 text-navy";
  } else {
    icon = <Check size={14} />;
    text = "Synced";
    tone = "bg-brand-soft text-brand";
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone,
        className,
      )}
    >
      {icon}
      {text}
    </span>
  );
}
