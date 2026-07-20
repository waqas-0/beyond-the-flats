import { clsx } from "@/lib/clsx";

/** Shimmering placeholder block (see `.skeleton` in globals.css).
 *  Compose with width/height/rounded classes. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={clsx("skeleton rounded-lg", className)} />;
}
