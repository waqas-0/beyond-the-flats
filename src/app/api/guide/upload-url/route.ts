import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Files upload straight from the browser to Supabase Storage using a short-lived
// signed URL minted here. This keeps large licence images off the API route,
// which is capped at ~4.5MB of request body on Vercel.

const BUCKETS = {
  avatar: "guide-avatars",
  license: "guide-licenses",
} as const;

type Kind = keyof typeof BUCKETS;

function safeExt(filename: string): string {
  const ext = (filename.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext ? ext.slice(0, 5) : "bin";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { kind, filename } = (await request.json().catch(() => ({}))) as {
    kind?: string;
    filename?: string;
  };

  if (kind !== "avatar" && kind !== "license") {
    return Response.json({ error: "Invalid upload kind." }, { status: 400 });
  }

  const bucket = BUCKETS[kind as Kind];
  const path = `${user.id}/${kind}.${safeExt(filename ?? "")}`;

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
