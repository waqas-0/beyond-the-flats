import { WifiOff } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";

export default function OfflinePage() {
  return (
    <AppShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <Logo size="md" />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card">
            <WifiOff size={36} className="text-muted" />
          </div>
          <h1 className="text-2xl font-bold text-ink">You&apos;re Offline</h1>
          <p className="text-base leading-relaxed text-muted">
            No internet connection. Your catch logs are saved locally and will
            sync automatically when you&apos;re back online.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
