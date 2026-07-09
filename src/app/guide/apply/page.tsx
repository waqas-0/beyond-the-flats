"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
  User,
  UploadCloud,
  Upload,
  Info,
  Check,
  CircleCheck,
  BadgeCheck,
  CircleAlert,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
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
const SPECIALTIES = [
  "Bonefish",
  "Tarpon",
  "Permit",
  "Fly Fishing",
  "Deep Sea Fishing",
];

type View = 1 | 2 | 3 | "submitted" | "rejected";

export default function GuideApplyPage() {
  const router = useRouter();
  const [view, setView] = useState<View>(1);
  const [islands, setIslands] = useState<string[]>(["Nassau (New Providence)"]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [pledged, setPledged] = useState(false);

  // Form state collected across steps
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [boatType, setBoatType] = useState("");
  const [years, setYears] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggle = (
    list: string[],
    set: (v: string[]) => void,
    v: string,
  ) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const step = typeof view === "number" ? view : 3;

  async function submit() {
    setSubmitError(null);
    setSubmitting(true);

    const fd = new FormData();
    fd.append("full_name", fullName);
    fd.append("bio", bio);
    fd.append("boat_type", boatType);
    if (years.trim()) fd.append("years_experience", years.trim());
    fd.append("islands", JSON.stringify(islands));
    fd.append("specialties", JSON.stringify(specialties));
    fd.append("conservation_pledge", String(pledged));
    if (avatarFile) fd.append("avatar", avatarFile);
    if (licenseFile) fd.append("license", licenseFile);

    try {
      const res = await fetch("/api/guide/apply", { method: "POST", body: fd });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setSubmitError(json.error ?? "Submission failed. Please try again.");
        return;
      }
      setView("submitted");
    } catch {
      setSubmitError(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="relative flex flex-1 flex-col px-6 pb-6">
        {/* Header: logo + back (steps 2/3) */}
        {view !== 1 && (
          <div className="relative mt-2 flex items-center justify-center">
            <button
              onClick={() => setView(step > 1 ? ((step - 1) as View) : 1)}
              className="absolute left-0 text-ink"
            >
              <ArrowLeft size={24} />
            </button>
            <Logo size="sm" />
          </div>
        )}

        {/* Progress */}
        <div className={clsx(view === 1 ? "mt-2" : "mt-6")}>
          <p className="text-sm font-medium text-ink">Step {step} of 3</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-faint/50">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {view === 1 && (
          <StepOne
            fullName={fullName}
            setFullName={setFullName}
            bio={bio}
            setBio={setBio}
            boatType={boatType}
            setBoatType={setBoatType}
            years={years}
            setYears={setYears}
            avatarFile={avatarFile}
            setAvatarFile={setAvatarFile}
            islands={islands}
            specialties={specialties}
            toggleIsland={(v) => toggle(islands, setIslands, v)}
            toggleSpecialty={(v) => toggle(specialties, setSpecialties, v)}
            onContinue={() => setView(2)}
          />
        )}
        {view === 2 && (
          <StepTwo
            licenseFile={licenseFile}
            setLicenseFile={setLicenseFile}
            onContinue={() => setView(3)}
          />
        )}
        {view === 3 && (
          <StepThree
            pledged={pledged}
            setPledged={setPledged}
            submitting={submitting}
            error={submitError}
            onContinue={submit}
          />
        )}

        {view === "submitted" && (
          <Overlay>
            <SubmittedCard
              onDone={async () => {
                await fetch("/api/auth/signout", { method: "POST" });
                router.push("/guide/signin");
              }}
            />
          </Overlay>
        )}
        {view === "rejected" && (
          <Overlay>
            <RejectedCard onResubmit={() => setView(2)} />
          </Overlay>
        )}
      </div>
    </AppShell>
  );
}

