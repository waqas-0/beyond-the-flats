import { Skeleton } from "@/components/ui/Skeleton";

// Shown (via the (panel) layout's Suspense boundary) while any admin page
// fetches its data server-side. Neutral layout: heading + stat cards + a table.
export default function AdminPanelLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-white p-5">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="p-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
        <div className="border-t border-line">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
