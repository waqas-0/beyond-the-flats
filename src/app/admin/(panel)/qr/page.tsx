import { QrCode } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { GuideQrCard } from "@/components/GuideQrCard";

export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
  const service = createServiceClient();
  const { data } = await service
    .from("guides")
    .select("id, full_name")
    .eq("verification_status", "approved")
    .order("full_name", { ascending: true });
  const guides = (data ?? []) as { id: string; full_name: string | null }[];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">QR Management</h1>
      <p className="mt-1 text-sm text-muted">
        View and download the public-profile QR code for any approved guide.
      </p>

      {guides.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-line bg-white py-16 text-center">
          <QrCode size={40} className="text-faint" strokeWidth={1.6} />
          <p className="mt-3 text-base font-semibold text-ink">No approved guides yet</p>
          <p className="mt-1 text-sm text-muted">
            QR codes are generated once a guide is verified.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {guides.map((g) => (
            <div key={g.id} className="rounded-2xl border border-line bg-white p-2">
              <p className="px-3 pt-2 text-sm font-semibold text-ink">
                {g.full_name ?? "Unnamed guide"}
              </p>
              <GuideQrCard guideId={g.id} name={g.full_name ?? "Guide"} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