/* ---------- Step 1 ---------- */
function StepOne({
  fullName,
  setFullName,
  bio,
  setBio,
  boatType,
  setBoatType,
  years,
  setYears,
  avatarFile,
  setAvatarFile,
  islands,
  specialties,
  toggleIsland,
  toggleSpecialty,
  onContinue,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  boatType: string;
  setBoatType: (v: string) => void;
  years: string;
  setYears: (v: string) => void;
  avatarFile: File | null;
  setAvatarFile: (f: File | null) => void;
  islands: string[];
  specialties: string[];
  toggleIsland: (v: string) => void;
  toggleSpecialty: (v: string) => void;
  onContinue: () => void;
}) {
  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : null;

  return (
    <>
      <h1 className="mt-5 text-[26px] font-bold leading-tight text-ink">
        Complete Your Guide Profile
      </h1>
      <p className="mt-1 text-sm text-muted">
        Introduce yourself to potential clients.
      </p>

      <div className="mt-6 flex flex-col items-center">
        <label className="relative cursor-pointer">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-card">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <User size={40} className="text-muted" strokeWidth={1.6} />
            )}
          </div>
          <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg bg-navy text-white">
            <Pencil size={13} />
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <span className="mt-2 text-sm font-semibold text-brand">
          Upload Profile Photo
        </span>
      </div>

      <Field label="Full Legal Name">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Captain James Sterling"
          className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
        />
      </Field>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-ink">Guide Bio</label>
          <span className="text-xs text-faint">{bio.length} / 500</span>
        </div>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="Tell us about your years on the water, your boat, and what makes your trips unique..."
          className="mt-2 w-full resize-none rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
        />
      </div>

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
            placeholder="18ft skiff"
            className="mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
          />
        </div>
      </div>

      <ChipGroup title="🏝️ Island Coverage">
        {ISLANDS.map((v) => (
          <Chip
            key={v}
            label={v}
            active={islands.includes(v)}
            onClick={() => toggleIsland(v)}
          />
        ))}
      </ChipGroup>

      <ChipGroup title="🎣 Specialties">
        {SPECIALTIES.map((v) => (
          <Chip
            key={v}
            label={v}
            active={specialties.includes(v)}
            onClick={() => toggleSpecialty(v)}
          />
        ))}
      </ChipGroup>

      <Button
        variant="primary"
        className="mt-8"
        onClick={onContinue}
        disabled={!fullName.trim()}
      >
        Continue <ArrowRight size={18} />
      </Button>
    </>
  );
}

/* ---------- Step 2 ---------- */
function StepTwo({
  licenseFile,
  setLicenseFile,
  onContinue,
}: {
  licenseFile: File | null;
  setLicenseFile: (f: File | null) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <h1 className="mt-7 text-4xl font-bold text-ink">License Verification</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        To ensure safety and maritime compliance please provide a clear digital
        copy of your captain&apos;s or professional guide license
      </p>

      <label className="mt-7 block cursor-pointer rounded-2xl border border-line p-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-card">
          <UploadCloud size={34} className="text-navy" strokeWidth={1.8} />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-ink">Upload License</h2>
        {licenseFile ? (
          <p className="mt-2 text-sm font-medium text-brand">{licenseFile.name}</p>
        ) : (
          <p className="mt-2 text-base text-muted">
            Drag and drop your file here, or use the options below to capture or
            select.
          </p>
        )}
        <span className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white">
          <Upload size={18} /> {licenseFile ? "Change File" : "Choose File"}
        </span>
        <p className="mt-4 text-sm text-faint">
          Supported formats: JPG, PNG, PDF (Max 10MB)
        </p>
        <input
          type="file"
          accept="image/*,.pdf"
          className="sr-only"
          onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="mt-5 rounded-2xl border border-dashed border-line p-5">
        <h3 className="flex items-center gap-2 text-xl font-bold text-ink">
          <Info size={20} className="text-danger" /> Guidelines for success:
        </h3>
        <ul className="mt-3 space-y-2 text-base text-muted">
          {[
            "Ensure all four corners are visible",
            "Text must be sharp and legible",
            "Avoid glare or deep shadows",
          ].map((g) => (
            <li key={g} className="flex gap-2">
              <span className="text-brand">•</span> {g}
            </li>
          ))}
        </ul>
      </div>

      <Button variant="primary" className="mt-7" onClick={onContinue} disabled={!licenseFile}>
        Continue <ArrowRight size={18} />
      </Button>
    </>
  );
}

