import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// POST — upsert a trip (idempotent by client-supplied UUID). Used by the
// offline sync engine; safe to retry. RLS (guides_own_trips) confines writes
// to the authenticated guide, and we always stamp guide_id server-side.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorised." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.id || typeof body.id !== "string") {
    return Response.json({ error: "Trip id is required." }, { status: 400 });
  }

  const { error } = await supabase.from("trips").upsert({
    id: body.id,
    guide_id: user.id,
    title: (body.title as string | null) ?? null,
    client_name: (body.client_name as string | null) ?? null,
    anglers: typeof body.anglers === "number" ? body.anglers : 1,
    permit_ref: (body.permit_ref as string | null) ?? null,
    location_note: (body.location_note as string | null) ?? null,
    notes: (body.notes as string | null) ?? null,
    start_time: (body.start_time as string) ?? new Date().toISOString(),
    end_time: (body.end_time as string | null) ?? null,
    photo_url: (body.photo_url as string | null) ?? null,
  });

  if (error) {
    console.error("[guide/trips POST]", error.message);
    return Response.json({ error: "Failed to save trip." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

// GET — the guide's trips + their catches, for hydrating a fresh device.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { data: trips, error } = await supabase
    .from("trips")
    .select(
      "id, title, client_name, anglers, permit_ref, location_note, notes, start_time, end_time, photo_url",
    )
    .eq("guide_id", user.id)
    .order("start_time", { ascending: false });

  if (error) {
    console.error("[guide/trips GET]", error.message);
    return Response.json({ error: "Failed to load trips." }, { status: 500 });
  }

  const ids = (trips ?? []).map((t) => t.id);
  let catches: unknown[] = [];
  if (ids.length) {
    const { data } = await supabase
      .from("catches")
      .select("id, trip_id, species, count, logged_at")
      .in("trip_id", ids);
    catches = data ?? [];
  }

  return Response.json({ trips: trips ?? [], catches });
}
