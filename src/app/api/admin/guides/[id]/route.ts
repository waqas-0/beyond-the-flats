import { createServiceClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin";
import { notifyGuide } from "@/lib/notify";
import { NextRequest } from "next/server";

// Every bucket that stores files under a `<guide-id>/` folder.
const GUIDE_BUCKETS = [
  "guide-avatars",
  "guide-licenses",
  "guide-catch-photos",
  "catch-photos",
];

/** Remove every stored file belonging to a guide. Best-effort — a storage
 *  hiccup must not block the account deletion itself. */
async function purgeGuideStorage(
  storage: ReturnType<typeof createServiceClient>,
  guideId: string,
) {
  for (const bucket of GUIDE_BUCKETS) {
    try {
      const { data: files } = await storage.storage.from(bucket).list(guideId);
      if (!files?.length) continue;
      await storage.storage
        .from(bucket)
        .remove(files.map((f: { name: string }) => `${guideId}/${f.name}`));
    } catch (e) {
      console.error(`[admin/guides DELETE] storage ${bucket}:`, e);
    }
  }
}

// DELETE /api/admin/guides/[id] — permanently remove a guide.
// Deleting the auth user cascades to the guide row and everything hanging off
// it (trips, catches, reviews, qr_scans, catch_photos) via `on delete cascade`.
// Their phone number is freed up, so they can register again later.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { id } = await params;
  const service = createServiceClient();

  const { data: guide } = await service
    .from("guides")
    .select("id, full_name")
    .eq("id", id)
    .maybeSingle();
  if (!guide) {
    return Response.json({ error: "Guide not found." }, { status: 404 });
  }

  // Files first — once the row is gone we'd have no record of what to clean.
  await purgeGuideStorage(service, id);

  const { error: authErr } = await service.auth.admin.deleteUser(id);
  if (authErr) {
    // No auth user (e.g. already removed) — drop the profile row directly so
    // the admin isn't left with an undeletable record.
    console.error("[admin/guides DELETE] auth:", authErr.message);
    const { error: rowErr } = await service.from("guides").delete().eq("id", id);
    if (rowErr) {
      console.error("[admin/guides DELETE] row:", rowErr.message);
      return Response.json({ error: "Failed to delete the guide." }, { status: 500 });
    }
  }

  return Response.json({ ok: true });
}

// PATCH /api/admin/guides/[id] — approve/reject a guide, toggle their Reef
// Ambassador certification, or set their DMR licence number.
// Body: { action: "approve" | "reject" | "reef" | "license_number", reason?: string, value?: boolean | string }
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
  if (
    action !== "approve" &&
    action !== "reject" &&
    action !== "reef" &&
    action !== "license_number"
  ) {
    return Response.json(
      { error: "action must be 'approve', 'reject', 'reef', or 'license_number'." },
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

  // Set the guide's DMR licence number (transcribed by admin from the
  // reviewed licence document — this is a verification signal, not
  // self-reported by the guide).
  if (action === "license_number") {
    const licenseNumber =
      typeof body.value === "string" ? body.value.trim().slice(0, 40) || null : null;
    const { data: guide, error } = await service
      .from("guides")
      .update({ license_number: licenseNumber })
      .eq("id", id)
      .select("id, license_number")
      .maybeSingle();
    if (error) {
      console.error("[admin/guides PATCH license_number]", error.message);
      return Response.json({ error: "Failed to update licence number." }, { status: 500 });
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
