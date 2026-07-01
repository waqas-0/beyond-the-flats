import { createServiceClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin";
import { NextRequest } from "next/server";

// PATCH — approve a pending review. DELETE — reject (remove) it. Admin only.
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient();
  const { error } = await service
    .from("reviews")
    .update({ approved: true })
    .eq("id", id);

  if (error) {
    console.error("[admin/reviews PATCH]", error.message);
    return Response.json({ error: "Failed to approve review." }, { status: 500 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const service = createServiceClient();
  const { error } = await service.from("reviews").delete().eq("id", id);

  if (error) {
    console.error("[admin/reviews DELETE]", error.message);
    return Response.json({ error: "Failed to remove review." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
