import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/Skeleton";

// Browse guides — shown while the approved-guide list loads.
export default function GuidesBrowseLoading() {
  return (
    <AppShell homeIndicator={false}>
      <div className="flex items-center gap-3 px-5 pb-2 pt-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Logo size="sm" />
      </div>
      <div className="px-5 pb-8">
        <div className="mt-2 rounded-2xl bg-ocean-deep bg-linear-to-br from-ocean-deep via-ocean-deep to-ocean p-5">
          <Skeleton className="h-6 w-28 rounded-full opacity-20" />
          <Skeleton className="mt-3 h-7 w-full opacity-20" />
          <Skeleton className="mt-2 h-4 w-5/6 opacity-20" />
          <div className="mt-5 flex gap-5 border-t border-white/10 pt-4">
            <Skeleton className="h-9 w-20 opacity-20" />
            <Skeleton className="h-9 w-20 opacity-20" />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-1.5 h-3 w-full" />
          </div>
        </div>

        <Skeleton className="mt-6 h-5 w-28" />
        <div className="mt-3.5 space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5"
            >
              <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2 h-3 w-20" />
                <Skeleton className="mt-2 h-3 w-14" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
          ))}
        </div>

        <Skeleton className="mt-6 h-5 w-36" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-3 w-28" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
