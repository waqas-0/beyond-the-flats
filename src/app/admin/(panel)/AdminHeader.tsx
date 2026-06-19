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
    </header>
  );
}
