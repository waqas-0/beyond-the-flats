"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, Pencil, Check, X, ImagePlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CatchPhoto } from "@/lib/supabase/types";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
const CAPTION_MAX = 120;

function fmtDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}

// Guide dashboard — recent catches.
// Compose-first: choose a photo → preview it and write the caption → Post.
// Nothing is uploaded or published until Post is pressed.
export function CatchPhotosManager() {
  const [photos, setPhotos] = useState<CatchPhoto[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Draft post (not yet uploaded)
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [draftPreview, setDraftPreview] = useState<string | null>(null);
  const [draftCaption, setDraftCaption] = useState("");
  const [posting, setPosting] = useState(false);

  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/guide/catch-photos")
      .then((r) => r.json())
      .then((json) => {
        if (active) setPhotos(json.photos ?? []);
      })
      .catch(() => {
        if (active) setPhotos([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Release the object URL when the draft changes or unmounts.
  useEffect(() => {
    return () => {
      if (draftPreview) URL.revokeObjectURL(draftPreview);
    };
  }, [draftPreview]);

  function chooseFile(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Photos must be 10MB or smaller.");
      return;
    }
    setError(null);
    if (draftPreview) URL.revokeObjectURL(draftPreview);
    setDraftFile(file);
    setDraftPreview(URL.createObjectURL(file));
    setDraftCaption("");
  }

  function discardDraft() {
    if (draftPreview) URL.revokeObjectURL(draftPreview);
    setDraftFile(null);
    setDraftPreview(null);
    setDraftCaption("");
    setError(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  async function post() {
    if (!draftFile) return;
    setError(null);
    setPosting(true);
    try {
      const res = await fetch("/api/guide/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "catch_photo",
          contentType: draftFile.type,
          size: draftFile.size,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Upload failed.");
      }
      const { bucket, path, token } = await res.json();

      const supabase = createClient();
      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .uploadToSignedUrl(path, token, draftFile, { upsert: true });
      if (uploadErr) throw uploadErr;

      const saveRes = await fetch("/api/guide/catch-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, caption: draftCaption.trim() || null }),
      });
      const saveJson = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) throw new Error(saveJson.error ?? "Failed to save photo.");

      setPhotos((prev) => [saveJson.photo, ...(prev ?? [])]);
      discardDraft();
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Upload failed.");
    } finally {
      setPosting(false);
    }
  }

  async function saveCaption(id: string, caption: string) {
    const res = await fetch(`/api/guide/catch-photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: caption.trim() || null }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return false;
    setPhotos((prev) => (prev ?? []).map((p) => (p.id === id ? json.photo : p)));
    return true;
  }

  async function deletePhoto(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/guide/catch-photos/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      setPhotos((prev) => (prev ?? []).filter((p) => p.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold text-ink">Recent Catches</h2>
        {!!photos?.length && (
          <span className="text-xs font-medium text-muted">
            {photos.length} {photos.length === 1 ? "post" : "posts"}
          </span>
        )}
      </div>

      {/* ── Composer ─────────────────────────────────────────── */}
      {draftFile && draftPreview ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
          <div className="relative aspect-4/5 w-full bg-navy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draftPreview}
              alt="Selected catch"
              className="h-full w-full object-cover"
            />
            <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
              Preview
            </span>
            <button
              onClick={discardDraft}
              disabled={posting}
              aria-label="Remove photo"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-danger disabled:opacity-60"
            >
              <X size={15} />
            </button>
          </div>

          {/* Caption + actions sit below the photo so nothing overlaps it */}
          <div className="p-4">
            <label
              htmlFor="catch-caption"
              className="text-xs font-semibold uppercase tracking-wider text-muted"
            >
              Caption
            </label>
            <textarea
              id="catch-caption"
              value={draftCaption}
              onChange={(e) => setDraftCaption(e.target.value.slice(0, CAPTION_MAX))}
              placeholder="How did the day go? (optional)"
              rows={2}
              disabled={posting}
              className="mt-2 w-full resize-none rounded-xl border border-line bg-bg px-4 py-3 text-sm leading-snug text-ink outline-none placeholder:text-faint focus:border-brand disabled:opacity-60"
            />
            <p className="mt-1 text-right text-[11px] text-faint">
              {draftCaption.length}/{CAPTION_MAX}
            </p>

            {error && (
              <p className="mt-2 rounded-xl bg-danger-soft px-4 py-2.5 text-xs text-danger">
                {error}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                onClick={discardDraft}
                disabled={posting}
                className="min-w-24 flex-1 rounded-full bg-card py-3 text-sm font-semibold text-ink transition-colors hover:bg-line disabled:opacity-60"
              >
                Discard
              </button>
              <button
                onClick={post}
                disabled={posting}
                className="min-w-36 flex-2 rounded-full bg-brand py-3 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-60"
              >
                {posting ? "Saving…" : "Save to profile"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <label className="flex items-center justify-center gap-2 rounded-full bg-navy py-3.5 text-sm font-semibold text-white transition-colors hover:bg-navy/90">
            <Camera size={17} /> Upload Photo
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) chooseFile(file);
              }}
            />
          </label>
          {error && (
            <p className="rounded-xl bg-danger-soft px-4 py-2.5 text-xs text-danger">
              {error}
            </p>
          )}
        </>
      )}

      {/* ── Feed ─────────────────────────────────────────────── */}
      {photos === null ? (
        <div className="space-y-4">
          <Skeleton className="aspect-4/5 w-full rounded-2xl" />
          <Skeleton className="aspect-4/5 w-full rounded-2xl" />
        </div>
      ) : photos.length === 0 ? (
        !draftFile && (
          <div className="rounded-2xl border border-dashed border-line bg-bg px-5 py-10 text-center">
            <ImagePlus size={28} className="mx-auto text-faint" strokeWidth={1.6} />
            <p className="mt-3 text-sm font-semibold text-ink">No catches yet</p>
            <p className="mt-1 text-xs text-muted">
              Share a photo from your last trip — it appears on your public
              profile straight away.
            </p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {photos.map((p) => (
            <CatchPost
              key={p.id}
              photo={p}
              deleting={deletingId === p.id}
              onSaveCaption={(caption) => saveCaption(p.id, caption)}
              onDelete={() => deletePhoto(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CatchPost({
  photo,
  deleting,
  onSaveCaption,
  onDelete,
}: {
  photo: CatchPhoto;
  deleting: boolean;
  onSaveCaption: (caption: string) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(photo.caption ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    setSaving(true);
    const ok = await onSaveCaption(value);
    setSaving(false);
    if (ok) setEditing(false);
  }

  return (
    <article className="relative overflow-hidden rounded-2xl bg-navy shadow-sm">
      <div className="relative aspect-4/5 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.photo_url}
          alt={photo.caption ?? "Recent catch"}
          className="h-full w-full object-cover"
        />

        {/* Top: date + delete */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between bg-linear-to-b from-black/55 to-transparent p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/90">
            {fmtDate(photo.created_at)}
          </span>
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onDelete}
                disabled={deleting}
                className="rounded-full bg-danger px-2.5 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                aria-label="Cancel delete"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete photo"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-danger"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {/* Bottom: caption overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-3.5 pb-3.5 pt-10">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value.slice(0, CAPTION_MAX))}
                autoFocus
                placeholder="Write a caption…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") {
                    setValue(photo.caption ?? "");
                    setEditing(false);
                  }
                }}
                className="min-w-0 flex-1 rounded-full bg-white/95 px-3.5 py-2 text-sm text-ink outline-none placeholder:text-faint"
              />
              <button
                onClick={save}
                disabled={saving}
                aria-label="Save caption"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-60"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex w-full items-center gap-2 text-left"
            >
              <span
                className={`line-clamp-2 min-w-0 flex-1 wrap-break-word text-sm leading-snug ${
                  photo.caption ? "text-white" : "italic text-white/60"
                }`}
              >
                {photo.caption ?? "Add a caption…"}
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                <Pencil size={12} />
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
