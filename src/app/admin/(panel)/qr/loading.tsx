import { Skeleton } from "@/components/ui/Skeleton";

// QR Management — grid of guide QR cards.
export default function AdminQrLoading() {
  return (
    <div>
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-80" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-white p-2">
            <Skeleton className="mx-3 mt-2 h-4 w-32" />
            <div className="mt-4 rounded-[20px] bg-card p-6">
              <Skeleton className="mx-auto h-5 w-40" />
              <Skeleton className="mx-auto mt-4 h-44 w-44 rounded-xl" />
              <Skeleton className="mx-auto mt-4 h-4 w-full" />
              <div className="mt-5 flex gap-3">
                <Skeleton className="h-11 flex-1 rounded-full" />
                <Skeleton className="h-11 flex-1 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
