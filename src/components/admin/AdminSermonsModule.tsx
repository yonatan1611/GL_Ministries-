"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, RefreshCcw, Star, Trash2 } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SERMON_TOPICS } from "@/lib/validations";
import { extractYoutubeVideoId, getYoutubeThumbnailUrl } from "@/lib/youtube";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Sermon } from "@/types/ministry";
import { MinistryImage } from "@/components/ui/MinistryImage";

type ChannelSource = Sermon["channelSource"];
type ChannelFilterValue = "all" | ChannelSource;

type FormState = {
  youtubeUrlOrId: string;
  titleEn: string;
  speakerEn: string;
  topic: (typeof SERMON_TOPICS)[number];
  channelSource: ChannelSource;
};

const EMPTY_FORM: FormState = {
  youtubeUrlOrId: "",
  titleEn: "",
  speakerEn: "",
  topic: "New Upload",
  channelSource: "DC",
};

const CHANNEL_LABELS: Record<ChannelSource, string> = {
  DC: "Gospel Light Church, DC",
  ETHIOPIA: "Aware Gospel Light Ethiopia",
};

/**
 * YouTube VOD & Sermon Manager: a dual-channel sync header, an add/edit
 * form with an instant thumbnail preview (auto-extracted from any
 * pasted URL/id), and a filterable, feature/delete-capable table of
 * the full catalog.
 */
export function AdminSermonsModule({
  locale,
  sermons,
  onChanged,
}: {
  locale: Locale;
  sermons: Sermon[];
  onChanged: () => void;
}) {
  const dict = getDictionary(locale);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [channelFilter, setChannelFilter] = useState<ChannelFilterValue>("all");

  const filtered = useMemo(
    () => (channelFilter === "all" ? sermons : sermons.filter((s) => s.channelSource === channelFilter)),
    [sermons, channelFilter]
  );
  const sorted = useMemo(() => [...filtered].sort((a, b) => b.yearLabel.localeCompare(a.yearLabel)), [filtered]);

  const previewVideoId = extractYoutubeVideoId(form.youtubeUrlOrId.trim());

  async function handleSync() {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const response = await fetch("/api/sermons/sync", { method: "POST" });
      const result = await response.json().catch(() => null);
      if (result?.success) {
        setSyncMessage(result.message);
        onChanged();
      }
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleAddSermon(event: React.FormEvent) {
    event.preventDefault();
    if (!form.youtubeUrlOrId.trim()) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrlOrId: form.youtubeUrlOrId,
          titleEn: form.titleEn || undefined,
          speakerEn: form.speakerEn || undefined,
          topic: form.topic,
          channelSource: form.channelSource,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.error ?? "Something went wrong.");
        return;
      }
      setForm(EMPTY_FORM);
      onChanged();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleFeatured(sermon: Sermon) {
    setBusyId(sermon.id);
    try {
      await fetch("/api/sermons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sermon.id, featured: !sermon.featured }),
      });
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/sermons?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (response.ok) onChanged();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-xl font-bold text-navy-900">YouTube VOD & Sermon Manager</h1>

      {/* Dual-channel sync header */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-navy-900">
            {dict.admin.totalLabel}: {sermons.length}
          </p>
          {syncMessage && <p className="text-xs text-slate-500">{syncMessage}</p>}
        </div>
        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCcw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} aria-hidden="true" />
          {isSyncing ? dict.admin.syncingLabel : dict.admin.syncYoutubeButton}
        </button>
      </div>

      {/* Channel filter */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: "all", label: `All Channels (${sermons.length})` },
          { id: "DC", label: `🇺🇸 Gospel Light Church, DC (${sermons.filter((s) => s.channelSource === "DC").length})` },
          { id: "ETHIOPIA", label: `🇪🇹 Addis Ababa HQ (${sermons.filter((s) => s.channelSource === "ETHIOPIA").length})` },
        ] as { id: ChannelFilterValue; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setChannelFilter(tab.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-bold",
              channelFilter === tab.id ? "border-navy-900 bg-navy-900 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500">{dict.admin.noDataLabel}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Speaker</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((sermon) => (
                <tr key={sermon.id}>
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {locale === "am" ? sermon.titleAm : sermon.titleEn}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                        sermon.channelSource === "DC" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {sermon.channelSource === "DC" ? "🇺🇸 DC" : "🇪🇹 Ethiopia"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{sermon.speakerEn}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-700">
                      {sermon.topic}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{sermon.yearLabel}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(sermon)}
                      disabled={busyId === sermon.id}
                      aria-pressed={Boolean(sermon.featured)}
                      className={cn(
                        "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold disabled:opacity-60",
                        sermon.featured ? "bg-emerald-50 text-emerald-700" : "border border-slate-300 text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      <Star className={cn("h-3 w-3", sermon.featured && "fill-emerald-700")} aria-hidden="true" />
                      {sermon.featured ? "Featured" : "Feature"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-amber-700 hover:underline"
                      >
                        {sermon.youtubeId}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(sermon.id)}
                        disabled={busyId === sermon.id}
                        aria-label="Delete sermon"
                        className="text-red-600 hover:text-red-800 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleAddSermon} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
          <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />
          {dict.admin.addSermonTitle}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[96px_1fr]">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-amber-500/30 bg-navy-900">
            {previewVideoId ? (
              <MinistryImage
                src={getYoutubeThumbnailUrl(previewVideoId)}
                alt="Thumbnail preview"
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center text-[9px] text-amber-300">
                No Preview
              </div>
            )}
          </div>
          <div>
            <label htmlFor="admin-sermon-url" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.admin.youtubeUrlLabel}
            </label>
            <input
              id="admin-sermon-url"
              type="text"
              value={form.youtubeUrlOrId}
              onChange={(e) => setForm((f) => ({ ...f, youtubeUrlOrId: e.target.value }))}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="admin-sermon-title" className="mb-1 block text-xs font-medium text-slate-600">
              Title (optional — pulled from YouTube if left blank)
            </label>
            <input
              id="admin-sermon-title"
              type="text"
              value={form.titleEn}
              onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="admin-sermon-speaker" className="mb-1 block text-xs font-medium text-slate-600">
              Speaker (optional)
            </label>
            <input
              id="admin-sermon-speaker"
              type="text"
              value={form.speakerEn}
              onChange={(e) => setForm((f) => ({ ...f, speakerEn: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="admin-sermon-topic" className="mb-1 block text-xs font-medium text-slate-600">
              Topic
            </label>
            <select
              id="admin-sermon-topic"
              value={form.topic}
              onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value as FormState["topic"] }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {SERMON_TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="admin-sermon-channel" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.admin.addSermonChannelLabel}
            </label>
            <select
              id="admin-sermon-channel"
              value={form.channelSource}
              onChange={(e) => setForm((f) => ({ ...f, channelSource: e.target.value as ChannelSource }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {(Object.keys(CHANNEL_LABELS) as ChannelSource[]).map((channel) => (
                <option key={channel} value={channel}>
                  {CHANNEL_LABELS[channel]}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {dict.admin.addSermonButton}
        </button>
      </form>
    </div>
  );
}
