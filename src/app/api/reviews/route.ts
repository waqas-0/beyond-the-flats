import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

// POST — a visitor leaves a review on a guide's public profile. Anon can't
// insert into `reviews` (RLS/grants), so this validates and inserts via the
// service client with approved=false (pending admin moderation).
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const guideId = body.guide_id;
  const visitorName = body.visitor_name;
  const stars = body.stars;
  const text = body.body;

  if (
    typeof guideId !== "string" ||
    typeof visitorName !== "string" ||
    !visitorName.trim() ||
    typeof stars !== "number" ||
    stars < 1 ||
    stars > 5
  ) {
    return Response.json({ error: "Name and a 1–5 star rating are required." }, { status: 400 });
  }

  const service = createServiceClient();

  // Only approved guides can receive reviews.
  const { data: guide } = await service
    .from("guides")
    .select("id")
    .eq("id", guideId)
    .eq("verification_status", "approved")
    .maybeSingle();
  if (!guide) {
    return Response.json({ error: "Guide not found." }, { status: 404 });
  }

  const { error } = await service.from("reviews").insert({
    guide_id: guideId,
    visitor_name: visitorName.trim().slice(0, 80),
    stars: Math.round(stars),
    body: typeof text === "string" && text.trim() ? text.trim().slice(0, 1000) : null,
    approved: false,
  });

  if (error) {
    console.error("[reviews POST]", error.message);
    return Response.json({ error: "Failed to submit review." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
