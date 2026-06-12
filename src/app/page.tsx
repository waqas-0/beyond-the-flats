"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/onboarding");
    const t = setTimeout(() => router.push("/onboarding"), 2200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <AppShell homeIndicator={false}>
      <div className="flex flex-1 items-center justify-center">
        <Logo size="lg" priority className="animate-pulse" />
      </div>
    </AppShell>
  );
}
