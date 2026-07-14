import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  MapPin,
  Calendar,
  CircleCheck,
  FileText,
  ExternalLink,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import type { Guide } from "@/lib/supabase/types";
import { ReviewActions } from "../../ReviewActions";
import { GuideQrCard } from "@/components/GuideQrCard";
import { StatusPill, Chip } from "../../ui";

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

  let licenseUrl: string | null = null;
  let licenseName: string | null = null;
  if (g.license_url) {
    const { data } = await service.storage
      .from("guide-licenses")
      .createSignedUrl(g.license_url, 600);
    licenseUrl = data?.signedUrl ?? null;
    licenseName = g.license_url.split("/").pop() ?? "licence";
  }

  const submitted = new Date(g.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted">
        <Link href="/admin/applications" className="hover:text-ink">
          Guide Applications
        </Link>
        <ChevronRight size={14} />
        <span className="font-semibold text-ink">Guide Verification</span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Link href="/admin/applications" className="text-ink">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink">Guide Verification Review</h1>
          <p className="text-sm text-muted">
            Review submitted information and uploaded licence documents.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* Profile card */}
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="h-24 bg-navy" />
          <div className="px-5 pb-5">
            <div className="-mt-12 flex items-start justify-between">
              {g.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.avatar_url}
                  alt={g.full_name ?? "Guide"}
                  className="h-20 w-20 rounded-2xl border-4 border-white object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-card text-2xl font-bold text-navy">
                  {(g.full_name ?? "?").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="mt-14 text-right text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Island Coverage
                </p>
                <p className="flex items-center justify-end gap-1 font-medium text-ink">
                  <MapPin size={13} className="text-brand" />
                  {g.islands.join(", ") || "—"}
                </p>
              </div>
            </div>

            <h2 className="mt-3 text-xl font-bold text-ink">
              {g.full_name ?? "Unnamed guide"}
            </h2>
            <div className="mt-1">
              <StatusPill status={g.verification_status} />
            </div>

            {g.bio && (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
                  Guide Bio
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{g.bio}</p>
              </>
            )}

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
              Submission Date
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink">
              <Calendar size={14} className="text-brand" /> {submitted}
            </p>

            {!!g.specialties.length && (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">
                  Specialties
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.specialties.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
              </>
            )}

            <div
              className={
                g.conservation_pledge
                  ? "mt-5 flex items-center gap-3 rounded-xl bg-brand-soft p-3.5"
                  : "mt-5 flex items-center gap-3 rounded-xl bg-danger-soft p-3.5"
              }
            >
              <CircleCheck
                size={22}
                className={g.conservation_pledge ? "text-brand" : "text-danger"}
              />
              <div className="text-sm">
                <p className="font-semibold text-ink">Catch &amp; Release Pledge</p>
                <p className={g.conservation_pledge ? "text-brand" : "text-danger"}>
                  {g.conservation_pledge ? "Accepted and Signed" : "Not signed"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Licence verification */}
        <div className="rounded-2xl border border-line bg-white p-5">
          <h3 className="flex items-center gap-2 text-base font-bold text-ink">
            <FileText size={18} className="text-navy" /> License Verification
          </h3>

          {licenseUrl ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Document Name
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink">
                <FileText size={15} className="text-danger" /> {licenseName}
              </p>
              <div className="mt-3 rounded-2xl border border-dashed border-line bg-card p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={licenseUrl}
                  alt="Guide fishing licence"
                  className="max-h-[26rem] w-full rounded-xl object-contain"
                />
              </div>
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
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card px-4 py-6 text-sm text-muted">
              <FileText size={18} /> No licence uploaded with this application.
            </div>
          )}
        </div>
      </div>

      {/* Decision */}
      {g.verification_status === "pending" ? (
        <div className="mt-6 ml-auto max-w-md">
          <ReviewActions guideId={g.id} />
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-white p-5">
          <p className="text-sm text-muted">
            This application has already been{" "}
            <span className="font-semibold text-ink">{g.verification_status}</span>.
          </p>
          {g.verification_status === "rejected" && g.rejection_reason && (
            <p className="mt-2 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
              Reason: {g.rejection_reason}
            </p>
          )}
          {g.verification_status === "approved" && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
                QR management
              </p>
              <GuideQrCard guideId={g.id} name={g.full_name ?? "Guide"} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
