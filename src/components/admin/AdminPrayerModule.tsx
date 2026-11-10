"use client";

import { useMemo, useState } from "react";
import { Download, HeartHandshake, Sparkles } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { PRAYER_NEED_CATEGORIES } from "@/lib/validations";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { PrayerRequestRecord, RsvpRecord } from "@/lib/db";
import { downloadCsv } from "@/lib/csv";

type CategoryFilter = "all" | (typeof PRAYER_NEED_CATEGORIES)[number];
type StatusFilter = "all" | "needs-prayer" | "prayed-over";

/**
 * Prayer Wall & Salvation Tracker: category/status filters over the
 * Global Prayer Army roster, a 1-click "Mark as Prayed Over" action, a
 * combined prayer-list + Prayer Army CSV export, and a dedicated
 * "Accept Jesus Today!" Salvation Decisions view (sourced from the
 * `rsvps` collection's `kind: "salvation"` entries) so pastors can
 * follow up with new believers immediately.
 */
export function AdminPrayerModule({
  locale,
  prayerRequests,
  rsvps,
  onChanged,
}: {
  locale: Locale;
  prayerRequests: PrayerRequestRecord[];
  rsvps: RsvpRecord[];
  onChanged: () => void;
}) {
  const dict = getDictionary(locale);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const salvationDecisions = useMemo(
    () => [...rsvps].filter((r) => r.kind === "salvation").sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [rsvps]
  );

  const filtered = useMemo(
    () =>
      prayerRequests.filter(
        (p) =>
          (categoryFilter === "all" || p.category === categoryFilter) &&
          (statusFilter === "all" ||
            (statusFilter === "prayed-over" ? p.prayedOverByStaff : !p.prayedOverByStaff))
      ),
    [prayerRequests, categoryFilter, statusFilter]
  );

  const sorted = useMemo(() => [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [filtered]);
  const armyMemberCount = prayerRequests.filter((p) => p.joinedPrayerArmy).length;

  async function handleMarkPrayedOver(id: string) {
    setPendingId(id);
    try {
      await fetch(`/api/admin/prayer/${id}`, { method: "PATCH" });
      onChanged();
    } finally {
      setPendingId(null);
    }
  }

  function handleExport() {
    downloadCsv(
      "glm-prayer-requests-and-army.csv",
      sorted.map((p) => ({
        date: p.createdAt,
        name: p.fullName,
        email: p.email ?? "",
        phone: p.phone ?? "",
        category: p.category,
        request: p.requestText,
        confidential: p.isConfidential,
        joinedPrayerArmy: p.joinedPrayerArmy,
        prayedCount: p.prayedCount,
        prayedOverByStaff: p.prayedOverByStaff,
      }))
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-xl font-bold text-navy-900">Prayer Wall & Salvation Tracker</h1>

      {/* Salvation Decisions */}
      <div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <p className="text-sm font-semibold text-navy-900">
            &quot;Accept Jesus Today!&quot; Salvation Decisions ({salvationDecisions.length})
          </p>
        </div>
        {salvationDecisions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No salvation decisions yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-emerald-200 bg-emerald-50/40">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-emerald-800">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {salvationDecisions.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {new Date(rsvp.createdAt).toLocaleDateString(locale === "am" ? "am-ET" : "en-US")}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">{rsvp.fullName}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {rsvp.email} {rsvp.phone ? `· ${rsvp.phone}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prayer requests */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
            <HeartHandshake className="h-4 w-4 text-amber-600" aria-hidden="true" />
            {dict.admin.prayerArmyMemberBadge}: {armyMemberCount}
          </p>
          <button
            type="button"
            onClick={handleExport}
            disabled={sorted.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export Prayer List & Prayer Army Roster (CSV)
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            {PRAYER_NEED_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="needs-prayer">Needs Prayer</option>
            <option value="prayed-over">Prayed Over</option>
          </select>
        </div>

        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">{dict.admin.noDataLabel}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sorted.map((prayer) => (
              <li key={prayer.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-navy-900">{prayer.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {prayer.email ?? ""} {prayer.phone ? `· ${prayer.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-navy-50 px-2 py-0.5 text-xs font-semibold text-navy-700">
                      {prayer.category}
                    </span>
                    {prayer.isConfidential && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {dict.admin.confidentialBadge}
                      </span>
                    )}
                    {prayer.joinedPrayerArmy && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {dict.admin.prayerArmyMemberBadge}
                      </span>
                    )}
                    {prayer.prayedOverByStaff && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {dict.admin.prayedOverBadge}
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">{prayer.requestText}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-400">
                    {new Date(prayer.createdAt).toLocaleString(locale === "am" ? "am-ET" : "en-US")} ·{" "}
                    {prayer.prayedCount} 🙏
                  </p>
                  {!prayer.prayedOverByStaff && (
                    <button
                      type="button"
                      onClick={() => handleMarkPrayedOver(prayer.id)}
                      disabled={pendingId === prayer.id}
                      className={cn(
                        "rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                      )}
                    >
                      {dict.admin.markPrayedOverButton}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
