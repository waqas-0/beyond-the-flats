import { createServiceClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin";
import { notifyGuide } from "@/lib/notify";
import { NextRequest } from "next/server";

// PATCH /api/admin/guides/[id] — approve/reject a guide, or toggle their
// Reef Ambassador certification.
// Body: { action: "approve" | "reject" | "reef", reason?: string, value?: boolean }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { id } = await params;

  let body: { action?: unknown; reason?: unknown; value?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const action = body.action;
  if (action !== "approve" && action !== "reject" && action !== "reef") {
    return Response.json(
      { error: "action must be 'approve', 'reject', or 'reef'." },
      { status: 400 },
    );
  }

  const service = createServiceClient();

  // Toggle Reef Ambassador certification (no notification).
  if (action === "reef") {
    const { data: guide, error } = await service
      .from("guides")
      .update({ reef_ambassador: body.value === true })
      .eq("id", id)
      .select("id, reef_ambassador")
      .maybeSingle();
    if (error) {
      console.error("[admin/guides PATCH reef]", error.message);
      return Response.json({ error: "Failed to update certification." }, { status: 500 });
    }
    if (!guide) {
      return Response.json({ error: "Guide not found." }, { status: 404 });
    }
    return Response.json({ guide });
  }

  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  if (action === "reject" && !reason) {
    return Response.json(
      { error: "A reason is required when rejecting an application." },
      { status: 400 },
    );
  }

  const status = action === "approve" ? "approved" : "rejected";
  const { data: guide, error } = await service
    .from("guides")
    .update({
      verification_status: status,
      // Clear any prior reason on approval; store it on rejection.
      rejection_reason: action === "reject" ? reason : null,
    })
    .eq("id", id)
    .select("id, full_name, phone, verification_status, rejection_reason")
    .maybeSingle();

  if (error) {
    console.error("[admin/guides PATCH]", error.message);
    return Response.json({ error: "Failed to update application." }, { status: 500 });
  }
  if (!guide) {
    return Response.json({ error: "Guide not found." }, { status: 404 });
  }

  // Best-effort notification — must not roll back the decision.
  await notifyGuide({
    phone: guide.phone,
    kind: action === "approve" ? "approved" : "rejected",
    name: guide.full_name,
    reason: action === "reject" ? reason : null,
  });

  return Response.json({ guide });
}
