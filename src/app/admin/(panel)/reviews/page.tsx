import { MessageSquareQuote } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { Stars } from "@/components/ui/Stars";
import { ReviewModeration } from "../ReviewModeration";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const service = createServiceClient();

  type PendingReview = {
    id: string;
    guide_id: string;
    visitor_name: string;
    stars: number;
    body: string | null;
    created_at: string;
  };
  const { data: reviewRows, error } = await service
    .from("reviews")
    .select("id, guide_id, visitor_name, stars, body, created_at")
    .eq("approved", false)
    .order("created_at", { ascending: false });
  const pending = (reviewRows ?? []) as PendingReview[];

  // Resolve guide names in one query.
  const names = new Map<string, string>();
  const guideIds = [...new Set(pending.map((r) => r.guide_id))];
  if (guideIds.length) {
    const { data: gs } = await service
      .from("guides")
      .select("id, full_name")
      .in("id", guideIds);
    for (const g of gs ?? []) names.set(g.id, g.full_name ?? "Unnamed guide");
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold text-ink">Reviews</h1>
        <span className="text-sm font-semibold text-muted">
          {pending.length} awaiting moderation
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        Approve to publish on the guide&apos;s public profile, or reject to remove.
      </p>

      {error && (
        <p className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          Failed to load reviews: {error.message}
        </p>
      )}

      {!error && pending.length === 0 && (
        <div className="mt-10 flex flex-col items-center rounded-[20px] bg-white py-14 text-center">
          <MessageSquareQuote size={40} className="text-faint" strokeWidth={1.6} />
          <p className="mt-3 text-base font-semibold text-ink">Nothing to moderate</p>
          <p className="mt-1 text-sm text-muted">No pending reviews right now.</p>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {pending.map((r) => (
          <div key={r.id} className="rounded-[20px] border border-line bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{r.visitor_name}</p>
                <p className="text-xs text-muted">
                  for {names.get(r.guide_id) ?? "Unknown guide"} ·{" "}
                  {new Date(r.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <Stars value={r.stars} size={15} />
            </div>
            {r.body && (
              <p className="mt-3 text-sm leading-relaxed text-ink">
                &ldquo;{r.body}&rdquo;
              </p>
            )}
            <div className="mt-4 border-t border-line pt-4">
              <ReviewModeration reviewId={r.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
