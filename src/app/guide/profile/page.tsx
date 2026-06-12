"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  UserCircle,
  ChevronRight,
  BadgeCheck,
  Download,
  Share2,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/Button";
import { QrCode } from "@/components/ui/QrCode";
import { clsx } from "@/lib/clsx";
import { guideUser } from "@/lib/data";

export default function GuideProfilePage() {
  const router = useRouter();
  const [notify, setNotify] = useState(true);
  const [signOut, setSignOut] = useState(false);

  return (
    <AppShell homeIndicator={false}>
      <header className="flex items-center justify-between px-5 pb-2 pt-2">
        <h1 className="text-[28px] font-bold text-ink">Profile</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line text-navy">
          <Bell size={22} strokeWidth={1.8} />
        </button>
      </header>

      <div className="flex flex-1 flex-col px-5 pb-8">
        {/* Identity */}
        <div className="mt-3 flex flex-col items-center">
          <div className="relative">
            <Image
              src={guideUser.avatar}
              alt={guideUser.name}
              width={88}
              height={88}
              className="h-22 w-22 rounded-full object-cover"
            />
            <span className="absolute -bottom-1 right-0 flex items-center gap-1 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
              <BadgeCheck size={12} /> Verified
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-ink">{guideUser.name}</h2>
          <p className="text-sm text-muted">{guideUser.email}</p>
        </div>

        {/* Settings */}
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
          Settings
        </p>
        <div className="mt-3 space-y-3">
          <Link
            href="/guide/profile/edit"
            className="flex items-center gap-3 rounded-2xl bg-card p-4"
          >
            <UserCircle size={26} className="text-navy" />
            <div className="flex-1">
              <p className="text-base font-semibold text-ink">Account</p>
              <p className="text-xs text-muted">Manage your profile info</p>
            </div>
            <ChevronRight size={20} className="text-muted" />
          </Link>

          <div className="flex items-center gap-3 rounded-2xl bg-card p-4">
            <Bell size={24} className="text-brand" />
            <div className="flex-1">
              <p className="text-base font-semibold text-ink">Notifications</p>
              <p className="text-xs text-muted">Trip alerts &amp; Messages</p>
            </div>
            <button
              onClick={() => setNotify((v) => !v)}
              className={clsx(
                "flex h-7 w-12 items-center rounded-full p-1 transition-colors",
                notify ? "bg-brand" : "bg-faint",
              )}
            >
              <span
                className={clsx(
                  "h-5 w-5 rounded-full bg-white transition-transform",
                  notify && "translate-x-5",
                )}
              />
            </button>
          </div>
        </div>

        {/* QR card */}
        <div className="mt-5 rounded-[20px] bg-card p-6 text-center">
          <h3 className="text-xl font-bold text-ink">Your Guide QR Code</h3>
          <div className="mt-4 flex justify-center">
            <div className="rounded-xl bg-white p-3">
              <QrCode size={176} />
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Allow clients to scan this code to view your availability, rates, and
            recent catches instantly.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Button variant="primary" className="flex-1">
              <Download size={18} /> Download PNG
            </Button>
            <button className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand text-brand">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => setSignOut(true)}
          className="mt-5 flex items-center justify-center gap-2 rounded-full bg-danger-soft py-4 text-base font-semibold text-danger"
        >
          <LogOut size={18} /> Sign Out
        </button>
        <p className="mt-4 text-center text-xs text-faint">Version 1.0.0</p>
      </div>

      <BottomNav active="profile" />

      {signOut && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-8"
          onClick={() => setSignOut(false)}
        >
          <div
            className="w-full max-w-[360px] rounded-3xl bg-white px-6 pb-6 pt-7 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-center text-2xl font-bold text-ink">Sign Out</h3>
            <p className="mt-2 text-center text-base text-muted">
              Are you sure, you want to sign out your account?
            </p>
            <div className="mt-5 flex gap-3 border-t border-line pt-5">
              <button
                onClick={() => setSignOut(false)}
                className="flex-1 rounded-full bg-card py-3 text-base font-semibold text-ink"
              >
                No, Discard
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 rounded-full bg-danger py-3 text-base font-semibold text-white"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
