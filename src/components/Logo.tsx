import Image from "next/image";
import { clsx } from "@/lib/clsx";
import logo from "../../public/brand/logo.png";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  priority?: boolean;
};

/** Pixel widths matched to the Figma logo usage per screen. */
const widths = { sm: 132, md: 190, lg: 256 } as const;

/** The "BEYOND THE FLATS / BAHAMAS" gradient wordmark (exported from Figma). */
export function Logo({ size = "md", className, priority }: LogoProps) {
  const w = widths[size];
  return (
    <Image
      src={logo}
      alt="Beyond The Flats — Bahamas"
      width={w}
      height={Math.round((w * 303) / 885)}
      priority={priority}
      className={clsx("h-auto", className)}
    />
  );
}
