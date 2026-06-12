"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Minus,
  Plus,
  Camera,
  Flag,
  MapPinPlus,
  Send,
  Users,
  FileText,
  MapPin,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { QrCode } from "@/components/ui/QrCode";

type Modal = null | "end" | "feedback";

type TripInfo = {
  clientName: string;
  anglers: number;
  permitRef: string;
  location: string;
};

const SPECIES = [
  { name: "Bonefish", start: 8 },
  { name: "Tarpon", start: 2 },
  { name: "Permit", start: 1 },
];

function fmt(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function ActiveTripPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [tripInfo, setTripInfo] = useState<TripInfo>({
    clientName: "",
    anglers: 1,
    permitRef: "",
    location: "",
  });
  const [modal, setModal] = useState<Modal>(null);
  const [counts, setCounts] = useState(SPECIES.map((s) => s.start));
  const [elapsed, setElapsed] = useState(0);
  const [rating, setRating] = useState(0);
  const [endTitle, setEndTitle] = useState("");
  const [endNotes, setEndNotes] = useState("");

  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [started]);

  const bump = (i: number, d: number) =>
    setCounts((c) => c.map((n, idx) => (idx === i ? Math.max(0, n + d) : n)));

  const canStart =
    tripInfo.clientName.trim() !== "" &&
    tripInfo.permitRef.trim() !== "" &&
    tripInfo.location.trim() !== "";

  if (!started) {
    return (
      <AppShell homeIndicator={false}>
        <div className="flex flex-1 flex-col px-5 pb-8">
          <header className="flex items-center gap-3 pt-2">
            <button onClick={() => router.back()} className="text-ink">
              <ArrowLeft size={26} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-ink">Start Trip</h1>
              <p className="text-base text-muted">Enter trip details before departure.</p>
            </div>
          </header>

          <div className="mt-8 space-y-4">
            {/* Client name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wide text-muted">
                Client Name
              </label>
              <input
                value={tripInfo.clientName}
                onChange={(e) =>
                  setTripInfo((t) => ({ ...t, clientName: e.target.value }))
                }
                placeholder="e.g. John Williams"
                className="w-full rounded-2xl border border-line bg-white px-5 py-4 text-base text-ink outline-none placeholder:text-faint focus:border-brand"
              />
            </div>

            {/* Number of anglers */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wide text-muted">
                Number of Anglers
              </label>
              <div className="flex items-center gap-5 rounded-2xl border border-line bg-white px-5 py-3">
                <Users size={20} className="shrink-0 text-muted" />
                <button
                  onClick={() =>
                    setTripInfo((t) => ({
                      ...t,
                      anglers: Math.max(1, t.anglers - 1),
                    }))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-faint/70 text-ink"
                >
                  <Minus size={18} />
                </button>
                <span className="flex-1 text-center text-2xl font-bold tabular-nums text-ink">
                  {tripInfo.anglers}
                </span>
                <button
                  onClick={() =>
                    setTripInfo((t) => ({ ...t, anglers: t.anglers + 1 }))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-brand/40 bg-brand-soft text-brand"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* GOB Permit Reference */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wide text-muted">
                GOB Permit Reference
              </label>
              <div className="relative">
                <FileText
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={tripInfo.permitRef}
                  onChange={(e) =>
                    setTripInfo((t) => ({ ...t, permitRef: e.target.value }))
                  }
                  placeholder="MOAMR invoice / receipt no."
                  className="w-full rounded-2xl border border-line bg-white py-4 pl-12 pr-5 text-base text-ink outline-none placeholder:text-faint focus:border-brand"
                />
              </div>
              <p className="mt-1.5 px-1 text-xs text-faint">
                Government of The Bahamas — MOAMR receipt number from your permit.
              </p>
            </div>

            {/* Location / flat name */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold uppercase tracking-wide text-muted">
                Location / Flat Name
              </label>
              <div className="relative">
                <MapPin
                  size={18}
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  value={tripInfo.location}
                  onChange={(e) =>
                    setTripInfo((t) => ({ ...t, location: e.target.value }))
                  }
                  placeholder="e.g. Bimini Flats, South Andros"
                  className="w-full rounded-2xl border border-line bg-white py-4 pl-12 pr-5 text-base text-ink outline-none placeholder:text-faint focus:border-brand"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10">
            <Button
              variant="primary"
              disabled={!canStart}
              onClick={() => setStarted(true)}
            >
              Start Tracking Trip
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell homeIndicator={false}>
      <div className="flex flex-1 flex-col px-5 pb-6">
        <header className="flex items-center gap-3 pt-2">
          <button onClick={() => router.back()} className="text-ink">
            <ArrowLeft size={26} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-ink">Active Trip</h1>
            <p className="text-base text-muted">
              {tripInfo.clientName} · {tripInfo.anglers}{" "}
              {tripInfo.anglers === 1 ? "angler" : "anglers"}
            </p>
          </div>
        </header>

        {/* Active tracking */}
        <div className="mt-6 rounded-[20px] bg-navy px-6 py-8 text-center text-white">
          <p className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-white/70">
            <span className="h-2 w-2 rounded-full bg-brand" /> Active Tracking
          </p>
          <p className="mt-3 text-[56px] font-bold leading-none tabular-nums">
            {fmt(elapsed)}
          </p>
          <p className="mt-4 text-lg text-white/70">
            {tripInfo.location} • Permit {tripInfo.permitRef}
          </p>
        </div>

        <h2 className="mt-8 text-[28px] font-bold text-ink">Catch Log</h2>

        <div className="mt-4 space-y-4">
          {SPECIES.map((sp, i) => (
            <div
              key={sp.name}
              className="flex items-center justify-between rounded-2xl border border-line bg-bg px-5 py-4"
            >
              <span className="text-xl text-ink">{sp.name}</span>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => bump(i, -1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-faint/70 text-ink"
                >
                  <Minus size={22} />
                </button>
                <span className="w-7 text-center text-2xl tabular-nums text-ink">
                  {String(counts[i]).padStart(2, "0")}
                </span>
                <button
                  onClick={() => bump(i, 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-brand/40 bg-brand-soft text-brand"
                >
                  <Plus size={22} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-card py-5 text-lg font-medium text-brand">
          <Camera size={22} /> Add Photo
        </button>

        <div className="mt-auto pt-10">
          <Button variant="danger" onClick={() => setModal("end")}>
            <Flag size={18} /> End Trip
          </Button>
        </div>
      </div>

      {/* End Trip bottom sheet */}
      {modal === "end" && (
        <Sheet onClose={() => setModal(null)}>
          <h2 className="text-4xl font-bold text-ink">End Trip?</h2>
          <p className="mt-2 text-lg text-muted">
            Add a title and any notes before saving.
          </p>
          <div className="mt-6 space-y-4">
            <input
              value={endTitle}
              onChange={(e) => setEndTitle(e.target.value)}
              placeholder="Trip title"
              className="w-full rounded-2xl border border-line bg-bg px-5 py-4 text-base text-ink outline-none placeholder:text-faint focus:border-brand"
            />
            <textarea
              value={endNotes}
              onChange={(e) => setEndNotes(e.target.value)}
              placeholder="Notes (conditions, highlights…)"
              rows={3}
              className="w-full resize-none rounded-2xl border border-line bg-bg px-5 py-4 text-base text-ink outline-none placeholder:text-faint focus:border-brand"
            />
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-4 text-lg font-medium text-navy">
              <MapPinPlus size={20} /> Confirm Location — {tripInfo.location}
            </button>
          </div>
          <Button
            variant="primary"
            className="mt-6"
            onClick={() => setModal("feedback")}
          >
            <Flag size={18} /> Save & End Trip
          </Button>
        </Sheet>
      )}

      {/* Feedback / QR modal */}
      {modal === "feedback" && (
        <Sheet onClose={() => setModal(null)}>
          <h2 className="text-4xl font-bold text-ink">Request Feedback</h2>
          <p className="mt-2 text-lg text-muted">
            Share the QR code with {tripInfo.clientName} for a quick review.
          </p>

          <p className="mt-6 text-center text-base font-medium uppercase tracking-wide text-ink">
            Your Rating
          </p>
          <div className="mt-3 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} onClick={() => setRating(i)} aria-label={`${i} star`}>
                <Star filled={i <= rating} />
              </button>
            ))}
          </div>

          <h3 className="mt-6 text-center text-3xl font-bold text-ink">
            Feedback QR Code
          </h3>
          <div className="mt-4 flex justify-center">
            <QrCode size={200} />
          </div>
          <p className="mt-4 text-center text-base text-faint">
            Your review will be shared with the Beyond The Flats community.
          </p>

          <Button
            variant="primary"
            className="mt-6"
            onClick={() => router.push("/guide/dashboard")}
          >
            Done <Send size={18} />
          </Button>
        </Sheet>
      )}
    </AppShell>
  );
}

function Sheet({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[28px] bg-white px-6 pb-8 pt-7"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 24 24"
      fill={filled ? "var(--color-brand)" : "none"}
      stroke={filled ? "var(--color-brand)" : "var(--color-faint)"}
      strokeWidth={1.5}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
