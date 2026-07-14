import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Ticket, ExternalLink, Info } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Fishing Permits" };

// Official Bahamas recreational fishing permit portal. Update this if the
// client provides a different purchase link.
const PERMIT_URL = "https://www.bahamas.gov.bs/fishing";

export default function PermitsPage() {
  return (
    <AppShell homeIndicator={false}>
      <div className="flex items-center gap-3 px-5 pb-2 pt-2">
        <Link href="/" className="text-ink">
          <ArrowLeft size={24} />
        </Link>
        <Logo size="sm" />
      </div>

      <article className="px-5 pb-8">
        <div className="mt-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <Ticket size={26} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-ink">Fishing Permits</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Visiting anglers need a valid fishing permit before getting on the
          water in The Bahamas. It only takes a few minutes to sort out before
          your trip.
        </p>

        <a
          href={PERMIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 block"
        >
          <Button variant="primary" className="w-full uppercase tracking-wide">
            Get your permit <ExternalLink size={16} />
          </Button>
        </a>

        <div className="mt-6 rounded-2xl border border-line bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <Info size={18} className="text-brand" /> Good to know
          </h2>
          <ul className="mt-3 space-y-2.5 text-sm text-muted">
            {[
              "Permits are required for recreational fishing on all Bahamian flats.",
              "Arrange your permit before your scheduled trip — your guide can't fish without one on file.",
              "Keep a copy on your phone; you may be asked to show it on the water.",
            ].map((t) => (
              <li key={t} className="flex gap-2">
                <span className="text-brand">•</span> {t}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-5 text-xs text-faint">
          Questions? Ask your guide — they&apos;ll point you in the right
          direction.
        </p>
      </article>

      <SiteFooter />
    </AppShell>
  );
}