function StepThree({
  pledged,
  setPledged,
  submitting,
  error,
  onContinue,
}: {
  pledged: boolean;
  setPledged: (v: boolean) => void;
  submitting: boolean;
  error: string | null;
  onContinue: () => void;
}) {
  return (
    <>
      <h1 className="mt-5 text-[26px] font-bold leading-tight text-ink">
        Conservation Pledge
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        As a certified maritime guide, you play a role in protecting our coastal
        ecosystems for future generations.
      </p>

      <div className="mt-5 rounded-2xl border border-line p-5">
        <h2 className="text-lg font-bold text-ink">
          Catch &amp; Release Commitment
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Our sustainability standards are designed to minimize the impact of
          recreational fishing on local populations. This commitment ensures
          that your clients understand the importance of maritime balance while
          enjoying the thrill of the sport.
        </p>
        <ul className="mt-4 space-y-3 text-sm font-medium text-ink">
          {[
            "Use of barbless hooks for all catch-and-release sessions.",
            "Strict adherence to local seasonal harvest limits.",
            "Proper handling techniques to ensure survival rates.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <CircleCheck size={18} className="mt-0.5 shrink-0 text-brand" /> {t}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => setPledged(!pledged)}
        className="mt-5 flex items-start gap-3 text-left"
      >
        <span
          className={clsx(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
            pledged ? "border-brand bg-brand text-white" : "border-faint",
          )}
        >
          {pledged && <Check size={14} />}
        </span>
        <span className="text-sm text-ink">
          I pledge to handle all fish with care and follow maritime conservation
          standards.
        </span>
      </button>
      <p className="mt-2 pl-8 text-xs text-faint">
        By checking this, you agree to uphold these standards on every guided
        excursion.
      </p>

      {error && (
        <p className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        className="mt-7"
        onClick={onContinue}
        disabled={!pledged || submitting}
      >
        {submitting ? "Submitting…" : <>Continue <ArrowRight size={18} /></>}
      </Button>
    </>
  );
}

/* ---------- Result overlays ---------- */
function SubmittedCard({ onDone }: { onDone: () => void }) {
  return (
    <div className="w-full rounded-3xl bg-white p-7 text-center shadow-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-soft">
        <BadgeCheck size={34} className="text-brand" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-ink">You&apos;re submitted!</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        We&apos;ll review your licence and notify you on WhatsApp within 24 hours.
      </p>
      <Button variant="primary" className="mt-6" onClick={onDone}>
        Done
      </Button>
    </div>
  );
}

function RejectedCard({ onResubmit }: { onResubmit: () => void }) {
  return (
    <div className="w-full rounded-3xl bg-white p-7 shadow-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-danger text-danger">
        <CircleAlert size={32} />
      </div>
      <h2 className="mt-4 text-center text-2xl font-bold text-ink">
        Not Approved!
      </h2>
      <p className="mt-2 text-center text-sm text-muted">
        Unfortunately, your account doesn&apos;t get approved due to below reason
      </p>

      <h3 className="mt-6 text-lg font-bold text-ink">License Verification</h3>
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-faint p-3">
        <div className="h-14 w-16 shrink-0 rounded-md bg-card" />
        <div>
          <p className="text-base font-semibold text-ink">License_2026</p>
          <p className="text-sm text-muted">250kb</p>
          <button className="mt-1 rounded-md border border-line px-2 py-0.5 text-xs font-medium text-ink">
            Choose File
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl border-l-4 border-danger bg-danger-soft p-3">
        <p className="flex gap-2 text-xs italic text-muted">
          <CircleAlert size={16} className="shrink-0 text-danger" />
          Your uploaded pictures are blurry and not visible enough kindly upload
          clear images
        </p>
        <p className="mt-1 text-right text-xs font-bold text-ink">
          Admin Comment
        </p>
      </div>

      <div className="mt-5 border-t border-line pt-5">
        <Button variant="primary" onClick={onResubmit}>
          Submit Again
        </Button>
      </div>
    </div>
  );
}

/* ---------- Shared bits ---------- */
function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-6">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <label className="text-sm font-semibold text-ink">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function ChipGroup({
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
        active
          ? "border-brand bg-brand text-white"
          : "border-line bg-bg text-ink",
      )}
    >
      {label}
      {active && <Check size={14} />}
    </button>
  );
}
