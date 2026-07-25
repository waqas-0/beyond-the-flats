import { createClient, createServiceClient } from "@/lib/supabase/server";

// PATCH — update the caption on one of the signed-in guide's own catch
// photos. Body: { caption: string | null }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { caption?: string | null } | null;
  const caption =
    typeof body?.caption === "string" && body.caption.trim()
      ? body.caption.trim().slice(0, 120)
      : null;

  const { data: photo, error } = await supabase
    .from("catch_photos")
    .update({ caption })
    .eq("id", id)
    .eq("guide_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    console.error("[guide/catch-photos PATCH]", error.message);
    return Response.json({ error: "Failed to update caption." }, { status: 500 });
  }
  if (!photo) {
    return Response.json({ error: "Photo not found." }, { status: 404 });
  }
  return Response.json({ photo });
}

// DELETE — remove one of the signed-in guide's own catch photos (row + the
// underlying Storage object).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  // RLS scopes this to the caller's own rows; delete() with no match is a no-op.
  const { data: photo, error: fetchError } = await supabase
    .from("catch_photos")
    .select("photo_url")
    .eq("id", id)
    .eq("guide_id", user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("[guide/catch-photos DELETE fetch]", fetchError.message);
    return Response.json({ error: "Failed to delete photo." }, { status: 500 });
  }
  if (!photo) {
    return Response.json({ error: "Photo not found." }, { status: 404 });
  }

  const { error } = await supabase
    .from("catch_photos")
    .delete()
    .eq("id", id)
    .eq("guide_id", user.id);

  if (error) {
    console.error("[guide/catch-photos DELETE]", error.message);
    return Response.json({ error: "Failed to delete photo." }, { status: 500 });
  }

  // Best-effort storage cleanup — the row is already gone either way.
  const marker = "/guide-catch-photos/";
  const idx = photo.photo_url.indexOf(marker);
  if (idx !== -1) {
    const storagePath = photo.photo_url.slice(idx + marker.length);
    const storage = createServiceClient();
    await storage.storage.from("guide-catch-photos").remove([storagePath]);
  }

  return Response.json({ ok: true });
}
