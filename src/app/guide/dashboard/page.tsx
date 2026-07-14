import { CalendarDays, Fish, Star, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { GuideHeader } from "@/components/GuideHeader";
import { DashboardActions } from "@/components/DashboardActions";
import { guideUser } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

export default function GuideDashboardPage() {
  const { stats, upcoming } = guideUser;
  return (
    <AppShell homeIndicator={false}>
      <GuideHeader />

      <div className="flex flex-1 flex-col gap-12 px-4 pb-8 pt-6">
        {/* Welcome */}
        <section className="space-y-2">
          <h1 className="text-[28px] font-bold leading-8 text-ink">
            Good morning,
          </h1>
          <p className="text-base text-muted">
            The tides are peaking at 10:45 AM. It&apos;s a prime day for bonefish
            in the western flats.
          </p>
        </section>

        {/* Status banner + primary action (approval-gated) */}
        <DashboardActions />

        {/* Season performance */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Season Performance</h2>

          <StatCard
            icon={<CalendarDays size={18} className="text-navy" />}
            iconBg="bg-navy/10"
            value={stats.trips}
            label="Trips Completed"
          />
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<Fish size={20} className="text-brand" />}
              iconBg="bg-brand-soft"
              value={stats.fish}
              label="Fish Released"
              stacked
            />
            <StatCard
              icon={<Star size={18} className="text-danger" fill="currentColor" />}
              iconBg="bg-danger-soft"
              value={stats.rating}
              label="Client Rating"
              stacked
            />
          </div>
        </section>

        {/* Upcoming charters */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">Upcoming Charters</h2>
          <div className="space-y-3">
            {upcoming.map((u, i) => (
              <div
                key={u.title}
                className="flex items-center justify-between rounded-xl border border-line bg-bg p-6"
                style={{ opacity: i === 0 ? 1 : 0.7 }}
              >
                <div className="flex items-center gap-6">
                  <div className="rounded-lg bg-faint px-3 py-1 text-center">
                    <p className="text-xs uppercase text-muted">{u.month}</p>
                    <p className="text-2xl text-ink">{u.day}</p>
                  </div>
                  <div>
                    <p className="text-lg text-ink">{u.title}</p>
                    <p className="text-xs text-muted">{u.client}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav active="dashboard" />
    </AppShell>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
  stacked,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
  stacked?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-card p-6 shadow-sm ${
        stacked ? "" : "flex items-center gap-4"
      }`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
      >
        {icon}
      </span>
      <div className={stacked ? "mt-3" : ""}>
        <p className="text-4xl tracking-tight text-ink">{value}</p>
        <p className="text-sm uppercase tracking-wide text-muted">{label}</p>
      </div>
    </div>
  );
}
