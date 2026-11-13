"use client";

import { useRef, useState } from "react";
import { Loader2, Pencil, Plus, Star, Trash2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractYoutubeVideoId } from "@/lib/youtube";
import { NEWS_HIGHLIGHT_CATEGORIES } from "@/lib/validations";
import type { NewsHighlight } from "@/types/ministry";
import { BookCoverImage } from "@/components/books/BookCoverImage";

type Category = NewsHighlight["category"];

type FormState = {
  titleEn: string;
  titleAm: string;
  category: Category;
  locationLabel: string;
  publishedDateLabel: string;
  imageUrl: string;
  videoUrl: string;
  summaryEn: string;
  summaryAm: string;
  contentEn: string;
  contentAm: string;
  isPinnedLeadStory: boolean;
};

const EMPTY_FORM: FormState = {
  titleEn: "",
  titleAm: "",
  category: NEWS_HIGHLIGHT_CATEGORIES[0],
  locationLabel: "",
  publishedDateLabel: "",
  imageUrl: "",
  videoUrl: "",
  summaryEn: "",
  summaryAm: "",
  contentEn: "",
  contentAm: "",
  isPinnedLeadStory: false,
};

function toForm(update: NewsHighlight): FormState {
  return {
    titleEn: update.titleEn,
    titleAm: update.titleAm,
    category: update.category,
    locationLabel: update.locationLabel,
    publishedDateLabel: update.publishedDateLabel,
    imageUrl: update.imageUrl,
    videoUrl: update.videoUrl ?? "",
    summaryEn: update.summaryEn,
    summaryAm: update.summaryAm,
    contentEn: update.contentEn,
    contentAm: update.contentAm,
    isPinnedLeadStory: update.isPinnedLeadStory,
  };
}

/**
 * News & Church Updates Manager (homepage Section 3): a publish/edit
 * studio for "Recent Updates & Highlights" — cover photo upload-or-URL
 * (with an automatic YouTube thumbnail pull when a video link is
 * pasted and no cover is set yet), bilingual summary + full story
 * fields, and a "Pin as #1 Lead Highlight Story" toggle — plus a grid
 * to manage everything already published.
 */
