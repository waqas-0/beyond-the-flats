import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/Skeleton";

// Guide dashboard — shown while the guide profile, reviews, and stats load.
export default function GuideDashboardLoading() {
  return (
    <AppShell homeIndicator={false}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pb-4 pt-2">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-9 px-4 pb-8 pt-4">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>

        {/* Season performance */}
        <div className="space-y-4">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>

        {/* Ratings */}
        <div className="space-y-3">
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>

      <BottomNav active="dashboard" />
    </AppShell>
  );
}
