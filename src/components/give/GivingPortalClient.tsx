"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  CreditCard,
  ExternalLink,
  Gift,
  Globe2,
  Heart,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Radio,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { getDictionary } from "@/data/i18n";
import {
  donationSchema,
  DONATION_FUNDS,
  type DonationFund,
  type DonationPaymentMethod,
} from "@/lib/validations";
import { postJson } from "@/lib/http";
import { HQ_EMAIL, HQ_PHONE, DC_EMAIL, DC_PHONE } from "@/data/locations";
import { BOOKS } from "@/data/ministry-content";
import { SOCIAL_LINKS } from "@/data/social-media";
import { cn, type Locale } from "@/lib/utils";
import { useToast } from "@/components/providers/AppProviders";
import { MinistryImage } from "@/components/ui/MinistryImage";
import { StewardshipReceiptModal, type GivingReceiptData } from "@/components/give/StewardshipReceiptModal";

type Frequency = "one-time" | "monthly" | "annual";

const USD_PRESETS = [35, 50, 100, 250, 500];
const MONTHLY_PARTNER_USD = 35;

const MONTHLY_OFFER_BOOK = BOOKS.find((book) => book.isMonthlySpecialOffer);

const PAYMENT_METHOD_ICONS: Record<DonationPaymentMethod, typeof CreditCard> = {
  card: CreditCard,
  apple_pay: Wallet,
  tithely: ExternalLink,
  check: Landmark,
};

interface FormState {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  prayerNote: string;
}

const EMPTY_FORM: FormState = { donorName: "", donorEmail: "", donorPhone: "", prayerNote: "" };

/**
 * USD-only Giving & Covenant Partnership Portal. Stripe card, Apple Pay /
 * Google Pay, Tithe.ly, and Check by Mail are the only payment rails —
 * there is no currency switcher and no local Ethiopian payment rail
 * here; Ethiopian branches and stations are supported through the
 * ministry's standard USD giving channels instead.
 */
