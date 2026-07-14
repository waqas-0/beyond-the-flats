import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// Logs a QR scan for analytics. Insert is open to anon (RLS "qr_scan_insert"),
// so this uses the regular client. Best-effort — never hard-fails the visitor.
export async function POST(request: NextRequest) {
  let guideId: unknown;
  try {
    ({ guide_id: guideId } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!guideId || typeof guideId !== "string") {
    return Response.json({ error: "guide_id is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;
  // Vercel/edge geo header when available; null locally.
  const country = request.headers.get("x-vercel-ip-country") ?? null;

  const { error } = await supabase.from("qr_scans").insert({
    guide_id: guideId,
    user_agent: userAgent,
    country_code: country,
  });

  if (error) {
    console.error("[scan]", error.message);
    // Analytics failure shouldn't surface as an error to the visitor.
    return Response.json({ ok: false }, { status: 200 });
  }
  return Response.json({ ok: true });
}
