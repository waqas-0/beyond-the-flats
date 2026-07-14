"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { clsx } from "@/lib/clsx";
import type { Guide, VerificationStatus } from "@/lib/supabase/types";
import { StatusPill, Initials, IslandCell, Chip } from "./ui";

export type GuideRow = Pick<
  Guide,
  | "id"
  | "full_name"
  | "avatar_url"
  | "phone"
  | "islands"
  | "specialties"
  | "verification_status"
  | "created_at"
>;

const PAGE_SIZE = 8;
const STATUS_FILTERS: { key: VerificationStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function GuideTable({
  guides,
  showStatusFilter = false,
}: {
  guides: GuideRow[];
  showStatusFilter?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<VerificationStatus | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guides
      .filter((g) => (status === "all" ? true : g.verification_status === status))
      .filter((g) =>
        !q
          ? true
          : (g.full_name ?? "").toLowerCase().includes(q) ||
            (g.phone ?? "").toLowerCase().includes(q) ||
            g.islands.some((i) => i.toLowerCase().includes(q)) ||
            g.specialties.some((s) => s.toLowerCase().includes(q)),
      )
      .sort((a, b) =>
        sort === "newest"
          ? b.created_at.localeCompare(a.created_at)
          : a.created_at.localeCompare(b.created_at),
      );
  }, [guides, query, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-full border border-line bg-white px-4 py-2.5 focus-within:border-brand">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search name, phone, island, specialty…"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-faint"
          />
        </div>
        {showStatusFilter &&
          STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setStatus(f.key);
                setPage(0);
              }}
              className={clsx(
                "rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                status === f.key
                  ? "bg-navy text-white"
                  : "border border-line bg-white text-muted hover:bg-card",
              )}
            >
              {f.label}
            </button>
          ))}
        <button
          onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
          className="rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-muted hover:bg-card"
        >
          {sort === "newest" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-bg text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="px-5 py-3.5">Guide Name</th>
                <th className="px-5 py-3.5">Island Coverage</th>
                <th className="px-5 py-3.5">Specialties</th>
                <th className="px-5 py-3.5">Submission Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => (
                <tr key={g.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Initials name={g.full_name} url={g.avatar_url} size={40} />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {g.full_name ?? "Unnamed guide"}
                        </p>
                        <p className="truncate text-xs text-muted">{g.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <IslandCell islands={g.islands} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {g.specialties.slice(0, 2).map((s) => (
                        <Chip key={s}>{s}</Chip>
                      ))}
                      {g.specialties.length > 2 && (
                        <span className="text-xs text-muted">
                          +{g.specialties.length - 2}
                        </span>
                      )}
                      {g.specialties.length === 0 && (
                        <span className="text-muted">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted">{fmtDate(g.created_at)}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={g.verification_status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/guides/${g.id}`}
                      className="inline-flex rounded-lg border border-navy/20 bg-navy/5 px-3 py-2 text-xs font-semibold text-navy hover:bg-navy/10"
                    >
                      {g.verification_status === "pending" ? "Verify Application" : "View Details"}
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    No guides match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-line bg-bg px-5 py-3 text-sm">
            <span className="text-muted">
              Showing {current * PAGE_SIZE + 1}–
              {Math.min(current * PAGE_SIZE + PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={clsx(
                    "h-8 w-8 rounded-lg text-sm font-semibold",
                    i === current
                      ? "bg-brand text-white"
                      : "text-muted hover:bg-card",
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
