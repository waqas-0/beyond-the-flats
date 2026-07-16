import { createServiceClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin";
import { normalizeWebsite } from "@/lib/url";
import { NextRequest } from "next/server";

// POST /api/admin/guides — the admin registers a guide on their behalf (for
// guides who aren't tech-savvy). Creates a confirmed phone auth user + an
// approved guide row; the guide can later sign in with that phone via OTP.
export async function POST(request: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    full_name?: string;
    phone?: string;
    bio?: string;
    boat_type?: string | null;
    years_experience?: number | null;
    islands?: string[];
    specialties?: string[];
    website_url?: string | null;
  } | null;
  if (!body) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const fullName = body.full_name?.trim();
  const phone = (body.phone ?? "").replace(/[\s\-().]/g, "");
  if (!fullName) {
    return Response.json({ error: "Full name is required." }, { status: 400 });
  }
  if (!/^\+\d{7,15}$/.test(phone)) {
    return Response.json(
      { error: "Enter a valid international phone number (e.g. +1 242 555-0123)." },
      { status: 400 },
    );
  }

  const service = createServiceClient();

  // Create the phone auth user (confirmed so they can OTP sign-in later).
  const { data: created, error: authErr } = await service.auth.admin.createUser({
    phone,
    phone_confirm: true,
  });
  if (authErr || !created?.user) {
    const msg = authErr?.message ?? "Could not create the guide account.";
    const dup = /already|exists|registered|duplicate/i.test(msg);
    return Response.json(
      { error: dup ? "A guide with this phone number already exists." : msg },
      { status: dup ? 409 : 500 },
    );
  }

  const yearsExperience =
    body.years_experience != null && !Number.isNaN(Number(body.years_experience))
      ? Number(body.years_experience)
      : null;

  const { error: insErr } = await service.from("guides").insert({
    id: created.user.id,
    phone,
    full_name: fullName,
    bio: body.bio ?? "",
    islands: Array.isArray(body.islands) ? body.islands : [],
    specialties: Array.isArray(body.specialties) ? body.specialties : [],
    boat_type: body.boat_type || null,
    years_experience: yearsExperience,
    website_url: normalizeWebsite(body.website_url),
    conservation_pledge: true,
    verification_status: "approved",
  });
  if (insErr) {
    console.error("[admin/guides POST]", insErr.message);
    // Roll back the auth user so we don't strand an account with no profile.
    await service.auth.admin.deleteUser(created.user.id).catch(() => {});
    return Response.json({ error: "Failed to create the guide profile." }, { status: 500 });
  }

  return Response.json({ id: created.user.id });
}
