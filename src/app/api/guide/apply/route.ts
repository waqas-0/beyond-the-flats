import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // Regular client for auth check (reads session cookie)
  const supabase = await createClient();
  // Service client for storage uploads — bypasses RLS since we verify auth above
  const storage = createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const formData = await request.formData();

  const fullName = formData.get("full_name") as string;
  const bio = formData.get("bio") as string;
  const islands = JSON.parse((formData.get("islands") as string) ?? "[]") as string[];
  const specialties = JSON.parse((formData.get("specialties") as string) ?? "[]") as string[];
  const boatType = (formData.get("boat_type") as string | null) || null;
  const yearsExperience = formData.get("years_experience")
    ? Number(formData.get("years_experience"))
    : null;
  const conservationPledge = formData.get("conservation_pledge") === "true";
  const avatarFile = formData.get("avatar") as File | null;
  const licenseFile = formData.get("license") as File | null;

  if (!fullName || !conservationPledge) {
    return Response.json(
      { error: "Full name and conservation pledge are required." },
      { status: 400 },
    );
  }

  let avatarUrl: string | null = null;
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadErr } = await storage.storage
      .from("guide-avatars")
      .upload(path, avatarFile, { upsert: true });

    if (uploadErr) {
      console.error("[guide/apply] avatar upload:", uploadErr.message);
      return Response.json({ error: "Avatar upload failed.", detail: uploadErr.message }, { status: 500 });
    }

    const { data: { publicUrl } } = storage.storage
      .from("guide-avatars")
      .getPublicUrl(path);
    avatarUrl = publicUrl;
  }

  let licenseUrl: string | null = null;
  if (licenseFile && licenseFile.size > 0) {
    const ext = licenseFile.name.split(".").pop();
    const path = `${user.id}/license.${ext}`;
    const { error: uploadErr } = await storage.storage
      .from("guide-licenses")
      .upload(path, licenseFile, { upsert: true });

    if (uploadErr) {
      console.error("[guide/apply] license upload:", uploadErr.message);
      return Response.json({ error: "License upload failed.", detail: uploadErr.message }, { status: 500 });
    }
    // License bucket is private — just store the path for admin review
    licenseUrl = path;
  }

  // Upsert the guide profile using the authenticated user's session
  const { error } = await supabase.from("guides").upsert({
    id: user.id,
    phone: user.phone ?? "",
    full_name: fullName,
    bio,
    avatar_url: avatarUrl,
    islands,
    specialties,
    boat_type: boatType,
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
