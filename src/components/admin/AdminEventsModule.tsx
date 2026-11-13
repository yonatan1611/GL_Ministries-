"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Plus } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { EVENT_CATEGORIES, newEventSchema } from "@/lib/validations";
import { MINISTRY_IMAGES } from "@/data/social-media";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { RsvpRecord } from "@/lib/db";
import type { MinistryEvent } from "@/types/ministry";
import { downloadCsv } from "@/lib/csv";

type FormState = {
  titleEn: string;
  titleAm: string;
  dateRangeEn: string;
  dateRangeAm: string;
  locationEn: string;
  locationAm: string;
  category: (typeof EVENT_CATEGORIES)[number];
  descriptionEn: string;
  descriptionAm: string;
  isLiveStreamed: boolean;
  alsoPostHighlight: boolean;
};

const EMPTY_FORM: FormState = {
  titleEn: "",
  titleAm: "",
  dateRangeEn: "",
  dateRangeAm: "",
  locationEn: "",
  locationAm: "",
  category: EVENT_CATEGORIES[0],
  descriptionEn: "",
  descriptionAm: "",
  isLiveStreamed: false,
  alsoPostHighlight: false,
};

type KindFilter = "all" | RsvpRecord["kind"];
const KIND_LABELS: Record<RsvpRecord["kind"], string> = {
  event: "Event RSVPs",
  "plan-your-visit": "Plan Your Visit (2401 Virginia Ave NW)",
  "ministry-action": "Volunteer / Outreach / Home Groups",
  salvation: "Salvation Decisions",
  "contact-inquiry": "Contact Inquiries",
};

/**
 * Events, RSVPs, Volunteer & D.C. Visit Manager: the existing
 * add/edit-event form, plus a registration table filterable by RSVP
 * kind — Event RSVPs, Plan-Your-Visit guests, Volunteer/Outreach/Home
 * Group signups (`ministry-action`), Salvation decisions, and general
 * Contact Inquiries all live in the same `rsvps` collection.
 */
export function AdminEventsModule({
  locale,
  rsvps,
  events,
  onChanged,
}: {
  locale: Locale;
  rsvps: RsvpRecord[];
  events: MinistryEvent[];
  onChanged: () => void;
}) {
  const dict = getDictionary(locale);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

  const filtered = useMemo(
    () => (kindFilter === "all" ? rsvps : rsvps.filter((r) => r.kind === kindFilter)),
    [rsvps, kindFilter]
  );
  const sorted = useMemo(() => [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [filtered]);
  const eventTitleById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const event of events) map[event.id] = locale === "am" ? event.titleAm : event.titleEn;
    return map;
  }, [events, locale]);

  function handleExport() {
    downloadCsv(
      "glm-rsvps.csv",
      sorted.map((rsvp) => ({
        date: rsvp.createdAt,
        kind: rsvp.kind,
        event: rsvp.eventId ? eventTitleById[rsvp.eventId] ?? rsvp.eventId : "",
        name: rsvp.fullName,
        email: rsvp.email,
        phone: rsvp.phone ?? "",
        details: JSON.stringify(rsvp.details ?? {}),
      }))
    );
  }

  async function handleAddEvent(event: React.FormEvent) {
    event.preventDefault();

    const localCheck = newEventSchema.safeParse(form);
    if (!localCheck.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of localCheck.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (key in EMPTY_FORM) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (response.ok) {
        if (form.alsoPostHighlight) await postEventAsHighlight(form);
        setForm(EMPTY_FORM);
        onChanged();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  /** "Also post this to Recent Updates & Highlights" — creates a real,
   *  manageable `NewsHighlight` card from the event's own fields rather
   *  than synthesizing an ephemeral one at render time, so it shows up
   *  in the News & Highlights module and survives independently of the
   *  event (editable/deletable on its own). Best-effort: the event
   *  itself is already saved by the time this runs, so a failure here
   *  is logged, not surfaced as a form error. */
  async function postEventAsHighlight(data: FormState) {
    try {
      await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: data.titleEn,
          titleAm: data.titleAm,
          category: "Special Announcement",
          summaryEn: data.descriptionEn,
          summaryAm: data.descriptionAm,
          contentEn: data.descriptionEn,
          contentAm: data.descriptionAm,
          imageUrl: MINISTRY_IMAGES.crusadeRevivalGathering,
          locationLabel: data.locationEn,
          publishedDateLabel: data.dateRangeEn,
          isPinnedLeadStory: false,
        }),
      });
    } catch {
      console.error("[AdminEventsModule] Failed to auto-post event as a highlight.");
    }
  }

  function field(key: keyof FormState, label: string, isTextarea = false) {
    const value = form[key];
    const commonProps = {
      id: `admin-event-${key}`,
      value: typeof value === "boolean" ? "" : value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
      className: cn(
        "w-full rounded-lg border px-3 py-2 text-sm",
        errors[key] ? "border-red-500" : "border-slate-300"
      ),
    };
    return (
      <div>
        <label htmlFor={commonProps.id} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
        {isTextarea ? <textarea rows={2} {...commonProps} /> : <input type="text" {...commonProps} />}
        {errors[key] && <p className="mt-1 text-xs text-red-600">{errors[key]}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-xl font-bold text-navy-900">Events, RSVPs, Volunteers & D.C. Visits</h1>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["all", "event", "plan-your-visit", "ministry-action", "salvation", "contact-inquiry"] as KindFilter[]).map(
              (kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setKindFilter(kind)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-bold",
                    kindFilter === kind ? "border-navy-900 bg-navy-900 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {kind === "all" ? `All (${rsvps.length})` : `${KIND_LABELS[kind]} (${rsvps.filter((r) => r.kind === kind).length})`}
                </button>
              )
            )}
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={sorted.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {dict.admin.exportCsvButton}
          </button>
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">{dict.admin.noDataLabel}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Kind</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(rsvp.createdAt).toLocaleDateString(locale === "am" ? "am-ET" : "en-US")}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-700">
                        {rsvp.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">{rsvp.fullName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {rsvp.email} {rsvp.phone ? `· ${rsvp.phone}` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {rsvp.eventId
                        ? eventTitleById[rsvp.eventId] ?? rsvp.eventId
                        : Object.entries(rsvp.details ?? {})
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleAddEvent} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
          <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />
          {dict.admin.addEventTitle}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field("titleEn", "Title (English)")}
          {field("titleAm", "Title (Amharic)")}
          {field("dateRangeEn", "Date Range (English)")}
          {field("dateRangeAm", "Date Range (Amharic)")}
          {field("locationEn", "Location (English) — e.g. Washington, D.C. Sanctuary")}
          {field("locationAm", "Location (Amharic)")}
          <div>
            <label htmlFor="admin-event-category" className="mb-1 block text-xs font-medium text-slate-600">
              Category
            </label>
            <select
              id="admin-event-category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as FormState["category"] }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {EVENT_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isLiveStreamed}
              onChange={(e) => setForm((f) => ({ ...f, isLiveStreamed: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
            />
            Live Streamed
          </label>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {field("descriptionEn", "Description (English)", true)}
          {field("descriptionAm", "Description (Amharic)", true)}
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.alsoPostHighlight}
            onChange={(e) => setForm((f) => ({ ...f, alsoPostHighlight: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
          />
          Also post this to &quot;Recent Updates &amp; Highlights&quot; on the Homepage
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {dict.admin.addEventButton}
        </button>
      </form>
    </div>
  );
}
