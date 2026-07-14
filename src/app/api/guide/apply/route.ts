import { createClient, createServiceClient } from "@/lib/supabase/server";
import { normalizeWebsite } from "@/lib/url";
import { NextRequest } from "next/server";

// Avatar + licence files are uploaded straight to Supabase Storage from the
// browser (see /api/guide/upload-url). This route receives only the resulting
// storage paths, so the request body stays small and never trips Vercel's
// ~4.5MB serverless body limit.

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    full_name?: string;
    bio?: string;
    islands?: string[];
    specialties?: string[];
    boat_type?: string | null;
    years_experience?: number | null;
    website_url?: string | null;
    conservation_pledge?: boolean;
    avatar_path?: string | null;
    license_path?: string | null;
  } | null;

  if (!body) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const fullName = body.full_name?.trim();
  const conservationPledge = body.conservation_pledge === true;

  if (!fullName || !conservationPledge) {
    return Response.json(
      { error: "Full name and conservation pledge are required." },
      { status: 400 },
    );
  }

  // Paths must live under the caller's own folder — never trust a client path.
  const ownsPath = (p: string | null | undefined) =>
    !!p && p.startsWith(`${user.id}/`);

  if (body.avatar_path && !ownsPath(body.avatar_path)) {
    return Response.json({ error: "Invalid avatar path." }, { status: 400 });
  }
  if (body.license_path && !ownsPath(body.license_path)) {
    return Response.json({ error: "Invalid licence path." }, { status: 400 });
  }

  // A licence is required — but a returning guide who already has one on file
  // (e.g. re-applying after a rejection) doesn't have to re-upload it.
  const { data: existing } = await supabase
    .from("guides")
    .select("license_url")
    .eq("id", user.id)
    .maybeSingle();
  const hasLicenceOnFile = !!existing?.license_url;
  if (!hasLicenceOnFile && !body.license_path) {
    return Response.json(
      { error: "A fishing licence upload is required." },
      { status: 400 },
    );
  }

  // Avatar public URL (cache-busted so a re-upload to the same path shows up).
  let avatarUrl: string | null = null;
  if (body.avatar_path) {
    const storage = createServiceClient();
    const {
      data: { publicUrl },
    } = storage.storage.from("guide-avatars").getPublicUrl(body.avatar_path);
    avatarUrl = `${publicUrl}?v=${Date.now()}`;
  }

  const yearsExperience =
    body.years_experience != null && !Number.isNaN(Number(body.years_experience))
      ? Number(body.years_experience)
      : null;

  // Only overwrite avatar_url / license_url when a NEW file was uploaded —
  // otherwise a re-application would wipe the stored values.
  const payload: Record<string, unknown> = {
    id: user.id,
    phone: user.phone ?? "",
    full_name: fullName,
    bio: body.bio ?? "",
    islands: Array.isArray(body.islands) ? body.islands : [],
    specialties: Array.isArray(body.specialties) ? body.specialties : [],
    boat_type: body.boat_type || null,
    years_experience: yearsExperience,
    website_url: normalizeWebsite(body.website_url),
    conservation_pledge: conservationPledge,
    verification_status: "pending",
    rejection_reason: null,
  };
  if (avatarUrl !== null) payload.avatar_url = avatarUrl;
  if (body.license_path) payload.license_url = body.license_path;

  const { error } = await supabase.from("guides").upsert(payload);

  if (error) {
    console.error("[guide/apply]", error.message);
    return Response.json({ error: "Failed to save application." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
