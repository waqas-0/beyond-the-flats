"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Check, User } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { clsx } from "@/lib/clsx";
import type { Guide } from "@/lib/supabase/types";

const ISLANDS = [
  "Nassau (New Providence)",
  "Grand Bahama",
  "Abaco",
  "Andros",
  "Eleuthera",
  "Exuma",
  "Long Island",
  "Bimini",
  "Berry Islands",
];
const SPECIALTIES = [
  "Bonefish",
  "Tarpon",
  "Permit",
  "Fly Fishing",
  "Deep Sea Fishing",
];

export default function AccountSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [boatType, setBoatType] = useState("");
  const [years, setYears] = useState("");
  const [website, setWebsite] = useState("");
  const [islands, setIslands] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/guide/profile")
      .then((r) => r.json())
      .then(({ guide }: { guide: Guide | null }) => {
        if (!active || !guide) return;
        setName(guide.full_name ?? "");
        setBio(guide.bio ?? "");
        setBoatType(guide.boat_type ?? "");
        setYears(guide.years_experience != null ? String(guide.years_experience) : "");
        setWebsite(guide.website_url ?? "");
        setIslands(guide.islands ?? []);
        setSpecialties(guide.specialties ?? []);
        setAvatarUrl(guide.avatar_url);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const toggle = (
    list: string[],
    set: (v: string[]) => void,
    v: string,
  ) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl;

  async function save() {
    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    setError(null);
    setSaving(true);

    const fd = new FormData();
    fd.append("full_name", name);
    fd.append("bio", bio);
    fd.append("boat_type", boatType);
    if (years.trim()) fd.append("years_experience", years.trim());
    fd.append("website_url", website.trim());
    fd.append("islands", JSON.stringify(islands));
    fd.append("specialties", JSON.stringify(specialties));
    if (avatarFile) fd.append("avatar", avatarFile);

    const res = await fetch("/api/guide/profile", { method: "PATCH", body: fd });
    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Could not save changes. Please try again.");
      return;
    }

    router.push("/guide/profile");
  }

  return (
    <AppShell>
      <div className="flex flex-1 flex-col px-6 pb-8">
        <header className="flex items-center gap-3 pt-2">
          <button onClick={() => router.back()} className="text-ink">
            <ArrowLeft size={26} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-ink">Account Settings</h1>
            <p className="text-sm text-muted">Manage your profile info</p>
          </div>
        </header>

        {loading ? (
          <EditFormSkeleton />
        ) : (
          <>
        <div className="mt-6 flex justify-center">
          <label className="relative cursor-pointer">
            <div className="flex h-22 w-22 items-center justify-center overflow-hidden rounded-full bg-card">
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={40} className="text-muted" strokeWidth={1.6} />
              )}
            </div>
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg bg-navy text-white">
              <Pencil size={13} />
            </span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <label className="mt-6 text-sm font-semibold text-ink">
          Full Legal Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none focus:border-brand"
        />

        <div className="mt-5 flex items-center justify-between">
          <label className="text-sm font-semibold text-ink">Guide Bio</label>
          <span className="text-xs text-faint">{bio.length} / 500</span>
        </div>
        <textarea
          value={bio}
          maxLength={500}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Tell us about your years on the water, your boat, and what makes your trips unique..."
          className="mt-2 w-full resize-none rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
        />

        <div className="mt-5 flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-semibold text-ink">Years Guiding</label>
            <input
              value={years}
              inputMode="numeric"
              onChange={(e) => setYears(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="15"
              className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-ink">Boat Type</label>
            <input
              value={boatType}
              onChange={(e) => setBoatType(e.target.value)}
              placeholder="18ft Hells Bay skiff"
              className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
            />
          </div>
        </div>

        <label className="mt-5 text-sm font-semibold text-ink">
          Personal Website{" "}
          <span className="font-normal text-faint">(optional)</span>
        </label>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          inputMode="url"
          placeholder="www.islandbeyfly.com"
          className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
        />

        <ChipSection title="🏝️ Island Coverage">
          {ISLANDS.map((v) => (
            <Chip
              key={v}
              label={v}
              active={islands.includes(v)}
              onClick={() => toggle(islands, setIslands, v)}
            />
          ))}
        </ChipSection>

        <ChipSection title="🎣 Specialties">
          {SPECIALTIES.map((v) => (
            <Chip
              key={v}
              label={v}
              active={specialties.includes(v)}
              onClick={() => toggle(specialties, setSpecialties, v)}
            />
          ))}
        </ChipSection>

        {error && (
          <p className="mt-6 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          onClick={save}
          disabled={saving || loading}
          className="mt-8 h-14 w-full rounded-full bg-navy text-[15px] font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
          </>
        )}
      </div>
    </AppShell>
  );
}

function EditFormSkeleton() {
  return (
    <div>
      <div className="mt-6 flex justify-center">
        <Skeleton className="h-22 w-22 rounded-full" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="mt-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-2 h-12 w-full rounded-xl" />
        </div>
      ))}
      <div className="mt-5 flex gap-3">
        <Skeleton className="h-16 flex-1 rounded-xl" />
        <Skeleton className="h-16 flex-1 rounded-xl" />
      </div>
      <div className="mt-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <Skeleton className="mt-8 h-14 w-full rounded-full" />
    </div>
  );
}

function ChipSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2.5">{children}</div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active ? "border-brand bg-brand text-white" : "border-line bg-bg text-ink",
      )}
    >
      {label}
      {active && <Check size={14} />}
    </button>
  );
}
