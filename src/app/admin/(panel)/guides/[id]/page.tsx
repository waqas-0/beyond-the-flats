import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CircleAlert, Clock, ExternalLink, FileText, User } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import type { Guide } from "@/lib/supabase/types";
import { ReviewActions } from "../../ReviewActions";

export const dynamic = "force-dynamic";

export default async function AdminGuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = createServiceClient();

  const { data: guide } = await service
    .from("guides")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!guide) notFound();
  const g = guide as Guide;

  // Licence lives in a private bucket — mint a short-lived signed URL to view it.
  let licenseUrl: string | null = null;
  if (g.license_url) {
    const { data } = await service.storage
      .from("guide-licenses")
      .createSignedUrl(g.license_url, 600);
    licenseUrl = data?.signedUrl ?? null;
  }

  const submitted = new Date(g.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div>
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to applications
      </Link>

      <div className="mt-4 grid gap-4 lg:grid-cols-3 lg:items-start">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Identity */}
          <div className="flex items-center gap-4 rounded-[20px] border border-line bg-white p-5">
            {g.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={g.avatar_url}
                alt={g.full_name ?? "Guide"}
                className="h-16 w-16 shrink-0 rounded-full object-cover"
                width={64}
                height={64}
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-card">
                <User size={30} className="text-muted" strokeWidth={1.6} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-bold text-ink">
                {g.full_name ?? "Unnamed guide"}
              </h1>
              <p className="text-sm text-muted">{g.phone}</p>
              <p className="mt-0.5 text-xs text-muted">Applied {submitted}</p>
            </div>
            <StatusBadge status={g.verification_status} />
          </div>

          {/* Profile details */}
          <section className="rounded-[20px] border border-line bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Profile
            </h2>
            {g.bio && <p className="mt-3 text-sm leading-relaxed text-ink">{g.bio}</p>}
            <dl className="mt-4 grid grid-cols-2 gap-y-4 text-sm sm:grid-cols-4">
              <Field label="Boat type" value={g.boat_type} />
              <Field
                label="Years guiding"
                value={g.years_experience != null ? String(g.years_experience) : null}
              />
              <Field label="Islands" value={g.islands.join(", ") || null} />
              <Field label="Specialties" value={g.specialties.join(", ") || null} />
            </dl>
            <p className="mt-4 border-t border-line pt-4 text-sm">
              <span className="text-muted">Conservation pledge: </span>
              <span className={g.conservation_pledge ? "font-semibold text-brand" : "text-danger"}>
                {g.conservation_pledge ? "Signed ✓" : "Not signed"}
              </span>
            </p>
          </section>

          {/* Licence */}
          <section className="rounded-[20px] border border-line bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Fishing licence
            </h2>
            {licenseUrl ? (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={licenseUrl}
                  alt="Guide fishing licence"
                  className="max-h-[28rem] w-full rounded-2xl border border-line bg-bg object-contain"
                />
                <a
                  href={licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
                >
                  <ExternalLink size={15} /> Open full size
                </a>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-card px-4 py-5 text-sm text-muted">
                <FileText size={18} /> No licence uploaded with this application.
              </div>
            )}
          </section>
        </div>

        {/* Decision sidebar — sticky on desktop, stacks on mobile */}
        <aside className="lg:sticky lg:top-24">
          {g.verification_status === "pending" ? (
            <section className="rounded-[20px] border border-line bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Decision
              </h2>
              <p className="mt-2 text-sm text-muted">
                Approve to verify this guide, or reject with a reason they’ll see.
              </p>
              <div className="mt-4">
                <ReviewActions guideId={g.id} />
              </div>
            </section>
          ) : (
            <section className="rounded-[20px] border border-line bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Decision
              </h2>
              <p className="mt-3 text-sm text-muted">
                This application has already been{" "}
                <span className="font-semibold text-ink">{g.verification_status}</span>.
              </p>
              {g.verification_status === "rejected" && g.rejection_reason && (
                <p className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
                  Reason: {g.rejection_reason}
                </p>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value ?? "—"}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: Guide["verification_status"] }) {
  const map = {
    approved: { cls: "bg-brand text-white", Icon: BadgeCheck, label: "Approved" },
    rejected: { cls: "bg-danger text-white", Icon: CircleAlert, label: "Rejected" },
    pending: { cls: "bg-navy text-white", Icon: Clock, label: "Pending" },
  } as const;
  const { cls, Icon, label } = map[status];
  return (
    <span className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <Icon size={13} /> {label}
    </span>
  );
}
