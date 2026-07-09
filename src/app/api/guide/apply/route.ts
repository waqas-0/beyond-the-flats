import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Avatar + licence files are uploaded straight to Supabase Storage from the
// browser (see /api/guide/upload-url). This route only receives the resulting
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

  let avatarUrl: string | null = null;
  if (body.avatar_path) {
    if (!ownsPath(body.avatar_path)) {
      return Response.json({ error: "Invalid avatar path." }, { status: 400 });
    }
    const storage = createServiceClient();
    const {
      data: { publicUrl },
    } = storage.storage.from("guide-avatars").getPublicUrl(body.avatar_path);
    avatarUrl = publicUrl;
  }

  let licenseUrl: string | null = null;
  if (body.license_path) {
    if (!ownsPath(body.license_path)) {
      return Response.json({ error: "Invalid licence path." }, { status: 400 });
    }
    // Licence bucket is private — store the path for admin review.
    licenseUrl = body.license_path;
  }

  const yearsExperience =
    body.years_experience != null && !Number.isNaN(Number(body.years_experience))
      ? Number(body.years_experience)
      : null;

  const { error } = await supabase.from("guides").upsert({
    id: user.id,
    phone: user.phone ?? "",
    full_name: fullName,
    bio: body.bio ?? "",
    avatar_url: avatarUrl,
    islands: Array.isArray(body.islands) ? body.islands : [],
    specialties: Array.isArray(body.specialties) ? body.specialties : [],
    boat_type: body.boat_type || null,
    years_experience: yearsExperience,
    license_url: licenseUrl,
    conservation_pledge: conservationPledge,
    verification_status: "pending",
    rejection_reason: null,
  });

  if (error) {
    console.error("[guide/apply]", error.message);
    return Response.json({ error: "Failed to save application." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
