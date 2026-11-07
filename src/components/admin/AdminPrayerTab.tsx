"use client";

import { useMemo, useState } from "react";
import { Download, HeartHandshake } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import type { PrayerRequestRecord } from "@/lib/db";
import { downloadCsv } from "@/lib/csv";

export function AdminPrayerTab({
  locale,
  prayerRequests,
  onChanged,
}: {
  locale: Locale;
  prayerRequests: PrayerRequestRecord[];
  onChanged: () => void;
}) {
  const dict = getDictionary(locale);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...prayerRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [prayerRequests]
  );
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
      "glm-prayer-requests.csv",
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
          {dict.admin.exportCsvButton}
        </button>
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
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
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
  );
}
