import Link from "next/link";
import { LayoutGrid, Sailboat, User } from "lucide-react";
import { clsx } from "@/lib/clsx";
import { FEATURES } from "@/lib/features";

// The Trips tab belongs to Week-4 trip logging — shown only when that feature
// flag is on.
const tabs = [
  { href: "/guide/dashboard", label: "Dashboard", icon: LayoutGrid },
  ...(FEATURES.tripLogging
    ? [{ href: "/guide/trips", label: "Trips", icon: Sailboat }]
    : []),
  { href: "/guide/profile",   label: "Profile",   icon: User       },
];

type Active = "dashboard" | "trips" | "profile";

export function BottomNav({ active }: { active: Active }) {
  return (
    <nav className="sticky bottom-0 z-20 flex items-center justify-around border-t border-line bg-bg/85 px-6 py-2 backdrop-blur-md">
      {tabs.map(({ href, label, icon: Icon }) => {
        const on = label.toLowerCase() === active;
        return (
          <Link
            key={label}
            href={href}
            className={clsx(
              "flex flex-col items-center gap-1 text-xs",
              on ? "text-brand" : "text-muted",
            )}
          >
            <Icon size={20} strokeWidth={2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
