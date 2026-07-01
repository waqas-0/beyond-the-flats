"use client";

import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { clsx } from "@/lib/clsx";

export function ReviewForm({ guideId }: { guideId: string }) {
  const [name, setName] = useState("");
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || stars < 1) {
      setError("Please add your name and a star rating.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guide_id: guideId, visitor_name: name, stars, body: text }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand/30 bg-brand-soft p-5 text-center">
        <BadgeCheck size={28} className="mx-auto text-brand" />
        <p className="mt-2 text-sm font-semibold text-ink">Thanks for your review!</p>
        <p className="mt-1 text-xs text-muted">
          It will appear once our team approves it.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line p-5">
      <h2 className="text-lg font-bold text-ink">Leave a review</h2>

      <div className="mt-3 flex justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setStars(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="p-0.5"
          >
            <Star
              size={30}
              className={clsx(
                (hover || stars) >= n ? "text-gold" : "text-faint",
              )}
              fill={(hover || stars) >= n ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="mt-4 w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="How was your trip? (optional)"
        className="mt-3 w-full resize-none rounded-xl border border-line bg-bg px-4 py-3 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
      />

      {error && (
        <p className="mt-3 rounded-xl bg-danger-soft px-4 py-2.5 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
