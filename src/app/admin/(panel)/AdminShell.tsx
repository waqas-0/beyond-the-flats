"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  QrCode,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { clsx } from "@/lib/clsx";

// Admin sidebar per the Figma design.
const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/directory", label: "Manage Guides", icon: Users },
  { href: "/admin/applications", label: "Guide Applications", icon: ClipboardList },
  { href: "/admin/qr", label: "QR Management", icon: QrCode },
];

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  async function logout() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="mt-8 space-y-1.5 px-4">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={clsx(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
              active
                ? "bg-navy text-white shadow-sm"
                : "text-muted hover:bg-white hover:text-ink",
            )}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.9} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg lg:flex">
      {/* Sidebar — static on desktop */}
      <aside className="hidden w-64 shrink-0 bg-[#e8edf2] lg:block">
        <div className="px-6 pt-8 pb-2">
          <Logo size="md" />
        </div>
        {nav}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className="absolute inset-y-0 left-0 w-64 bg-[#e8edf2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6">
              <Logo size="sm" />
              <button onClick={() => setOpen(false)} className="text-muted">
                <X size={22} />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-bg px-5 py-3.5 lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-navy lg:hidden"
          >
            <Menu size={20} />
          </button>

          <div className="relative ml-auto">
            <button
              onClick={() => setMenu((m) => !m)}
              className="flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                {email.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight text-ink">
                  Admin User
                </span>
                <span className="block max-w-[14rem] truncate text-xs text-muted">
                  {email}
                </span>
              </span>
              <ChevronDown size={16} className="text-muted" />
            </button>
            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-line bg-white shadow-lg">
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-danger hover:bg-card"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-7 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
