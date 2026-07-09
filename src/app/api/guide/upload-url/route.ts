import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Files upload straight from the browser to Supabase Storage using a short-lived
// signed URL minted here. This keeps large licence images off the API route,
// which is capped at ~4.5MB of request body on Vercel. Type + size are validated
// at mint time (the bytes never reach us), and the extension is derived from the
// content type — never from the client-supplied filename.

const MAX_BYTES = 10 * 1024 * 1024; // 10MB — matches the on-screen limit
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const LICENSE_TYPES = [...IMAGE_TYPES, "application/pdf"];
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const BUCKETS = {
  avatar: "guide-avatars",
  license: "guide-licenses",
} as const;

type Kind = keyof typeof BUCKETS;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { kind, contentType, size } = (await request
    .json()
    .catch(() => ({}))) as { kind?: string; contentType?: string; size?: number };

  if (kind !== "avatar" && kind !== "license") {
    return Response.json({ error: "Invalid upload kind." }, { status: 400 });
  }

  const allowed = kind === "license" ? LICENSE_TYPES : IMAGE_TYPES;
  if (!contentType || !allowed.includes(contentType)) {
    return Response.json({ error: "Unsupported file type." }, { status: 400 });
  }
  if (typeof size !== "number" || size <= 0 || size > MAX_BYTES) {
    return Response.json({ error: "File exceeds the 10MB limit." }, { status: 400 });
  }

  const bucket = BUCKETS[kind as Kind];
  const path = `${user.id}/${kind}.${EXT_BY_TYPE[contentType]}`;

  const storage = createServiceClient();
  const { data, error } = await storage.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) {
    console.error("[guide/upload-url]", error?.message);
    return Response.json({ error: "Could not start upload." }, { status: 500 });
  }

  return Response.json({ bucket, path, token: data.token });
}
