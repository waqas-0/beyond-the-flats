import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// GET — the signed-in guide's own catch photos, newest first.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("catch_photos")
    .select("*")
    .eq("guide_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[guide/catch-photos GET]", error.message);
    return Response.json({ error: "Failed to load photos." }, { status: 500 });
  }
  return Response.json({ photos: data ?? [] });
}

// POST — record a photo already uploaded to Storage via the signed upload URL
// (see /api/guide/upload-url, kind: "catch_photo"). Body: { path, caption? }
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    path?: string;
    caption?: string | null;
  } | null;

  const path = body?.path;
  if (!path || !path.startsWith(`${user.id}/`)) {
    return Response.json({ error: "Invalid photo path." }, { status: 400 });
  }

  const caption =
    typeof body?.caption === "string" && body.caption.trim()
      ? body.caption.trim().slice(0, 120)
      : null;

  const storage = createServiceClient();
  const {
    data: { publicUrl },
  } = storage.storage.from("guide-catch-photos").getPublicUrl(path);

  const { data, error } = await supabase
    .from("catch_photos")
    .insert({ guide_id: user.id, photo_url: publicUrl, caption })
    .select("*")
    .single();

  if (error) {
    console.error("[guide/catch-photos POST]", error.message);
    return Response.json({ error: "Failed to save photo." }, { status: 500 });
  }
  return Response.json({ photo: data });
}
