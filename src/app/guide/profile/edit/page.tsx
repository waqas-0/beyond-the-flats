"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { clsx } from "@/lib/clsx";
import { guideUser } from "@/lib/data";

const ISLANDS = ["Grand Bahama", "Abaco", "Andros", "Eleuthera", "Exuma"];
const SPECIALTIES = [
  "Bonefish",
  "Tarpon",
  "Permit",
  "Fly Fishing",
  "Deep Sea Fishing",
];

export default function AccountSettingsPage() {
  const router = useRouter();
  const [name, setName] = useState(guideUser.name);
  const [bio, setBio] = useState("");
  const [islands, setIslands] = useState<string[]>(["Abaco"]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  const toggle = (
    list: string[],
    set: (v: string[]) => void,
    v: string,
  ) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

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

        <div className="mt-6 flex justify-center">
          <div className="relative">
            <Image
              src={guideUser.avatar}
              alt={guideUser.name}
              width={88}
              height={88}
              className="h-22 w-22 rounded-full object-cover"
            />
            <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg bg-navy text-white">
              <Pencil size={13} />
            </span>
          </div>
        </div>

        <label className="mt-6 text-sm font-semibold text-ink">
          Full Legal Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
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

        {/* License */}
        <h3 className="mt-6 text-base font-bold text-ink">License</h3>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-faint p-3">
          <div className="h-14 w-16 shrink-0 rounded-md bg-card" />
          <div>
            <p className="text-base font-semibold text-ink">License_2026</p>
            <p className="text-sm text-muted">250kb</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/guide/profile")}
          className="mt-8 h-14 w-full rounded-full bg-navy text-[15px] font-semibold text-white"
        >
          Save Changes
        </button>
      </div>
    </AppShell>
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
