import { clsx } from "@/lib/clsx";

/** Shimmering placeholder block. Compose with width/height/rounded classes. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={clsx("animate-pulse rounded-lg bg-line", className)}
    />
  );
}
