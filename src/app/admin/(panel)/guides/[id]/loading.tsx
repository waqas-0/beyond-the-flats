import { Skeleton } from "@/components/ui/Skeleton";

// Guide verification review — two-column detail skeleton.
export default function AdminGuideDetailLoading() {
  return (
    <div>
      <Skeleton className="h-4 w-56" />
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-md" />
        <div>
          <Skeleton className="h-7 w-64" />
          <Skeleton className="mt-2 h-3 w-80" />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* Profile card */}
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <Skeleton className="h-24 w-full rounded-none" />
          <div className="px-5 pb-5">
            <Skeleton className="-mt-12 h-20 w-20 rounded-2xl border-4 border-white" />
            <Skeleton className="mt-3 h-6 w-40" />
            <Skeleton className="mt-2 h-5 w-24 rounded-full" />
            <Skeleton className="mt-5 h-3 w-20" />
            <Skeleton className="mt-2 h-14 w-full" />
            <Skeleton className="mt-5 h-12 w-full rounded-xl" />
          </div>
        </div>

        {/* Licence card */}
        <div className="rounded-2xl border border-line bg-white p-5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-4 h-3 w-28" />
          <Skeleton className="mt-3 h-64 w-full rounded-xl" />
        </div>
      </div>

      <div className="mt-6 ml-auto flex max-w-md gap-3">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="h-12 flex-1 rounded-full" />
      </div>
    </div>
  );
}
