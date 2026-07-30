import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";

export type ActivityItem = {
  id: string;
  photo_url: string;
  created_at: string;
  guide_id: string;
  guide_name: string | null;
  island: string | null;
};

const PREVIEW_COUNT = 3;

const ISLAND_SHORT: Record<string, string> = {
  "Nassau (New Providence)": "Nassau",
};

function shortIsland(island: string | null): string | null {
  if (!island) return null;
  return ISLAND_SHORT[island] ?? island;
}

function timeAgo(iso: string): string {
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - Date.parse(iso)) / 1000),
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 14) return "1w ago";
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return "1y+ ago";
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">On the water</h2>
        <p className="text-xs font-medium text-muted">Recent catches</p>
      </div>

      <div className="mt-3.5 space-y-2.5">
        {items.slice(0, PREVIEW_COUNT).map((item) => {
          const island = shortIsland(item.island);
          return (
            <Link
              key={item.id}
              href={`/g/${item.guide_id}`}
              className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photo_url}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">
                  {item.guide_name ?? "Verified Guide"}
                </p>
                {island && (
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{island}</span>
                  </p>
                )}
                <p className="mt-1 text-[11px] font-semibold text-ocean">
                  {timeAgo(item.created_at)}
                </p>
              </div>

              <ChevronRight size={18} className="shrink-0 text-faint" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
