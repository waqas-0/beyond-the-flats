"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";

export function AdminHeader({ email }: { email: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/admin" className="flex items-center gap-2 text-navy">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-white">
            <ShieldCheck size={18} strokeWidth={1.9} />
          </span>
          <span className="text-lg font-bold text-ink">BTF Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[40vw] truncate text-sm text-muted sm:inline">
            {email}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-card"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
