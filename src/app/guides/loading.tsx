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
        <Skeleton className="mt-2 h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-40" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
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
