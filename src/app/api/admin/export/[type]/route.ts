import { createServiceClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/admin";
import { NextRequest } from "next/server";

// GET /api/admin/export/<type> — download a CSV of a dataset. Admin only.
const EXPORTS: Record<string, { table: string; columns: string[]; order: string }> = {
  guides: {
    table: "guides",
    order: "created_at",
    columns: [
      "id",
      "full_name",
      "phone",
      "verification_status",
      "islands",
      "specialties",
      "years_experience",
      "boat_type",
      "conservation_pledge",
      "created_at",
    ],
  },
  trips: {
    table: "trips",
    order: "created_at",
    columns: [
      "id",
      "guide_id",
      "title",
      "client_name",
      "anglers",
      "permit_ref",
      "location_note",
      "start_time",
      "end_time",
      "created_at",
    ],
  },
  catches: {
    table: "catches",
    order: "logged_at",
    columns: ["id", "trip_id", "species", "count", "logged_at"],
  },
  reviews: {
    table: "reviews",
    order: "created_at",
    columns: ["id", "guide_id", "visitor_name", "stars", "body", "approved", "created_at"],
  },
  scans: {
    table: "qr_scans",
    order: "scanned_at",
    columns: ["id", "guide_id", "scanned_at", "country_code", "user_agent"],
  },
};

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s: string;
  if (Array.isArray(v)) s = v.join("; ");
  else if (typeof v === "object") s = JSON.stringify(v);
  else s = String(v);
  // Neutralize spreadsheet formula injection: a cell starting with =,+,-,@,
  // tab or CR is treated as a formula by Excel/Sheets — prefix with a quote.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { type } = await params;
  const cfg = EXPORTS[type];
  if (!cfg) {
    return Response.json({ error: "Unknown export type." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from(cfg.table)
    .select(cfg.columns.join(","))
    .order(cfg.order, { ascending: false })
    .limit(10000);

  if (error) {
    console.error("[admin/export]", error.message);
    return Response.json({ error: "Export failed." }, { status: 500 });
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  const csv =
    cfg.columns.join(",") +
    "\n" +
    rows.map((r) => cfg.columns.map((c) => csvCell(r[c])).join(",")).join("\n") +
    "\n";

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="btf-${type}.csv"`,
    },
  });
}
