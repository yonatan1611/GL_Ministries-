"use client";

import { useState } from "react";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SERMON_TOPICS } from "@/lib/validations";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Sermon } from "@/types/ministry";

type FormState = {
  youtubeUrlOrId: string;
  titleEn: string;
  speakerEn: string;
  topic: (typeof SERMON_TOPICS)[number];
};

const EMPTY_FORM: FormState = { youtubeUrlOrId: "", titleEn: "", speakerEn: "", topic: "New Upload" };

export function AdminSermonsTab({
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

  const sorted = [...sermons].sort((a, b) => b.yearLabel.localeCompare(a.yearLabel));

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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-navy-900">
            {dict.admin.totalLabel}: {sermons.length}
          </p>
          <div className="flex items-center gap-3">
            {syncMessage && <p className="text-xs text-slate-500">{syncMessage}</p>}
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
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">{dict.admin.noDataLabel}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Speaker</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">YouTube</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((sermon) => (
                  <tr key={sermon.id}>
                    <td className="px-4 py-3 font-medium text-navy-900">
                      {locale === "am" ? sermon.titleAm : sermon.titleEn}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{sermon.speakerEn}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-700">
                        {sermon.topic}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{sermon.yearLabel}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`https://www.youtube.com/watch?v=${sermon.youtubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-amber-700 hover:underline"
                      >
                        {sermon.youtubeId}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleAddSermon} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
          <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />
          {dict.admin.addSermonTitle}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
