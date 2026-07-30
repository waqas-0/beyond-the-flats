"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, BadgeCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export type GuideCard = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  islands: string[];
  specialties: string[];
};

const PREVIEW_COUNT = 4;

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  const initials = (name ?? "")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-card text-sm font-bold text-navy">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        initials || "?"
      )}
    </div>
  );
}

export function GuideList({
  guides,
  island,
}: {
  guides: GuideCard[];
  island?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? guides : guides.slice(0, PREVIEW_COUNT);
  const hasMore = guides.length > PREVIEW_COUNT;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Verified Guides</h2>
        <p className="text-xs font-medium text-muted">
          {guides.length} {guides.length === 1 ? "guide" : "guides"}
          {island ? " on this island" : ""}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {visible.map((g) => (
          <Link
            key={g.id}
            href={`/g/${g.id}`}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5"
          >
            <Avatar name={g.full_name} url={g.avatar_url} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink">
                {g.full_name ?? "Beyond The Flats Guide"}
                <BadgeCheck size={14} className="shrink-0 text-ocean" />
              </p>
              {!!g.specialties.length && (
                <p className="mt-0.5 truncate text-xs font-medium text-ocean">
                  {g.specialties.join(", ")}
                </p>
              )}
              {!!g.islands.length && (
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted">
                  <MapPin size={12} /> {g.islands.join(", ")}
                </p>
              )}
            </div>
            <ChevronRight size={18} className="shrink-0 text-faint" />
          </Link>
        ))}

        {guides.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">
            No verified guides{island ? ` on ${island}` : ""} yet.
          </div>
        )}
      </div>

      {hasMore && !showAll && (
        <Button
          variant="secondary"
          className="mt-5"
          onClick={() => setShowAll(true)}
        >
          See all {guides.length} guides
        </Button>
      )}
    </div>
  );
}
