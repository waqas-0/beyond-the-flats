import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

const SPECIES = ["bonefish", "tarpon", "permit", "other"];

// POST — upsert a single catch tally (idempotent by client UUID). RLS
// (guides_own_catches) ensures the trip belongs to the authenticated guide.
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

  const { id, trip_id, species, count } = body;
  if (
    typeof id !== "string" ||
    typeof trip_id !== "string" ||
    typeof species !== "string" ||
    !SPECIES.includes(species) ||
    typeof count !== "number" ||
    count <= 0
  ) {
    return Response.json({ error: "Invalid catch payload." }, { status: 400 });
  }

  const { error } = await supabase.from("catches").upsert({
    id,
    trip_id,
    species,
    count,
    logged_at: (body.logged_at as string) ?? new Date().toISOString(),
  });

  if (error) {
    console.error("[guide/catches POST]", error.message);
    return Response.json({ error: "Failed to save catch." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