export function GivingPortalClient({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const [amount, setAmount] = useState<number>(100);
  const [customAmountInput, setCustomAmountInput] = useState("");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const [fund, setFund] = useState<DonationFund>(DONATION_FUNDS[0]);
  const [paymentMethod, setPaymentMethod] = useState<DonationPaymentMethod>("card");
  const [claimMonthlyBookOffer, setClaimMonthlyBookOffer] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<GivingReceiptData | null>(null);

  // Deep-linked from the homepage Monthly Offer banner
  // (`/give?offer=<slug>#partnership`) — pre-selects Monthly Partner
  // giving and the book-offer checkbox so the visitor lands one click
  // from claiming it.
  useEffect(() => {
    const offerSlug = searchParams.get("offer");
    if (!offerSlug || !MONTHLY_OFFER_BOOK || offerSlug !== MONTHLY_OFFER_BOOK.slug) return;
    setFrequency("monthly");
    setClaimMonthlyBookOffer(true);
    setAmount(MONTHLY_PARTNER_USD);
  }, [searchParams]);

  const paymentOptions: { value: DonationPaymentMethod; label: string }[] = [
    { value: "card", label: dict.give.paymentCardLabel },
    { value: "apple_pay", label: dict.give.paymentApplePayLabel },
    { value: "tithely", label: dict.give.paymentTithelyLabel },
    { value: "check", label: dict.give.paymentCheckLabel },
  ];

  function handlePresetClick(value: number) {
    setAmount(value);
    setIsCustomAmount(false);
    setCustomAmountInput("");
  }

  function handleCustomAmountChange(value: string) {
    setCustomAmountInput(value);
    setIsCustomAmount(true);
    const parsed = Number(value);
    if (!Number.isNaN(parsed) && parsed > 0) setAmount(parsed);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const payload = {
      currency: "USD" as const,
      amount,
      frequency,
      fund,
      paymentMethod,
      donorName: form.donorName,
      donorEmail: form.donorEmail,
      donorPhone: form.donorPhone || undefined,
      prayerNote: form.prayerNote || undefined,
      claimMonthlyBookOffer: frequency === "one-time" ? false : claimMonthlyBookOffer,
    };

    const localCheck = donationSchema.safeParse(payload);
    if (!localCheck.success) {
      const fieldErrors: Partial<Record<string, string>> = {};
      for (const issue of localCheck.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      showToast(dict.forms.error, "error");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    const { result } = await postJson<GivingReceiptData>("/api/give", payload);
    setIsSubmitting(false);

    if (!result || !result.success) {
      showToast((result && !result.success && result.error) || dict.forms.error, "error");
      return;
    }

    setReceipt(result.data);
    setForm(EMPTY_FORM);
    showToast(dict.give.receiptThankYou, "success");
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left column: giving form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:col-span-2">
        {MONTHLY_OFFER_BOOK && (
          <div
            id="partnership"
            className="flex flex-col gap-6 rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm sm:flex-row sm:items-center"
          >
            {MONTHLY_OFFER_BOOK.coverImageUrl && (
              <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-xl border border-amber-500/40 shadow-md">
                <MinistryImage
                  src={MONTHLY_OFFER_BOOK.coverImageUrl}
                  alt={locale === "am" ? MONTHLY_OFFER_BOOK.titleAm : MONTHLY_OFFER_BOOK.titleEn}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900 sm:text-xl">
                <Gift className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                {dict.give.partnershipBannerTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{dict.give.partnershipBannerBody}</p>

              <label className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-white p-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={claimMonthlyBookOffer}
                  disabled={frequency === "one-time"}
                  onChange={(e) => setClaimMonthlyBookOffer(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-amber-600"
                />
                <span>
                  {dict.give.claimOfferCheckboxTemplate.replace(
                    "{title}",
                    locale === "am" ? MONTHLY_OFFER_BOOK.titleAm : MONTHLY_OFFER_BOOK.titleEn
                  )}
                </span>
              </label>
              {frequency === "one-time" && (
                <p className="mt-1.5 text-xs text-amber-700">{dict.give.claimOfferMonthlyOnlyNote}</p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mt-6">
            <p className="text-sm font-semibold text-navy-800">{dict.give.amountSectionLabel}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {USD_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePresetClick(preset)}
                  aria-pressed={!isCustomAmount && amount === preset}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm font-semibold",
                    !isCustomAmount && amount === preset
                      ? "border-amber-600 bg-amber-50 text-amber-800"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {`$${preset}`}
                  {preset === MONTHLY_PARTNER_USD && (
                    <span className="ml-1 block text-[10px] font-normal text-amber-700">
                      {dict.give.monthlyPartnerSuffix}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label htmlFor="give-custom-amount" className="sr-only">
                {dict.give.customAmountLabel}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input
                  id="give-custom-amount"
                  type="number"
                  min={1}
                  placeholder={dict.give.customAmountLabel}
                  value={customAmountInput}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className={cn(
                    "w-full rounded-lg border py-2.5 pl-8 pr-3 text-sm focus:border-amber-500 focus:outline-none",
                    isCustomAmount ? "border-amber-500" : "border-slate-300"
                  )}
                />
              </div>
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-navy-800">{dict.give.paymentMethodLabel}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {paymentOptions.map((option) => {
                const Icon = PAYMENT_METHOD_ICONS[option.value];
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPaymentMethod(option.value)}
                    aria-pressed={paymentMethod === option.value}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium",
                      paymentMethod === option.value
                        ? "border-amber-600 bg-amber-50 text-amber-800"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === "tithely" && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-amber-400 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">{dict.give.tithelyBoxBody}</p>
              <a
                href={SOCIAL_LINKS.tithelyGivingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                {dict.give.launchTithelyCta}
              </a>
            </div>
          )}

          {paymentMethod === "check" && (
            <div className="mt-5 rounded-xl border border-dashed border-amber-400 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">{dict.give.checkBoxBody}</p>
              <p className="mt-2 text-sm font-semibold text-navy-900">
                Gospel Light Ministries International
              </p>
              <p className="text-sm text-amber-700">85 South Bragg St, Suite 200, Alexandria, VA 22312</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-navy-800">{dict.give.sectionTitle}</p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(["one-time", "monthly", "annual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFrequency(option)}
                aria-pressed={frequency === option}
                className={cn(
                  "rounded-lg border px-3 py-2.5 text-sm font-medium",
                  frequency === option
                    ? "border-amber-600 bg-amber-50 text-amber-800"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                )}
              >
                {option === "one-time"
                  ? dict.give.frequencyOneTime
                  : option === "monthly"
                    ? dict.give.frequencyMonthly
                    : dict.give.frequencyAnnual}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label htmlFor="give-fund" className="mb-1 block text-sm font-semibold text-navy-800">
              {dict.give.fundLabel}
            </label>
            <select
              id="give-fund"
              value={fund}
              onChange={(e) => setFund(e.target.value as DonationFund)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            >
              {DONATION_FUNDS.map((option) => (
                <option key={option} value={option}>
                  {dict.give.funds[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-navy-800">{dict.give.donorDetailsTitle}</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="give-name" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.forms.fullName}
              </label>
              <input
                id="give-name"
                type="text"
                value={form.donorName}
                onChange={(e) => setForm((f) => ({ ...f, donorName: e.target.value }))}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-sm",
                  errors.donorName ? "border-red-500" : "border-slate-300"
                )}
              />
              {errors.donorName && <p className="mt-1 text-xs text-red-600">{errors.donorName}</p>}
            </div>
            <div>
              <label htmlFor="give-email" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.forms.email}
              </label>
              <input
                id="give-email"
                type="email"
                value={form.donorEmail}
                onChange={(e) => setForm((f) => ({ ...f, donorEmail: e.target.value }))}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-sm",
                  errors.donorEmail ? "border-red-500" : "border-slate-300"
                )}
              />
              {errors.donorEmail && <p className="mt-1 text-xs text-red-600">{errors.donorEmail}</p>}
            </div>
            <div>
              <label htmlFor="give-phone" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.forms.phone}
              </label>
              <input
                id="give-phone"
                type="tel"
                value={form.donorPhone}
                onChange={(e) => setForm((f) => ({ ...f, donorPhone: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="give-prayer-note" className="mb-1 block text-xs font-medium text-slate-600">
              {dict.forms.prayerNote}
            </label>
            <textarea
              id="give-prayer-note"
              rows={3}
              value={form.prayerNote}
              onChange={(e) => setForm((f) => ({ ...f, prayerNote: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Heart className="h-4 w-4" aria-hidden="true" />
            )}
            {dict.give.submitGift}
          </button>
        </div>
      </form>

      {/* Right column: trust, impact, and mail-in giving */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-display text-base font-bold text-navy-900">{dict.give.impactTitle}</p>
          <div className="mt-4 flex flex-col gap-4">
            {[
              { icon: Globe2, title: dict.give.impactCongregationsTitle, body: dict.give.impactCongregationsBody },
              { icon: Building2, title: dict.give.impactPressTitle, body: dict.give.impactPressBody },
              { icon: Radio, title: dict.give.impactBroadcastTitle, body: dict.give.impactBroadcastBody },
            ].map((card) => (
              <div key={card.title} className="flex gap-3">
                <card.icon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-navy-800">{card.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-navy-800 bg-navy-950 p-6 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-400" aria-hidden="true" />
            <p className="font-display text-base font-bold">{dict.give.taxBadgeTitle}</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">{dict.give.taxBadgeBody}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-display text-base font-bold text-navy-900">{dict.give.checkWireTitle}</p>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {dict.give.usOfficeGiveLabel}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {dict.give.payableToLabel}: <span className="font-medium text-navy-900">Gospel Light Ministries International</span>
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              85 South Bragg Street, Suite 200, Alexandria, VA 22312
            </p>
            <a href={`tel:${DC_PHONE}`} className="mt-1 flex items-center gap-2 text-sm text-slate-600 hover:text-amber-700">
              <Phone className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              {DC_PHONE}
            </a>
            <a href={`mailto:${DC_EMAIL}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-700">
              <Mail className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              {DC_EMAIL}
            </a>
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {dict.give.addisOfficeGiveLabel}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              Aware, Kirkos Sub-City, P.O. Box 12992, Addis Ababa, Ethiopia
            </p>
            <a href={`tel:${HQ_PHONE}`} className="mt-1 flex items-center gap-2 text-sm text-slate-600 hover:text-amber-700">
              <Phone className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              {HQ_PHONE}
            </a>
            <a href={`mailto:${HQ_EMAIL}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-700">
              <Mail className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              {HQ_EMAIL}
            </a>
          </div>
        </div>
      </div>

      <StewardshipReceiptModal locale={locale} receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}
