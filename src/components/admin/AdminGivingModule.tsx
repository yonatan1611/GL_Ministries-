"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, Loader2, Plus, X } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { DONATION_FUNDS, DONATION_PAYMENT_METHODS } from "@/lib/validations";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DonationRecord } from "@/lib/db";
import { downloadCsv } from "@/lib/csv";
import { isWithinDateRange, type DateRangeFilter } from "@/components/admin/AdminShell";

type FrequencyFilter = "all" | DonationRecord["frequency"];
type MethodFilter = "all" | (typeof DONATION_PAYMENT_METHODS)[number];
type StatusFilter = "all" | DonationRecord["status"];

type ManualGiftForm = {
  donorName: string;
  donorEmail: string;
  amountUsd: string;
  frequency: DonationRecord["frequency"];
  fund: (typeof DONATION_FUNDS)[number];
  paymentMethod: (typeof DONATION_PAYMENT_METHODS)[number];
  prayerNote: string;
};

const EMPTY_MANUAL_GIFT: ManualGiftForm = {
  donorName: "",
  donorEmail: "",
  amountUsd: "",
  frequency: "one-time",
  fund: DONATION_FUNDS[0],
  paymentMethod: "check",
  prayerNote: "",
};

interface AdminGivingModuleProps {
  locale: Locale;
  donations: DonationRecord[];
  dateRange: DateRangeFilter;
  onChanged: () => void;
}

/**
 * Stewardship & USD Giving Ledger: a summary strip (Total Raised / MRR
 * / Average Gift / Monthly Offer Claims), a filterable table, per-row
 * status toggle and receipt link, and a "+ Record Manual / Offline
 * Check Gift" modal so treasurers can log Sunday-offering checks or
 * wire transfers directly into the same unified ledger `/api/give`
 * writes to.
 */
