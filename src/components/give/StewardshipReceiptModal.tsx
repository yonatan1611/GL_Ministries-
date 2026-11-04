"use client";

import { Download, Printer } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import type { DonationFund } from "@/lib/validations";
import { Modal } from "@/components/ui/Modal";

export interface GivingReceiptData {
  referenceId: string;
  amount: number;
  currency: "USD";
  frequency: "one-time" | "monthly" | "annual";
  fund: DonationFund;
  donorName: string;
  submittedAt: string;
  /** Present only when the donor claimed this month's Monthly Partner
   *  Book Offer and the gift qualifies (Monthly or Annual). */
  monthlyOfferBookTitleEn?: string;
  monthlyOfferBookTitleAm?: string;
}

interface StewardshipReceiptModalProps {
  locale: Locale;
  receipt: GivingReceiptData | null;
  onClose: () => void;
}

function receiptText(receipt: GivingReceiptData, dict: ReturnType<typeof getDictionary>, locale: Locale): string {
  const frequencyLabel =
    receipt.frequency === "one-time"
      ? dict.give.frequencyOneTime
      : receipt.frequency === "monthly"
        ? dict.give.frequencyMonthly
        : dict.give.frequencyAnnual;
  const amountLabel = `$${receipt.amount.toLocaleString()}`;

  return [
    "GOSPEL LIGHT MINISTRIES INTERNATIONAL",
    dict.give.receiptModalTitle,
    "",
    `${dict.give.receiptReferenceLabel}: ${receipt.referenceId}`,
    `${dict.forms.fullName}: ${receipt.donorName}`,
    `${dict.give.fundLabel}: ${dict.give.funds[receipt.fund]}`,
    `${dict.give.amountSectionLabel}: ${amountLabel} (${frequencyLabel})`,
    `${new Date(receipt.submittedAt).toLocaleString(locale === "am" ? "am-ET" : "en-US")}`,
    ...(receipt.monthlyOfferBookTitleEn
      ? [`${dict.give.partnershipBannerTitle}: ${locale === "am" ? receipt.monthlyOfferBookTitleAm : receipt.monthlyOfferBookTitleEn}`]
      : []),
    "",
    dict.give.receiptThankYou,
  ].join("\n");
}

/** Printable/downloadable stewardship receipt shown after a successful
 *  `POST /api/give` submission. */
export function StewardshipReceiptModal({ locale, receipt, onClose }: StewardshipReceiptModalProps) {
  const dict = getDictionary(locale);
  if (!receipt) return null;

  const frequencyLabel =
    receipt.frequency === "one-time"
      ? dict.give.frequencyOneTime
      : receipt.frequency === "monthly"
        ? dict.give.frequencyMonthly
        : dict.give.frequencyAnnual;
  const amountLabel = `$${receipt.amount.toLocaleString()}`;

  function handleDownload() {
    if (!receipt) return;
    const blob = new Blob([receiptText(receipt, dict, locale)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receipt.referenceId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Modal
      isOpen={Boolean(receipt)}
      onClose={onClose}
      title={dict.give.receiptModalTitle}
      closeLabel={dict.buttons.close}
    >
      <div className="flex flex-col gap-4 text-sm text-slate-700">
        <p className="text-center text-sm text-slate-600">{dict.give.receiptThankYou}</p>

        <div className="rounded-xl border border-dashed border-amber-400 bg-amber-50 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
            {dict.give.receiptReferenceLabel}
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-navy-900">{receipt.referenceId}</p>
        </div>

        <dl className="flex flex-col gap-2">
          <div className="flex justify-between">
            <dt className="text-slate-500">{dict.give.amountSectionLabel}</dt>
            <dd className="font-semibold text-navy-900">
              {amountLabel} · {frequencyLabel}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">{dict.give.fundLabel}</dt>
            <dd className="text-right font-medium text-navy-900">{dict.give.funds[receipt.fund]}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">{dict.forms.fullName}</dt>
            <dd className="font-medium text-navy-900">{receipt.donorName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">{locale === "am" ? "ቀን" : "Date"}</dt>
            <dd className="font-medium text-navy-900">
              {new Date(receipt.submittedAt).toLocaleDateString(locale === "am" ? "am-ET" : "en-US")}
            </dd>
          </div>
          {(receipt.monthlyOfferBookTitleEn || receipt.monthlyOfferBookTitleAm) && (
            <div className="flex justify-between gap-4 border-t border-slate-100 pt-2">
              <dt className="text-slate-500">{dict.give.partnershipBannerTitle}</dt>
              <dd className="text-right font-medium text-navy-900">
                {locale === "am" ? receipt.monthlyOfferBookTitleAm : receipt.monthlyOfferBookTitleEn}
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            {dict.give.printReceipt}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {dict.give.downloadReceipt}
          </button>
        </div>
      </div>
    </Modal>
  );
}
