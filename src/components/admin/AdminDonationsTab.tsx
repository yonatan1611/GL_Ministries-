"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { DONATION_FUNDS } from "@/lib/validations";
import type { Locale } from "@/lib/utils";
import type { DonationRecord } from "@/lib/db";
import { downloadCsv } from "@/lib/csv";

export function AdminDonationsTab({ locale, donations }: { locale: Locale; donations: DonationRecord[] }) {
  const dict = getDictionary(locale);
  const [fundFilter, setFundFilter] = useState<string>("all");

  const filtered = useMemo(
    () => (fundFilter === "all" ? donations : donations.filter((d) => d.fund === fundFilter)),
    [donations, fundFilter]
  );

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [filtered]
  );

  const totalCompleted = filtered
    .filter((d) => d.status === "completed")
    .reduce((sum, d) => sum + d.amountUsd, 0);

  function handleExport() {
    downloadCsv(
      "glm-donations.csv",
      sorted.map((d) => ({
        date: d.createdAt,
        reference: d.referenceCode,
        donor: d.donorName,
        email: d.donorEmail,
        phone: d.donorPhone ?? "",
        amountUsd: d.amountUsd,
        frequency: d.frequency,
        fund: d.fund,
        paymentMethod: d.paymentMethod,
        status: d.status,
        claimedMonthlyOffer: d.claimedMonthlyOffer,
      }))
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={fundFilter}
            onChange={(e) => setFundFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">{dict.admin.filterAllFunds}</option>
            {DONATION_FUNDS.map((fund) => (
              <option key={fund} value={fund}>
                {dict.give.funds[fund]}
              </option>
            ))}
          </select>
          <p className="text-sm font-semibold text-navy-900">
            {dict.admin.totalLabel}: ${totalCompleted.toLocaleString()}
          </p>
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
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Fund</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(donation.createdAt).toLocaleDateString(locale === "am" ? "am-ET" : "en-US")}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy-900">{donation.donorName}</p>
                    <p className="text-xs text-slate-500">{donation.donorEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{dict.give.funds[donation.fund]}</td>
                  <td className="px-4 py-3 font-semibold text-navy-900">
                    ${donation.amountUsd.toLocaleString()}
                    <span className="ml-1 text-xs font-normal text-slate-500">
                      {donation.frequency !== "one-time" ? `/${donation.frequency}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{donation.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        donation.status === "completed"
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700"
                      }
                    >
                      {donation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{donation.referenceCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
