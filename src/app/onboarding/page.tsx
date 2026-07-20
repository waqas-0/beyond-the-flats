import Image from "next/image";
import { ArrowRight, Download } from "lucide-react";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import guideAvatar from "../../../public/photos/guide-avatar.png";
import captain from "../../../public/photos/captain-elias.png";

export const metadata: Metadata = { title: "Welcome" };

export default function OnboardingPage() {
  return (
    <AppShell>
      <div className="flex flex-1 flex-col px-7">
        <div className="mt-10 flex justify-center">
          <Logo size="md" priority />
        </div>

        <h1 className="mt-12 text-center text-[28px] font-bold leading-tight text-ink">
          Authentic Bahamas Fishing Guides
        </h1>

        <div className="mt-auto space-y-3.5">
          <Button href="/guide/signin" variant="primary">
            Continue as Guide <ArrowRight size={18} />
          </Button>
          <Button href="/guides" variant="secondary">
            Explore as Visitor
          </Button>

          <div className="flex items-center gap-4 py-1 text-xs font-medium uppercase tracking-wider text-faint">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button variant="outline">
            <Download size={18} /> Install App
          </Button>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 pb-6 text-center">
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2.5">
              {[guideAvatar, captain, guideAvatar].map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt=""
                  className="h-7 w-7 rounded-full border-2 border-bg object-cover"
                />
              ))}
            </div>
            <span className="text-sm font-medium text-ink">
              Trusted by 500+ Local Guides
            </span>
          </div>
          <p className="max-w-[17rem] text-xs leading-relaxed text-faint">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
