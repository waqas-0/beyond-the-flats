import { MapPin } from "lucide-react";
import type { VerificationStatus } from "@/lib/supabase/types";
import { clsx } from "@/lib/clsx";

const PILL: Record<VerificationStatus, string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-brand-soft text-brand",
  rejected: "bg-danger-soft text-danger",
};

export function StatusPill({ status }: { status: VerificationStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        PILL[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function Initials({
  name,
  url,
  size = 40,
}: {
  name: string | null;
  url?: string | null;
  size?: number;
}) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={url}
        alt={name ?? "Guide"}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  const initials =
    (name ?? "?")
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-navy"
    >
      {initials}
    </span>
  );
}

export function IslandCell({ islands }: { islands: string[] }) {
  if (!islands.length) return <span className="text-muted">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-ink">
      <MapPin size={14} className="text-brand" /> {islands[0]}
      {islands.length > 1 && (
        <span className="text-muted"> +{islands.length - 1}</span>
      )}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-bg px-2.5 py-0.5 text-xs font-medium text-ink">
      {children}
    </span>
  );
}

/** Stat card matching the admin dashboard design. */
export function StatCard({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-card text-navy">
          {icon}
        </span>
        {note && <span className="text-xs font-semibold text-brand">{note}</span>}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold text-ink">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
