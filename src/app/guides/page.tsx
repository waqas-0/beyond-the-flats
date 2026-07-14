import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, MapPin, BadgeCheck, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { createClient } from "@/lib/supabase/server";
import type { Guide } from "@/lib/supabase/types";

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

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Browse Guides" };

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

  const { data } = await query;
  const guides = (data ?? []) as Pick<
    Guide,
    "id" | "full_name" | "avatar_url" | "islands" | "specialties"
  >[];

  return (
    <AppShell homeIndicator={false}>
      <div className="flex items-center gap-3 px-5 pb-2 pt-2">
        <Link href="/" className="text-ink">
          <ArrowLeft size={24} />
        </Link>
        <Logo size="sm" />
      </div>

      <article className="px-5 pb-8">
        <h1 className="mt-2 text-2xl font-bold text-ink">
          {island ? `Guides on ${island}` : "Verified Guides"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {guides.length} verified {guides.length === 1 ? "guide" : "guides"}
          {island ? " on this island" : ""}.
        </p>

        <div className="mt-5 space-y-3">
          {guides.map((g) => (
            <Link
              key={g.id}
              href={`/g/${g.id}`}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5"
            >
              <Avatar name={g.full_name} url={g.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink">
                  {g.full_name ?? "Beyond The Flats Guide"}
                  <BadgeCheck size={14} className="shrink-0 text-brand" />
                </p>
                {!!g.specialties.length && (
                  <p className="mt-0.5 truncate text-xs font-medium text-brand">
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
      </article>

      <SiteFooter />
    </AppShell>
  );
}
