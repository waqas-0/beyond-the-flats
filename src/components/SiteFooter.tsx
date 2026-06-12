import { Logo } from "./Logo";

const platform = ["Join as Guide", "Install App"];
const support = ["Help Center", "Terms of Service", "Privacy Policy", "Contact Support"];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white px-7 pb-10 pt-8">
      <Logo size="sm" className="items-start" />
      <p className="mt-4 max-w-[18rem] text-xs leading-relaxed text-muted">
        The world&apos;s premium directory for technical flats guides.
        Connecting elite anglers with local expertise since 2012.
      </p>

      <div className="mt-7">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Platform
        </h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {platform.map((p) => (
            <span
              key={p}
              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-7">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
          Support
        </h4>
        <ul className="mt-3 space-y-2 text-xs text-muted">
          {support.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <p className="mt-8 border-t border-line pt-5 text-[11px] text-muted">
        © 2026 FlatsGuide International. All rights reserved.
      </p>
    </footer>
  );
}
