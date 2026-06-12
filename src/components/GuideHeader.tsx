import Image from "next/image";
import { Bell } from "lucide-react";
import { guideUser } from "@/lib/data";

/** Avatar + name + verified pill + email, with a notification bell. */
export function GuideHeader() {
  return (
    <header className="flex items-center justify-between px-4 pb-2 pt-2">
      <div className="flex items-center gap-2">
        <Image
          src={guideUser.avatar}
          alt={guideUser.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold text-ink">
              {guideUser.name}
            </span>
            {guideUser.verified && (
              <span className="rounded-3xl bg-brand px-1.5 py-0.5 text-[10px] font-semibold text-bg">
                Verified
              </span>
            )}
          </div>
          <p className="text-xs text-muted">{guideUser.email}</p>
        </div>
      </div>
      <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line text-navy">
        <Bell size={22} strokeWidth={1.8} />
      </button>
    </header>
  );
}
