"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import type { DailyDevotional } from "@/types/ministry";

type FormState = {
  dateLabel: string;
  titleEn: string;
  titleAm: string;
  scriptureRefEn: string;
  scriptureRefAm: string;
  verseTextEn: string;
  verseTextAm: string;
  reflectionEn: string;
  reflectionAm: string;
  prayerDeclarationEn: string;
  prayerDeclarationAm: string;
  authorEn: string;
  authorAm: string;
  isFeaturedToday: boolean;
};

const EMPTY_FORM: FormState = {
  dateLabel: "",
  titleEn: "",
  titleAm: "",
  scriptureRefEn: "",
  scriptureRefAm: "",
  verseTextEn: "",
  verseTextAm: "",
  reflectionEn: "",
  reflectionAm: "",
  prayerDeclarationEn: "",
  prayerDeclarationAm: "",
  authorEn: "Apostle Daniel Makonnen",
  authorAm: "ሐዋሪያው ዳንኤል መኮንን",
  isFeaturedToday: false,
};

function toForm(devotional: DailyDevotional): FormState {
  return {
    dateLabel: devotional.dateLabel,
    titleEn: devotional.titleEn,
    titleAm: devotional.titleAm,
    scriptureRefEn: devotional.scriptureRefEn,
    scriptureRefAm: devotional.scriptureRefAm,
    verseTextEn: devotional.verseTextEn,
    verseTextAm: devotional.verseTextAm,
    reflectionEn: devotional.reflectionEn,
    reflectionAm: devotional.reflectionAm,
    prayerDeclarationEn: devotional.prayerDeclarationEn,
    prayerDeclarationAm: devotional.prayerDeclarationAm,
    authorEn: devotional.authorEn,
    authorAm: devotional.authorAm,
    isFeaturedToday: devotional.isFeaturedToday,
  };
}

/**
 * Daily Scripture Devotional Studio: a live preview card showing
 * exactly how "Today's Key Scripture" currently renders on the
 * homepage, a 1-click "Set as Active" button on any saved devotional,
 * and a full add/edit/delete studio.
 */
export function AdminDevotionalsModule({
  devotionals,
  onChanged,
}: {
  devotionals: DailyDevotional[];
  onChanged: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = [...devotionals].sort((a, b) => Number(b.isFeaturedToday) - Number(a.isFeaturedToday));
  const activeDevotional = sorted.find((d) => d.isFeaturedToday) ?? sorted[0];

  function startEdit(devotional: DailyDevotional) {
    setEditingId(devotional.id);
    setForm(toForm(devotional));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSetFeatured(id: string) {
    setBusyId(id);
    try {
      await fetch("/api/devotionals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isFeaturedToday: true }),
      });
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/devotionals?id=${encodeURIComponent(id)}`, { method: "DELETE" });
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

    if (!form.dateLabel.trim() || !form.scriptureRefEn.trim() || !form.verseTextEn.trim() || !form.reflectionEn.trim()) {
      setError("Date/Label, Scripture Reference (EN), Verse Text (EN), and Reflection (EN) are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/devotionals", {
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

  function field(key: keyof Omit<FormState, "isFeaturedToday">, label: string, isTextarea = false, rows = 2) {
    const value = form[key];
    const id = `admin-devo-${key}`;
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
      <h1 className="font-display text-xl font-bold text-navy-900">Daily Scripture Devotional Studio</h1>

      {/* Live preview of the homepage "Today's Key Scripture" panel */}
      {activeDevotional && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Live Preview — How This Looks on the Homepage Right Now
          </p>
          <div className="max-w-xl rounded-2xl border border-navy-800 bg-navy-950 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">{activeDevotional.dateLabel}</p>
            <h3 className="mt-1 font-display text-lg font-bold">{activeDevotional.titleEn}</h3>
            <p className="mt-1 text-sm font-semibold text-blue-300">{activeDevotional.scriptureRefEn}</p>
            <p className="mt-3 border-l-2 border-blue-500/40 pl-3 text-sm italic text-slate-200">
              {activeDevotional.verseTextEn}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">{activeDevotional.reflectionEn}</p>
            <p className="mt-3 text-xs text-slate-500">— {activeDevotional.authorEn}</p>
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-navy-900">All Devotionals</p>
        <p className="mt-1 text-xs text-slate-500">
          The devotional marked <span className="font-semibold text-emerald-700">★ ACTIVE TODAY&apos;S SCRIPTURE</span> is
          shown first on the homepage&apos;s &quot;Today&apos;s Key Scripture&quot; panel.
        </p>

        {sorted.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing here yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {sorted.map((devotional) => (
              <div
                key={devotional.id}
                className={
                  devotional.isFeaturedToday
                    ? "flex flex-col gap-2 rounded-xl border border-emerald-400 bg-white p-4 shadow-sm ring-1 ring-emerald-200 sm:flex-row sm:items-center sm:justify-between"
                    : "flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                }
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {devotional.isFeaturedToday && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-emerald-800">
                        <Star className="h-3 w-3 fill-emerald-700 text-emerald-700" aria-hidden="true" />
                        Active Today&apos;s Scripture
                      </span>
                    )}
                    <span className="text-xs font-medium text-slate-500">{devotional.dateLabel}</span>
                  </div>
                  <p className="mt-1 truncate font-medium text-navy-900">
                    {devotional.titleEn || "(Untitled)"}
                  </p>
                  <p className="text-xs text-slate-500">{devotional.scriptureRefEn}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {!devotional.isFeaturedToday && (
                    <button
                      type="button"
                      onClick={() => handleSetFeatured(devotional.id)}
                      disabled={busyId === devotional.id}
                      className="flex items-center gap-1 rounded-lg border border-emerald-300 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden="true" />
                      Set as Today&apos;s Active Scripture
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(devotional)}
                    className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(devotional.id)}
                    disabled={busyId === devotional.id || devotionals.length <= 1}
                    title={devotionals.length <= 1 ? "At least one devotional must remain." : undefined}
                    className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
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
            {editingId ? "Edit Daily Scripture Devotional" : "Add a New Daily Scripture Devotional"}
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

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">{field("dateLabel", 'Date / Label (e.g. "November 9, 2026 — Today\'s Key Scripture")')}</div>
          {field("titleEn", "Title (English)")}
          {field("titleAm", "Title (Amharic — አማርኛ)")}
          {field("scriptureRefEn", "Scripture Reference (English) — e.g. John 10:27")}
          {field("scriptureRefAm", "Scripture Reference (Amharic) — e.g. የዮሐንስ ወንጌል 10፡27")}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field("verseTextEn", "Scripture Verse Text (English)", true, 3)}
          {field("verseTextAm", "Scripture Verse Text (Amharic)", true, 3)}
          {field("reflectionEn", "Devotional Message / Reflection (English)", true, 4)}
          {field("reflectionAm", "Devotional Message / Reflection (Amharic)", true, 4)}
          {field("prayerDeclarationEn", "A Prayer for Today (English)", true, 3)}
          {field("prayerDeclarationAm", "A Prayer for Today (Amharic)", true, 3)}
          {field("authorEn", "Author (English)")}
          {field("authorAm", "Author (Amharic)")}
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isFeaturedToday}
            onChange={(e) => setForm((f) => ({ ...f, isFeaturedToday: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          Set immediately as &quot;Today&apos;s Key Scripture&quot; on the Homepage
        </label>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {editingId ? "Save Changes" : "Save & Publish Devotional"}
        </button>
      </form>
    </div>
  );
}
