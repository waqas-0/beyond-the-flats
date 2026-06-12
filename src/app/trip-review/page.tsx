"use client";

import { useState } from "react";
import { Star, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { clsx } from "@/lib/clsx";

export default function TripReviewPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <AppShell>
      <div className="flex flex-1 flex-col px-5 pb-2 pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="flex flex-1 flex-col"
        >
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-ink">Request for Feedback</h1>
            <p className="mt-1 text-sm text-muted">
              Guide requested to post a feedback
            </p>

            <div className="mt-7 flex flex-col items-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">
                Your Rating
              </p>
              <div className="mt-3 flex gap-3">
                {[1, 2, 3, 4, 5].map((i) => {
                  const active = i <= (hover || rating);
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`${i} star${i > 1 ? "s" : ""}`}
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHover(i)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={34}
                        className={active ? "text-brand" : "text-faint"}
                        fill={active ? "currentColor" : "none"}
                        strokeWidth={active ? 0 : 1.5}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7">
              <label htmlFor="name" className="text-base font-semibold text-ink">
                Your Name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-2 w-full rounded-xl border border-line bg-card px-4 py-3.5 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
              />
            </div>

            <div className="mt-6">
              <label
                htmlFor="review"
                className="text-sm font-bold uppercase tracking-wider text-navy"
              >
                Tell us about the adventure
              </label>
              <textarea
                id="review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
                placeholder="What stood out about your trip? The fish, the equipment, or the Captain's knowledge..."
                className="mt-2 w-full resize-none rounded-xl border border-line bg-card px-4 py-3.5 text-sm text-ink outline-none placeholder:text-faint focus:border-brand"
              />
            </div>

            <p className="mt-5 text-center text-sm text-muted">
              Your review will be shared with the FlatsGuide community.
            </p>
          </div>

          <button
            type="submit"
            className={clsx(
              "mt-auto flex h-14 w-full items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold text-white",
              submitted ? "bg-brand" : "bg-navy",
            )}
          >
            {submitted ? "Review Submitted" : "Submit Reveiw"}
            {!submitted && <Send size={18} />}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
