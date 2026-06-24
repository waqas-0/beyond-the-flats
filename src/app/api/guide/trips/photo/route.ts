import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// POST (multipart) — upload a trip photo to the private catch-photos bucket.
// Auth is verified here, then the service client performs the upload (matching
// the apply-route pattern). Returns the stored path; the client keeps the
// original blob locally for instant display.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const form = await request.formData();
  const tripId = form.get("trip_id") as string | null;
  const file = form.get("file") as File | null;

  if (!tripId || !file || file.size === 0) {
    return Response.json({ error: "trip_id and file are required." }, { status: 400 });
  }

  const storage = createServiceClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  // Path is scoped under the guide's id — matches the storage RLS folder check.
  const path = `${user.id}/${tripId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await storage.storage
    .from("catch-photos")
    .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });

  if (error) {
    console.error("[guide/trips/photo]", error.message);
    return Response.json({ error: "Photo upload failed." }, { status: 500 });
  }

  return Response.json({ path });
}
