"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { clsx } from "@/lib/clsx";

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
const SPECIALTIES = ["Bonefish", "Tarpon", "Permit", "Fly Fishing", "Deep Sea Fishing"];

export default function AdminNewGuidePage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [boatType, setBoatType] = useState("");
  const [years, setYears] = useState("");
  const [website, setWebsite] = useState("");
  const [islands, setIslands] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function save() {
    if (!fullName.trim()) return setError("Full name is required.");
    if (!phone.trim()) return setError("Phone number is required.");
    setError(null);
    setSaving(true);
    const res = await fetch("/api/admin/guides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        phone,
        bio,
        boat_type: boatType || null,
        years_experience: years.trim() ? Number(years.trim()) : null,
        website_url: website.trim() || null,
        islands,
        specialties,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "Could not create the guide.");
      return;
    }
    router.push(`/admin/guides/${json.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/directory"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> Manage Guides
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-ink">Add a Guide</h1>
      <p className="mt-1 text-sm text-muted">
        Register a guide on their behalf. They can sign in later with this phone
        number via a one-time SMS code.
      </p>

      <div className="mt-6 space-y-5 rounded-2xl border border-line bg-white p-5">
        <Field label="Full Legal Name" required>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Captain James Sterling"
            className={inputCls}
          />
        </Field>
        <Field label="Phone Number" required>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="+1 242 555-0123"
            className={inputCls}
          />
        </Field>
        <Field label="Guide Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Years on the water, boat, what makes their trips unique…"
            className={clsx(inputCls, "resize-none")}
          />
        </Field>
        <div className="flex gap-3">
          <Field label="Years Guiding" className="flex-1">
            <input
              value={years}
              inputMode="numeric"
              onChange={(e) => setYears(e.target.value.replace(/\D/g, "").slice(0, 2))}
              placeholder="15"
              className={inputCls}
            />
          </Field>
          <Field label="Boat Type" className="flex-1">
            <input
              value={boatType}
              onChange={(e) => setBoatType(e.target.value)}
              placeholder="18ft Hells Bay skiff"
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Personal Website (optional)">
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            inputMode="url"
            placeholder="www.islandbeyfly.com"
            className={inputCls}
          />
        </Field>

        <ChipGroup title="Island Coverage">
          {ISLANDS.map((v) => (
            <Chip key={v} label={v} active={islands.includes(v)} onClick={() => toggle(islands, setIslands, v)} />
          ))}
        </ChipGroup>
        <ChipGroup title="Specialties">
          {SPECIALTIES.map((v) => (
            <Chip key={v} label={v} active={specialties.includes(v)} onClick={() => toggle(specialties, setSpecialties, v)} />
          ))}
        </ChipGroup>

        {error && (
          <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="h-12 w-full rounded-full bg-navy text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-60"
        >
          {saving ? "Creating…" : "Create Guide"}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand";

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="text-sm font-semibold text-ink">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function ChipGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "border-brand bg-brand text-white" : "border-line bg-bg text-ink",
      )}
    >
      {label}
      {active && <Check size={13} />}
    </button>
  );
}