export function AdminUpdatesModule({
  updates,
  onChanged,
}: {
  updates: NewsHighlight[];
  onChanged: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = [...updates].sort((a, b) => {
    const pinDiff = Number(b.isPinnedLeadStory) - Number(a.isPinnedLeadStory);
    return pinDiff !== 0 ? pinDiff : b.createdAt.localeCompare(a.createdAt);
  });

  function startEdit(update: NewsHighlight) {
    setEditingId(update.id);
    setForm(toForm(update));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChosen(file: File | null) {
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.error ?? "Upload failed.");
        return;
      }
      setForm((f) => ({ ...f, imageUrl: result.imageUrl as string }));
    } finally {
      setIsUploading(false);
    }
  }

  /** Pasting a YouTube link/id auto-pulls its `maxresdefault.jpg`
   *  thumbnail as the cover photo — only when no cover is set yet, so
   *  it never overwrites a deliberately uploaded/pasted photo. */
  function handleVideoUrlChange(value: string) {
    setForm((f) => {
      if (f.imageUrl.trim()) return { ...f, videoUrl: value };
      const videoId = extractYoutubeVideoId(value.trim());
      return videoId ? { ...f, videoUrl: value, imageUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` } : { ...f, videoUrl: value };
    });
  }

  async function handleSetPinned(id: string) {
    setBusyId(id);
    try {
      await fetch("/api/updates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinnedLeadStory: true }),
      });
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/updates?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (response.ok) {
        if (editingId === id) cancelEdit();
        onChanged();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!form.titleEn.trim() || !form.summaryEn.trim() || !form.contentEn.trim() || !form.imageUrl.trim()) {
      setError("Headline, Summary, Full Story, and a Cover Photo (upload or URL) are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/updates", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.error ?? "Something went wrong.");
        return;
      }
      cancelEdit();
      onChanged();
    } finally {
      setIsSubmitting(false);
    }
  }

  function field(
    key: keyof Omit<FormState, "category" | "isPinnedLeadStory" | "imageUrl" | "videoUrl">,
    label: string,
    isTextarea = false,
    rows = 2
  ) {
    const value = form[key];
    const id = `admin-update-${key}`;
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
        {isTextarea ? (
          <textarea
            id={id}
            rows={rows}
            value={value}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        ) : (
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-xl font-bold text-navy-900">📰 News & Highlights (Section 3)</h1>

      <div>
        <p className="text-sm font-semibold text-navy-900">Published Updates</p>
        <p className="mt-1 text-xs text-slate-500">
          The update marked <span className="font-semibold text-emerald-700">★ Pinned Lead Story</span> is shown as
          the #1 large story card on the homepage.
        </p>

        {sorted.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing here yet.</p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((update) => (
              <div
                key={update.id}
                className={cn(
                  "flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm",
                  update.isPinnedLeadStory ? "border-emerald-400 ring-1 ring-emerald-200" : "border-slate-200"
                )}
              >
                <div className="flex gap-3">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-amber-500/30 bg-navy-900">
                    <BookCoverImage src={update.imageUrl} alt={update.titleEn} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-navy-900">{update.titleEn}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{update.summaryEn}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-semibold text-navy-700">
                    {update.category}
                  </span>
                  {update.isPinnedLeadStory && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      <Star className="h-3 w-3 fill-emerald-700 text-emerald-700" aria-hidden="true" />
                      Pinned Lead Story
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-2">
                  {!update.isPinnedLeadStory && (
                    <button
                      type="button"
                      onClick={() => handleSetPinned(update.id)}
                      disabled={busyId === update.id}
                      className="flex items-center gap-1 rounded-lg border border-emerald-300 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden="true" />
                      Pin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(update)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(update.id)}
                    disabled={busyId === update.id}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
            {editingId ? <Pencil className="h-4 w-4 text-amber-600" aria-hidden="true" /> : <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />}
            {editingId ? "Edit Church Update" : "Publish New Church Update / Highlight"}
          </p>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Cancel
            </button>
          )}
        </div>

        {/* Cover: upload, paste URL, or auto-pulled from a YouTube link below */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
          <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg border border-amber-500/30 bg-navy-900">
            {form.imageUrl ? (
              <BookCoverImage src={form.imageUrl} alt="Cover preview" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-amber-300">
                No Cover Selected
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">Cover Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
              className="block w-full text-xs text-slate-600"
            />
            {isUploading && (
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Uploading...
              </p>
            )}
            <p className="text-xs text-slate-400">— or —</p>
            <div className="flex items-center gap-2">
              <Upload className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                type="text"
                placeholder="Paste an image URL — or leave blank and paste a YouTube link below"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field("titleEn", "Headline (English)")}
          {field("titleAm", "Headline (Amharic — optional, defaults to English)")}
          <div>
            <label htmlFor="admin-update-category" className="mb-1 block text-xs font-medium text-slate-600">
              Category
            </label>
            <select
              id="admin-update-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {NEWS_HIGHLIGHT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {field("locationLabel", 'Location Badge — e.g. "Washington, D.C. Sanctuary"')}
          {field("publishedDateLabel", 'Date Badge — e.g. "November 2026"')}
          <div>
            <label htmlFor="admin-update-video" className="mb-1 block text-xs font-medium text-slate-600">
              Optional YouTube Video Link / ID
            </label>
            <input
              id="admin-update-video"
              type="text"
              value={form.videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field("summaryEn", "Short Card Summary (English, 2-3 sentences)", true, 3)}
          {field("summaryAm", "Short Card Summary (Amharic — optional)", true, 3)}
          {field("contentEn", "Full Story / Article Body (English)", true, 6)}
          {field("contentAm", "Full Story / Article Body (Amharic — optional)", true, 6)}
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isPinnedLeadStory}
            onChange={(e) => setForm((f) => ({ ...f, isPinnedLeadStory: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          Pin as #1 Lead Highlight Story in Section 3 on the Homepage
        </label>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {editingId ? "Save Changes" : "Publish Church Update"}
        </button>
      </form>
    </div>
  );
}
