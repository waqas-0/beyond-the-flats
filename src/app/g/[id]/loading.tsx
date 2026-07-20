import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Skeleton } from "@/components/ui/Skeleton";

// Public guide profile — shown while the approved guide + reviews load.
export default function PublicGuideLoading() {
  return (
    <AppShell homeIndicator={false}>
      <div className="flex justify-center px-5 pb-3 pt-1">
        <Logo size="sm" priority />
      </div>

      <div className="px-5">
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>

      <div className="px-5 pt-4">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="mt-2 h-4 w-40" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
        <Skeleton className="mt-4 h-16 w-full" />
      </div>

      <div className="px-5 pt-5">
        <Skeleton className="h-28 w-full rounded-2xl" />
      </div>

      <div className="space-y-3 px-5 pt-7">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </AppShell>
  );
}
