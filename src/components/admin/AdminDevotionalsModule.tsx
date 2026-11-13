"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Sparkles, Star, Trash2, X } from "lucide-react";
import type { DailyDevotional } from "@/types/ministry";
import { BIBLE_BOOKS, POPULAR_MINISTRY_VERSES, type Testament } from "@/data/bible-books";
import { cn } from "@/lib/utils";

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

/** A handful of the curated bank's own verses, surfaced as 1-click
 *  quick-pick chips — every one of these is guaranteed to have both
 *  English and Amharic text instantly (no network round-trip). */
const QUICK_PICK_VERSE_IDS = [
  "john-10-27",
  "psalm-23-1-6",
  "2-chronicles-7-14",
  "isaiah-40-31",
  "jeremiah-29-11",
  "acts-1-8",
  "romans-8-28",
  "philippians-4-6-7",
  "hebrews-13-8",
];

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

  // Step 1: Bible verse picker state.
  const [testamentFilter, setTestamentFilter] = useState<"all" | Testament>("all");
  const [bookNumber, setBookNumber] = useState(43); // John
  const [chapter, setChapter] = useState(10);
  const [verseStart, setVerseStart] = useState("27");
  const [verseEnd, setVerseEnd] = useState("");
  const [translationEn, setTranslationEn] = useState<"KJV" | "WEB" | "NLT">("KJV");
  const [isFetchingVerse, setIsFetchingVerse] = useState(false);
  const [verseFetchNote, setVerseFetchNote] = useState<string | null>(null);

  const sorted = [...devotionals].sort((a, b) => Number(b.isFeaturedToday) - Number(a.isFeaturedToday));
  const activeDevotional = sorted.find((d) => d.isFeaturedToday) ?? sorted[0];

  const booksForTestament = useMemo(
    () => (testamentFilter === "all" ? BIBLE_BOOKS : BIBLE_BOOKS.filter((b) => b.testament === testamentFilter)),
    [testamentFilter]
  );
  const selectedBook = BIBLE_BOOKS.find((b) => b.bookNumber === bookNumber) ?? BIBLE_BOOKS[0]!;
  const quickPickVerses = useMemo(
    () => QUICK_PICK_VERSE_IDS.map((id) => POPULAR_MINISTRY_VERSES.find((v) => v.id === id)).filter(Boolean),
    []
  );

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

  async function handleAutoFetchVerse(overrides?: { bookNumber?: number; chapter?: number; verseStart?: number; verseEnd?: number }) {
    const useBookNumber = overrides?.bookNumber ?? bookNumber;
    const useChapter = overrides?.chapter ?? chapter;
    const useVerseStart = overrides?.verseStart ?? Number(verseStart);
    const useVerseEnd = overrides?.verseEnd ?? (verseEnd ? Number(verseEnd) : undefined);

    if (!Number.isFinite(useVerseStart) || useVerseStart < 1) {
      setVerseFetchNote("Enter a verse number first.");
      return;
    }

    setIsFetchingVerse(true);
    setVerseFetchNote(null);
    try {
      const params = new URLSearchParams({
        bookNumber: String(useBookNumber),
        chapter: String(useChapter),
        verseStart: String(useVerseStart),
        translationEn,
      });
      if (useVerseEnd) params.set("verseEnd", String(useVerseEnd));

      const response = await fetch(`/api/bible-lookup?${params.toString()}`);
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setVerseFetchNote(result?.error ?? "Couldn't fetch that verse.");
        return;
      }

      const data = result.data as {
        scriptureRefEn: string;
        scriptureRefAm: string;
        verseTextEn: string;
        verseTextAm: string | null;
        amharicAvailable: boolean;
        source: string;
      };
      setForm((f) => ({
        ...f,
        scriptureRefEn: data.scriptureRefEn,
        scriptureRefAm: data.scriptureRefAm,
        verseTextEn: data.verseTextEn,
        verseTextAm: data.verseTextAm ?? "",
      }));
      // The server's own `message` already explains anything the admin
      // needs to know (live-fetch-only, curated+re-translated English,
      // or a fallback after a failed live fetch) — only the plain
      // "found in the curated bank" case needs no note at all.
      setVerseFetchNote(data.source === "curated" ? null : (result.message as string) ?? null);
    } finally {
      setIsFetchingVerse(false);
    }
  }

  function handleQuickPick(verse: NonNullable<(typeof quickPickVerses)[number]>) {
    setBookNumber(verse.bookNumber);
    setChapter(verse.chapter);
    setVerseStart(String(verse.verseStart));
    setVerseEnd(verse.verseEnd ? String(verse.verseEnd) : "");
    setForm((f) => ({
      ...f,
      scriptureRefEn: verse.scriptureRefEn,
      scriptureRefAm: verse.scriptureRefAm,
      verseTextEn: verse.verseTextEn,
      verseTextAm: verse.verseTextAm,
    }));
    setVerseFetchNote(null);
  }

  function handleAutoSuggestTitle() {
    if (!form.scriptureRefEn) return;
    const refWithoutTranslation = form.scriptureRefEn.replace(/\s*\([A-Z]+\)\s*$/, "");
    setForm((f) => ({ ...f, titleEn: f.titleEn || refWithoutTranslation }));
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

    if (
      !form.dateLabel.trim() ||
      !form.scriptureRefEn.trim() ||
      !form.verseTextEn.trim() ||
      !form.reflectionEn.trim() ||
      !form.prayerDeclarationEn.trim()
    ) {
      setError("Date/Label, Scripture Reference (EN), Verse Text (EN), Reflection (EN), and A Prayer for Today (EN) are all required.");
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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

        {/* Step 1: Choose Your Scripture Verse */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5">
          <p className="text-sm font-semibold text-navy-900">
            Step 1 — Choose Your Scripture Verse (Auto-Fills Verse Text)
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {(["all", "OT", "NT"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTestamentFilter(t)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-bold",
                  testamentFilter === t ? "border-navy-900 bg-navy-900 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                )}
              >
                {t === "all" ? "All (66)" : t === "OT" ? "Old Testament (39)" : "New Testament (27)"}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">Book</label>
              <select
                value={bookNumber}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setBookNumber(next);
                  setChapter(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              >
                {booksForTestament.map((b) => (
                  <option key={b.bookNumber} value={b.bookNumber}>
                    {b.bookNumber}. {b.nameEn} — {b.nameAm}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Chapter</label>
              <select
                value={chapter}
                onChange={(e) => setChapter(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              >
                {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Verse</label>
              <input
                type="number"
                min={1}
                value={verseStart}
                onChange={(e) => setVerseStart(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">To Verse (optional)</label>
              <input
                type="number"
                min={1}
                value={verseEnd}
                onChange={(e) => setVerseEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              Translation
              <select
                value={translationEn}
                onChange={(e) => setTranslationEn(e.target.value as "KJV" | "WEB" | "NLT")}
                className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              >
                <option value="KJV">KJV (King James)</option>
                <option value="WEB">WEB (World English)</option>
                <option value="NLT">NLT (New Living Translation)</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => handleAutoFetchVerse()}
              disabled={isFetchingVerse}
              className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {isFetchingVerse ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Auto-Fetch Scripture Verse
            </button>
          </div>
          {verseFetchNote && <p className="mt-2 text-xs text-amber-700">{verseFetchNote}</p>}

          {/* Quick-pick favourite verses */}
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Quick-Select Favourite Verses
            </p>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {quickPickVerses.map((verse) => (
                <button
                  key={verse!.id}
                  type="button"
                  onClick={() => handleQuickPick(verse!)}
                  className="shrink-0 whitespace-nowrap rounded-full border border-blue-300 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                >
                  {verse!.scriptureRefEn.replace(/\s*\([A-Z]+\)\s*$/, "")}
                </button>
              ))}
            </div>
          </div>

          {/* Auto-filled verse preview (still editable) */}
          {(form.verseTextEn || form.verseTextAm) && (
            <div className="mt-4 rounded-lg border border-blue-300 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Auto-Filled Verse Preview</p>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {field("scriptureRefEn", "Scripture Reference (English)")}
                {field("scriptureRefAm", "Scripture Reference (Amharic)")}
                {field("verseTextEn", "Scripture Verse Text (English)", true, 3)}
                {field("verseTextAm", "Scripture Verse Text (Amharic)", true, 3)}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Write Your Devotional Message & Prayer */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-navy-900">Step 2 — Write Your Devotional Message &amp; Prayer</p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">{field("dateLabel", 'Date / Label (e.g. "November 9, 2026 — Today\'s Key Scripture")')}</div>
            <div>
              {field("titleEn", "Devotional Title (English)")}
              <button
                type="button"
                onClick={handleAutoSuggestTitle}
                className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Auto-Suggest Title from Verse
              </button>
            </div>
            {field("titleAm", "Devotional Title (Amharic — optional)")}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("reflectionEn", "Your Devotional Message / Pastoral Reflection (English, required)", true, 4)}
            {field("reflectionAm", "Devotional Message / Reflection (Amharic, optional)", true, 4)}
            {field("prayerDeclarationEn", "A Prayer for Today (English, required)", true, 3)}
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
            {editingId ? "Save Changes" : "Publish Daily Scripture Devotional"}
          </button>
        </div>
      </form>
    </div>
  );
}
