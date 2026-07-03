import { Download, Users, Sailboat, Fish, Star, QrCode } from "lucide-react";

const EXPORTS = [
  { type: "guides", label: "Guides", desc: "All guides — profile, status, islands, specialties.", icon: Users },
  { type: "trips", label: "Trips", desc: "Trip logs — client, permit, location, times.", icon: Sailboat },
  { type: "catches", label: "Catches", desc: "Species counts logged per trip.", icon: Fish },
  { type: "reviews", label: "Reviews", desc: "Visitor reviews and moderation status.", icon: Star },
  { type: "scans", label: "QR Scans", desc: "Public-profile scan analytics.", icon: QrCode },
];

export default function AdminExportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Export Data</h1>
      <p className="mt-1 text-sm text-muted">
        Download platform datasets as CSV for reporting and backups.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {EXPORTS.map((e) => {
          const Icon = e.icon;
          return (
            <div
              key={e.type}
              className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card text-navy">
                <Icon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{e.label}</p>
                <p className="text-xs leading-relaxed text-muted">{e.desc}</p>
              </div>
              <a
                href={`/api/admin/export/${e.type}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy/90"
              >
                <Download size={15} /> CSV
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
