import { createClient, createServiceClient } from "@/lib/supabase/server";
import { normalizeWebsite } from "@/lib/url";
import { NextRequest } from "next/server";

// GET — return the signed-in guide's profile
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { data: guide, error } = await supabase
    .from("guides")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[guide/profile GET]", error.message);
    return Response.json({ error: "Failed to load profile." }, { status: 500 });
  }

  return Response.json({ guide });
}

// PATCH — update editable profile fields (and optionally the avatar)
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const storage = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const formData = await request.formData();

  const fullName = formData.get("full_name") as string | null;
  const bio = (formData.get("bio") as string | null) ?? null;
  const islands = JSON.parse((formData.get("islands") as string) ?? "[]") as string[];
  const specialties = JSON.parse(
    (formData.get("specialties") as string) ?? "[]",
  ) as string[];
  const boatType = (formData.get("boat_type") as string | null) || null;
  const yearsExperience = formData.get("years_experience")
    ? Number(formData.get("years_experience"))
    : null;
  const website = normalizeWebsite(formData.get("website_url") as string | null);
  const avatarFile = formData.get("avatar") as File | null;

  if (!fullName || !fullName.trim()) {
    return Response.json({ error: "Full name is required." }, { status: 400 });
  }

  // Only updatable profile fields — verification status, license and pledge
  // are intentionally untouched here.
  const updates: Record<string, unknown> = {
    full_name: fullName.trim(),
    bio,
    islands,
    specialties,
    boat_type: boatType,
    years_experience: yearsExperience,
    website_url: website,
  };

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadErr } = await storage.storage
      .from("guide-avatars")
      .upload(path, avatarFile, { upsert: true });

    if (uploadErr) {
      console.error("[guide/profile PATCH] avatar upload:", uploadErr.message);
      return Response.json(
        { error: "Avatar upload failed.", detail: uploadErr.message },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl },
    } = storage.storage.from("guide-avatars").getPublicUrl(path);
    // Cache-bust so the new image shows immediately after re-upload
    updates.avatar_url = `${publicUrl}?v=${avatarFile.size}`;
  }

  const { data: guide, error } = await supabase
    .from("guides")
    .update(updates)
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    console.error("[guide/profile PATCH]", error.message);
    return Response.json({ error: "Failed to save profile." }, { status: 500 });
  }

  return Response.json({ guide });
}
