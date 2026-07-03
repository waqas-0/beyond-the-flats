import { createServiceClient } from "@/lib/supabase/server";
import { GuideTable, type GuideRow } from "../GuideTable";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const service = createServiceClient();
  const { data } = await service
    .from("guides")
    .select(
      "id, full_name, avatar_url, phone, islands, specialties, verification_status, created_at",
    )
    .eq("verification_status", "pending")
    .order("created_at", { ascending: false });
  const guides = (data ?? []) as GuideRow[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Guide Applications</h1>
      <p className="mt-1 text-sm text-muted">
        Review the pending requests for guide accounts.
      </p>
      <div className="mt-6">
        <GuideTable guides={guides} />
      </div>
    </div>
  );
}
