import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const LICENSE_TYPES = [...IMAGE_TYPES, "application/pdf"];
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/** Validate a client-uploaded file against a MIME allow-list + size cap.
 *  Returns the safe extension (derived from content type, not the filename). */
function checkFile(file: File, allowed: string[]): { ext: string } | { error: string } {
  if (file.size > MAX_BYTES) return { error: "File exceeds the 10MB limit." };
  if (!allowed.includes(file.type)) return { error: "Unsupported file type." };
  return { ext: EXT_BY_TYPE[file.type] };
}

/** Parse a JSON string[] form field defensively — never throws. */
function parseStringArray(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const storage = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const formData = await request.formData();

  const fullName = (formData.get("full_name") as string | null)?.trim() ?? "";
  const bio = (formData.get("bio") as string | null) ?? "";
  const islands = parseStringArray(formData.get("islands"));
  const specialties = parseStringArray(formData.get("specialties"));
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

  // Does the guide already have a licence on file (re-application)?
  const { data: existing } = await supabase
    .from("guides")
    .select("license_url")
    .eq("id", user.id)
    .maybeSingle();
  const hasLicenceOnFile = !!existing?.license_url;

  const hasNewLicence = !!(licenseFile && licenseFile.size > 0);
  if (!hasLicenceOnFile && !hasNewLicence) {
    return Response.json(
      { error: "A fishing licence upload is required." },
      { status: 400 },
    );
  }

  // Avatar (optional) — validated, extension derived from content type.
  let avatarUrl: string | null = null;
  if (avatarFile && avatarFile.size > 0) {
    const checked = checkFile(avatarFile, IMAGE_TYPES);
    if ("error" in checked) {
      return Response.json({ error: `Avatar: ${checked.error}` }, { status: 400 });
    }
    const path = `${user.id}/avatar.${checked.ext}`;
    const { error: uploadErr } = await storage.storage
      .from("guide-avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
    if (uploadErr) {
      console.error("[guide/apply] avatar upload:", uploadErr.message);
      return Response.json({ error: "Avatar upload failed." }, { status: 500 });
    }
    const {
      data: { publicUrl },
    } = storage.storage.from("guide-avatars").getPublicUrl(path);
    avatarUrl = `${publicUrl}?v=${avatarFile.size}`;
  }

  // Licence (private bucket) — validated, path stored.
  let licenseUrl: string | null = null;
  if (hasNewLicence) {
    const checked = checkFile(licenseFile!, LICENSE_TYPES);
    if ("error" in checked) {
      return Response.json({ error: `Licence: ${checked.error}` }, { status: 400 });
    }
    const path = `${user.id}/license.${checked.ext}`;
    const { error: uploadErr } = await storage.storage
      .from("guide-licenses")
      .upload(path, licenseFile!, { upsert: true, contentType: licenseFile!.type });
    if (uploadErr) {
      console.error("[guide/apply] license upload:", uploadErr.message);
      return Response.json({ error: "Licence upload failed." }, { status: 500 });
    }
    licenseUrl = path;
  }

  // Only overwrite avatar_url / license_url when a NEW file was uploaded —
  // otherwise a re-application would wipe the stored values.
  const payload: Record<string, unknown> = {
    id: user.id,
    phone: user.phone ?? "",
    full_name: fullName,
    bio,
    islands,
    specialties,
    boat_type: boatType,
    years_experience: yearsExperience,
    conservation_pledge: conservationPledge,
    verification_status: "pending",
    rejection_reason: null,
  };
  if (avatarUrl !== null) payload.avatar_url = avatarUrl;
  if (licenseUrl !== null) payload.license_url = licenseUrl;

  const { error } = await supabase.from("guides").upsert(payload);
  if (error) {
    console.error("[guide/apply]", error.message);
    return Response.json({ error: "Failed to save application." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
