import { Bell, User } from "lucide-react";

/** Avatar + name + verified pill, with a notification bell. */
export function GuideHeader({
  name,
  avatarUrl,
  verified,
  subtitle,
}: {
  name: string;
  avatarUrl: string | null;
  verified: boolean;
  subtitle?: string;
}) {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-2">
      <div className="flex items-center gap-2">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card">
            <User size={20} className="text-muted" strokeWidth={1.6} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold text-ink">{name}</span>
            {verified && (
              <span className="rounded-3xl bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-bg">
                Verified
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line text-navy">
        <Bell size={22} strokeWidth={1.8} />
      </button>
    </header>
  );
}
