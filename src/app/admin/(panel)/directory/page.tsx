import Link from "next/link";
import { UserPlus } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { GuideTable, type GuideRow } from "../GuideTable";

export const dynamic = "force-dynamic";

export default async function AdminDirectoryPage() {
  const service = createServiceClient();
  const { data } = await service
    .from("guides")
    .select(
      "id, full_name, avatar_url, phone, islands, specialties, verification_status, created_at",
    )
    .order("created_at", { ascending: false });
  const guides = (data ?? []) as GuideRow[];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Manage Guides</h1>
          <p className="mt-1 text-sm text-muted">
            Every registered guide — search, filter by status, and open a profile.
          </p>
        </div>
        <Link
          href="/admin/directory/new"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90"
        >
          <UserPlus size={16} /> Add Guide
        </Link>
      </div>
      <div className="mt-6">
        <GuideTable guides={guides} showStatusFilter />
      </div>
    </div>
  );
}
