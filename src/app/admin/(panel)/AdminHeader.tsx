"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { clsx } from "@/lib/clsx";

const NAV = [
  { href: "/admin", label: "Applications" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/reviews", label: "Reviews" },
];

export function AdminHeader({ email }: { email: string }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
        <Link href="/admin" className="flex items-center gap-2 text-navy">
          <ShieldCheck size={22} strokeWidth={1.9} />
          <span className="text-lg font-bold text-ink">BTF Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:inline">{email}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink hover:bg-card"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-3xl gap-1 px-3 pb-1">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-navy/5 text-navy"
                  : "text-muted hover:bg-card hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
