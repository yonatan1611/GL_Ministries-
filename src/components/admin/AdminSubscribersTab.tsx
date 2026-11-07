"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import type { SubscriberRecord } from "@/lib/db";
import { downloadCsv } from "@/lib/csv";

export function AdminSubscribersTab({
  locale,
  subscribers,
}: {
  locale: Locale;
  subscribers: SubscriberRecord[];
}) {
  const dict = getDictionary(locale);

  const sorted = useMemo(
    () => [...subscribers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [subscribers]
  );

  function handleExport() {
    downloadCsv(
      "glm-subscribers.csv",
      sorted.map((s) => ({
        date: s.createdAt,
        firstName: s.firstName ?? "",
        lastName: s.lastName ?? "",
        email: s.email ?? "",
        phone: s.phone ?? "",
        emailOptIn: s.emailOptIn,
        smsOptIn: s.smsOptIn,
      }))
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-900">
          {dict.admin.totalLabel}: {subscribers.length}
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
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Channels</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(subscriber.createdAt).toLocaleDateString(locale === "am" ? "am-ET" : "en-US")}
                  </td>
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {[subscriber.firstName, subscriber.lastName].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{subscriber.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{subscriber.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {[subscriber.emailOptIn && "Email", subscriber.smsOptIn && "SMS"].filter(Boolean).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
