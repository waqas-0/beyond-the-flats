import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BadgeCheck, ChevronRight, Ticket } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import { clsx } from "@/lib/clsx";
import type { Guide } from "@/lib/supabase/types";
import { ActivityFeed, type ActivityItem } from "./ActivityFeed";
import { GuideList } from "./GuideList";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Browse Guides" };

type CatchPhotoRow = {
  id: string;
  photo_url: string;
  created_at: string;
  guide_id: string;
  guides:
    | { full_name: string | null; islands: string[] }
    | { full_name: string | null; islands: string[] }[]
    | null;
};

/** Display label → stored island value used in guide profiles. */
const ISLAND_FILTERS: { label: string; value: string | null }[] = [
  { label: "All Islands", value: null },
  { label: "Nassau", value: "Nassau (New Providence)" },
  { label: "Andros", value: "Andros" },
  { label: "Abaco", value: "Abaco" },
  { label: "Exuma", value: "Exuma" },
  { label: "Eleuthera", value: "Eleuthera" },
  { label: "Grand Bahama", value: "Grand Bahama" },
  { label: "Long Island", value: "Long Island" },
];

const ISLAND_COUNT = ISLAND_FILTERS.filter((f) => f.value).length;

export default async function GuidesBrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ island?: string }>;
}) {
  const { island } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("guides")
    .select("id, full_name, avatar_url, islands, specialties")
    .eq("verification_status", "approved")
    .order("full_name", { ascending: true });

  if (island) query = query.contains("islands", [island]);

  const [{ data }, { data: photoRows }, { count: totalGuides }] =
    await Promise.all([
      query,
      supabase
        .from("catch_photos")
        .select("id, photo_url, created_at, guide_id, guides(full_name, islands)")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("guides")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", "approved"),
    ]);

  const guides = (data ?? []) as Pick<
    Guide,
    "id" | "full_name" | "avatar_url" | "islands" | "specialties"
  >[];

  const activity: ActivityItem[] = ((photoRows ?? []) as CatchPhotoRow[])
    .map((row) => {
      const guide = Array.isArray(row.guides) ? row.guides[0] : row.guides;
      return {
        id: row.id,
        photo_url: row.photo_url,
        created_at: row.created_at,
        guide_id: row.guide_id,
        guide_name: guide?.full_name ?? null,
        island: guide?.islands?.[0] ?? null,
      };
    })
    .filter((item) => Boolean(item.photo_url));

  return (
    <AppShell homeIndicator={false}>
      <div className="flex items-center gap-3 px-5 pb-2 pt-2">
        <Link href="/onboarding" className="text-ink">
          <ArrowLeft size={24} />
        </Link>
        <Logo size="sm" />
      </div>

      <article className="px-5 pb-8">
        {/* Hero — gradient sampled from the Beyond The Flats wordmark */}
        {/* Solid base under the gradient so the white copy always has contrast */}
        <header className="relative mt-2 overflow-hidden rounded-2xl bg-ocean-deep bg-linear-to-br from-ocean-deep via-ocean-deep to-ocean p-5 text-white">
          <span
            className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-aqua/25 blur-3xl"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-sand/40 to-transparent"
            aria-hidden
          />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-semibold tracking-wide">
              <BadgeCheck size={13} className="text-aqua" /> DMR Licensed
            </span>
            <h1 className="mt-3 text-[26px] font-bold leading-tight">
              Find Your Bahamian Fishing Guide
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-white/75">
              Every guide is verified and licensed by the Department of Marine
              Resources — ready to show you the best flats fishing in the world.
            </p>

            <div className="mt-5 flex items-center gap-5 border-t border-white/15 pt-4">
              <div>
                <p className="text-xl font-bold leading-none text-seafoam">
                  {totalGuides ?? guides.length}
                </p>
                <p className="mt-1.5 text-[11px] uppercase tracking-wide text-white/60">
                  Verified guides
                </p>
              </div>
              <span className="h-9 w-px bg-white/15" />
              <div>
                <p className="text-xl font-bold leading-none text-seafoam">
                  {ISLAND_COUNT}
                </p>
                <p className="mt-1.5 text-[11px] uppercase tracking-wide text-white/60">
                  Islands covered
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Permit reminder */}
        <Link
          href="/permits"
          className="mt-3 flex items-center gap-3 rounded-2xl border border-ocean/25 bg-ocean-soft p-3.5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ocean">
            <Ticket size={18} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-ink">
              Get your fishing permit
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-muted">
              Visiting anglers need one before getting on the water.
            </span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-ocean" />
        </Link>

        {/* Live catch activity across verified guides */}
        <ActivityFeed items={activity} />

        {/* Island filter */}
        <div className="mt-6 -mx-5">
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-1">
            {ISLAND_FILTERS.map((f) => {
              const active = f.value === (island ?? null);
              const href = f.value
                ? `/guides?island=${encodeURIComponent(f.value)}`
                : "/guides";
              return (
                <Link
                  key={f.label}
                  href={href}
                  className={clsx(
                    "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-ocean bg-ocean text-white"
                      : "border-line bg-white text-ink",
                  )}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <GuideList
            key={island ?? "all"}
            guides={guides}
            island={island}
          />
        </div>
      </article>

      <SiteFooter />
    </AppShell>
  );
}