export function AdminGivingModule({ locale, donations, dateRange, onChanged }: AdminGivingModuleProps) {
  const dict = getDictionary(locale);
  const [fundFilter, setFundFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<FrequencyFilter>("all");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isManualGiftOpen, setIsManualGiftOpen] = useState(false);
  const [manualGift, setManualGift] = useState<ManualGiftForm>(EMPTY_MANUAL_GIFT);
  const [manualGiftError, setManualGiftError] = useState<string | null>(null);
  const [isSubmittingManualGift, setIsSubmittingManualGift] = useState(false);

  const inRange = useMemo(() => donations.filter((d) => isWithinDateRange(d.createdAt, dateRange)), [donations, dateRange]);

  const filtered = useMemo(
    () =>
      inRange.filter(
        (d) =>
          (fundFilter === "all" || d.fund === fundFilter) &&
          (frequencyFilter === "all" || d.frequency === frequencyFilter) &&
          (methodFilter === "all" || d.paymentMethod === methodFilter) &&
          (statusFilter === "all" || d.status === statusFilter)
      ),
    [inRange, fundFilter, frequencyFilter, methodFilter, statusFilter]
  );

  const sorted = useMemo(() => [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [filtered]);

  const completed = filtered.filter((d) => d.status === "completed");
  const totalRaised = completed.reduce((sum, d) => sum + d.amountUsd, 0);
  const mrr = completed.filter((d) => d.frequency === "monthly").reduce((sum, d) => sum + d.amountUsd, 0);
  const avgGift = completed.length > 0 ? totalRaised / completed.length : 0;
  const monthlyOfferClaims = filtered.filter((d) => d.claimedMonthlyOffer).length;

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

  async function handleToggleStatus(donation: DonationRecord) {
    setBusyId(donation.id);
    try {
      const nextStatus = donation.status === "completed" ? "pending" : "completed";
      await fetch("/api/admin/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: donation.id, status: nextStatus }),
      });
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmitManualGift(event: React.FormEvent) {
    event.preventDefault();
    setManualGiftError(null);

    const amountUsd = Number(manualGift.amountUsd);
    if (!manualGift.donorName.trim() || !manualGift.donorEmail.trim()) {
      setManualGiftError("Donor name and email are required.");
      return;
    }
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      setManualGiftError("Amount must be a positive number.");
      return;
    }

    setIsSubmittingManualGift(true);
    try {
      const response = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...manualGift, amountUsd }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setManualGiftError(result?.error ?? "Something went wrong.");
        return;
      }
      setManualGift(EMPTY_MANUAL_GIFT);
      setIsManualGiftOpen(false);
      onChanged();
    } finally {
      setIsSubmittingManualGift(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-xl font-bold text-navy-900">Stewardship & USD Giving Ledger</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsManualGiftOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Record Manual / Offline Check Gift
          </button>
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
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total USD Raised</p>
          <p className="mt-1 font-display text-xl font-bold text-navy-900">${totalRaised.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Monthly Run-Rate (MRR)</p>
          <p className="mt-1 font-display text-xl font-bold text-navy-900">${mrr.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average Gift Size</p>
          <p className="mt-1 font-display text-xl font-bold text-navy-900">${avgGift.toFixed(0)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Monthly Offer Claims</p>
          <p className="mt-1 font-display text-xl font-bold text-navy-900">{monthlyOfferClaims}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
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
        <select
          value={frequencyFilter}
          onChange={(e) => setFrequencyFilter(e.target.value as FrequencyFilter)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All Frequencies</option>
          <option value="one-time">One-Time</option>
          <option value="monthly">Monthly Partner</option>
          <option value="annual">Annual</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value as MethodFilter)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All Methods</option>
          <option value="card">Card</option>
          <option value="apple_pay">Apple Pay</option>
          <option value="tithely">Tithe.ly</option>
          <option value="check">Check</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500">{dict.admin.noDataLabel}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Ref Code</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Fund</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Offer?</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{donation.referenceCode}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy-900">{donation.donorName}</p>
                    <p className="text-xs text-slate-500">{donation.donorEmail}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-navy-900">${donation.amountUsd.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{donation.frequency}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{dict.give.funds[donation.fund]}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{donation.paymentMethod}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{donation.claimedMonthlyOffer ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(donation.createdAt).toLocaleDateString(locale === "am" ? "am-ET" : "en-US")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/${locale}/give/success?ref=${encodeURIComponent(donation.referenceCode)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        Receipt
                      </a>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(donation)}
                        disabled={busyId === donation.id}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold disabled:opacity-60",
                          donation.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        )}
                      >
                        {donation.status}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isManualGiftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-navy-900">Record Manual / Offline Check Gift</p>
              <button
                type="button"
                onClick={() => setIsManualGiftOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <form onSubmit={handleSubmitManualGift} className="mt-4 flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Donor Name</label>
                  <input
                    type="text"
                    value={manualGift.donorName}
                    onChange={(e) => setManualGift((f) => ({ ...f, donorName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Donor Email</label>
                  <input
                    type="email"
                    value={manualGift.donorEmail}
                    onChange={(e) => setManualGift((f) => ({ ...f, donorEmail: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Amount ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={manualGift.amountUsd}
                    onChange={(e) => setManualGift((f) => ({ ...f, amountUsd: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Frequency</label>
                  <select
                    value={manualGift.frequency}
                    onChange={(e) =>
                      setManualGift((f) => ({ ...f, frequency: e.target.value as ManualGiftForm["frequency"] }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="one-time">One-Time</option>
                    <option value="monthly">Monthly Partner</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Fund Designation</label>
                  <select
                    value={manualGift.fund}
                    onChange={(e) => setManualGift((f) => ({ ...f, fund: e.target.value as ManualGiftForm["fund"] }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    {DONATION_FUNDS.map((fund) => (
                      <option key={fund} value={fund}>
                        {dict.give.funds[fund]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Method</label>
                  <select
                    value={manualGift.paymentMethod}
                    onChange={(e) =>
                      setManualGift((f) => ({ ...f, paymentMethod: e.target.value as ManualGiftForm["paymentMethod"] }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="check">Check</option>
                    <option value="card">Card</option>
                    <option value="apple_pay">Apple Pay</option>
                    <option value="tithely">Tithe.ly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Note (optional)</label>
                <textarea
                  rows={2}
                  value={manualGift.prayerNote}
                  onChange={(e) => setManualGift((f) => ({ ...f, prayerNote: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="e.g. Sunday offering check #4821, received at Alexandria, VA office"
                />
              </div>
              {manualGiftError && <p className="text-xs text-red-600">{manualGiftError}</p>}
              <button
                type="submit"
                disabled={isSubmittingManualGift}
                className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {isSubmittingManualGift && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Save Gift to Ledger
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
