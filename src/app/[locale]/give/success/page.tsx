import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Download, Mail, MapPin, ShieldCheck } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import { findDonation, listBooks, updateDonation, type DonationRecord } from "@/lib/db";
import { isStripeLiveConfigured, retrieveCheckoutSession } from "@/lib/stripe";
import { PrintReceiptButton } from "@/components/give/PrintReceiptButton";

interface SuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; session_id?: string }>;
}

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  const dict = getDictionary(loc);
  return { title: dict.give.successPageTitle };
}

/**
 * Real post-payment receipt page — fetches the actual donation record
 * from `src/lib/db.ts` by `ref` (reference code) or `session_id`
 * (real Stripe Checkout), rather than trusting anything in the URL
 * itself. If a real Stripe session just completed but the webhook
 * hasn't landed yet (common in local dev without `stripe listen`),
 * this verifies directly with Stripe as a fallback so the receipt
 * never gets stuck showing "pending" for a gift that actually cleared.
 */
export default async function GiveSuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale: rawLocale } = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const { ref, session_id: sessionId } = await searchParams;

  let donation: DonationRecord | null = await findDonation({ referenceCode: ref, stripeSessionId: sessionId });

  if (donation && donation.status === "pending" && sessionId && isStripeLiveConfigured) {
    try {
      const session = await retrieveCheckoutSession(sessionId);
      if (session.payment_status === "paid") {
        donation = await updateDonation(
          { referenceCode: donation.referenceCode },
          {
            status: "completed",
            completedAt: new Date().toISOString(),
            stripeSubscriptionId:
              typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
          }
        );
      }
    } catch {
      // Stripe lookup failed — the webhook will still reconcile this.
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {!donation ? (
          <NotFoundCard locale={locale} />
        ) : donation.status === "completed" ? (
          <ReceiptCard locale={locale} donation={donation} />
        ) : (
          <PendingCard locale={locale} donation={donation} />
        )}
      </div>
    </main>
  );
}

function BackToGiveLink({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <Link href={`/${locale}/give`} className="mt-6 inline-block text-sm font-semibold text-amber-700 hover:text-amber-800">
      &larr; {dict.give.backToGiveLabel}
    </Link>
  );
}

function NotFoundCard({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="font-display text-xl font-bold text-navy-900">{dict.give.notFoundTitle}</h1>
      <p className="mt-2 text-sm text-slate-600">{dict.give.notFoundBody}</p>
      <BackToGiveLink locale={locale} />
    </div>
  );
}

function frequencyLabel(dict: ReturnType<typeof getDictionary>, frequency: DonationRecord["frequency"]): string {
  if (frequency === "monthly") return dict.give.frequencyMonthly;
  if (frequency === "annual") return dict.give.frequencyAnnual;
  return dict.give.frequencyOneTime;
}

function PendingCard({ locale, donation }: { locale: Locale; donation: DonationRecord }) {
  const dict = getDictionary(locale);
  const amountLabel = `$${donation.amountUsd.toLocaleString()}`;
  const dateLabel = new Date(donation.createdAt).toLocaleDateString(locale === "am" ? "am-ET" : "en-US");

  return (
    <div className="rounded-2xl border border-amber-300 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-2 text-amber-700">
        <Clock className="h-5 w-5" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold text-navy-900">{dict.give.pendingCheckTitle}</h1>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{dict.give.pendingCheckBody}</p>

      <dl className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">{dict.give.receiptReferenceLabel}</dt>
          <dd className="font-mono font-semibold text-navy-900">{donation.referenceCode}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{dict.give.amountSectionLabel}</dt>
          <dd className="font-semibold text-navy-900">
            {amountLabel} &middot; {frequencyLabel(dict, donation.frequency)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">{dict.give.fundLabel}</dt>
          <dd className="text-right font-medium text-navy-900">{dict.give.funds[donation.fund]}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{locale === "am" ? "ቀን" : "Date"}</dt>
          <dd className="font-medium text-navy-900">{dateLabel}</dd>
        </div>
      </dl>

      {donation.claimedMonthlyOffer && (
        <p className="mt-4 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-800">
          {dict.give.claimedOfferNote}
        </p>
      )}

      <BackToGiveLink locale={locale} />
    </div>
  );
}

async function ReceiptCard({ locale, donation }: { locale: Locale; donation: DonationRecord }) {
  const dict = getDictionary(locale);
  const monthlyOfferBook = donation.claimedMonthlyOffer
    ? (await listBooks()).find((book) => book.isMonthlySpecialOffer)
    : undefined;
  const amountLabel = `$${donation.amountUsd.toLocaleString()}`;
  const dateLabel = new Date(donation.completedAt ?? donation.createdAt).toLocaleString(
    locale === "am" ? "am-ET" : "en-US"
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none">
      <div className="flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        <p className="text-sm font-semibold uppercase tracking-wide">{dict.give.receiptThankYou}</p>
      </div>

      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">GOSPEL LIGHT MINISTRIES INTERNATIONAL</h1>
      <p className="mt-1 text-sm font-semibold text-amber-700">{dict.give.officialReceiptTitle}</p>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 text-amber-600" aria-hidden="true" />
        {dict.give.einLabel}: 52-1849893
      </div>

      <dl className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">{dict.give.receiptReferenceLabel}</dt>
          <dd className="font-mono font-semibold text-navy-900">{donation.referenceCode}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{dict.forms.fullName}</dt>
          <dd className="font-medium text-navy-900">{donation.donorName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">{dict.forms.email}</dt>
          <dd className="text-right font-medium text-navy-900">{donation.donorEmail}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{dict.give.amountSectionLabel}</dt>
          <dd className="font-semibold text-navy-900">
            {amountLabel} &middot; {frequencyLabel(dict, donation.frequency)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">{dict.give.fundLabel}</dt>
          <dd className="text-right font-medium text-navy-900">{dict.give.funds[donation.fund]}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{locale === "am" ? "ቀን" : "Date"}</dt>
          <dd className="font-medium text-navy-900">{dateLabel}</dd>
        </div>
      </dl>

      {donation.claimedMonthlyOffer && monthlyOfferBook && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3">
          <p className="text-xs text-amber-800">{dict.give.claimedOfferNote}</p>
          <a
            href={`/api/books/download/${monthlyOfferBook.id}?donation=${encodeURIComponent(donation.referenceCode)}`}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700 print:hidden"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {dict.give.downloadEbookButton}
          </a>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-slate-500">{dict.give.noGoodsServicesNote}</p>

      <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Gospel Light Ministries International &middot; 85 South Bragg St, Suite 200, Alexandria, VA 22312
          <br />
          Washington, D.C. Sanctuary &middot; 2401 Virginia Ave NW, Washington, DC 20037
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
        <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        glministries.org
      </div>

      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <PrintReceiptButton label={dict.give.printPdfReceiptButton} />
      </div>

      <div className="print:hidden">
        <BackToGiveLink locale={locale} />
      </div>
    </div>
  );
}
