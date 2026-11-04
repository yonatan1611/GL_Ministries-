"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck, Wallet } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

interface InteractivePaymentGatewayModalProps {
  isOpen: boolean;
  locale: Locale;
  amountUsd: number;
  paymentMethod: "card" | "apple_pay";
  onClose: () => void;
  /** Called once the entered details pass local validation — the
   *  parent actually submits to `/api/give`, which (since no real
   *  Stripe key is configured) records the gift as completed and
   *  returns the receipt redirect. */
  onConfirm: () => Promise<void>;
}

type FieldErrors = Partial<Record<"cardNumber" | "expiry" | "cvc" | "zip", string>>;

/** Standard Luhn checksum — accepts Stripe's `4242 4242 4242 4242` test
 *  number and any other digit string that passes the check. */
function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/**
 * Interactive test-mode card / Apple Pay checkout shown only when the
 * client has not yet configured a real `STRIPE_SECRET_KEY` (see
 * `isStripeLiveConfigured` in `src/lib/stripe.ts`) — lets the donor
 * (and the client, in a demo) run the full giving flow end-to-end
 * today. The moment a real Stripe key is added this modal stops being
 * rendered and the donor is sent to real Stripe Checkout instead.
 */
export function InteractivePaymentGatewayModal({
  isOpen,
  locale,
  amountUsd,
  paymentMethod,
  onClose,
  onConfirm,
}: InteractivePaymentGatewayModalProps) {
  const dict = getDictionary(locale);
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/30");
  const [cvc, setCvc] = useState("123");
  const [zip, setZip] = useState("22312");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const amountLabel = `$${amountUsd.toLocaleString()}`;

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (!luhnCheck(cardNumber)) nextErrors.cardNumber = dict.give.cardNumberInvalid;

    const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(expiry);
    if (!expiryMatch) {
      nextErrors.expiry = dict.give.cardExpiryInvalid;
    } else {
      const month = Number(expiryMatch[1]);
      const year = 2000 + Number(expiryMatch[2]);
      const expiresAtMonthEnd = new Date(year, month, 0, 23, 59, 59);
      if (month < 1 || month > 12 || expiresAtMonthEnd < new Date()) {
        nextErrors.expiry = dict.give.cardExpiryInvalid;
      }
    }

    if (!/^\d{3,4}$/.test(cvc)) nextErrors.cvc = dict.give.cardCvcInvalid;
    if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/.test(zip.trim())) nextErrors.zip = dict.give.cardZipInvalid;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleConfirm() {
    if (paymentMethod === "card" && !validate()) return;
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  }

  const payLabel = (
    paymentMethod === "card" ? dict.give.payNowButtonTemplate : dict.give.applePaySimulateButtonTemplate
  ).replace("{amount}", amountLabel);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dict.give.payModalTitle} closeLabel={dict.buttons.close}>
      <div className="flex flex-col gap-4 text-sm text-slate-700">
        <div className="flex items-start gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-800">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {dict.give.payModalTestModeNotice}
        </div>

        {paymentMethod === "card" ? (
          <>
            <div>
              <label htmlFor="pay-card-number" className="mb-1 block text-xs font-medium text-slate-600">
                {dict.give.cardNumberLabel}
              </label>
              <input
                id="pay-card-number"
                inputMode="numeric"
                autoComplete="cc-number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className={`w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none ${
                  errors.cardNumber ? "border-red-500" : "border-slate-300 focus:border-amber-500"
                }`}
              />
              {errors.cardNumber && <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="pay-expiry" className="mb-1 block text-xs font-medium text-slate-600">
                  {dict.give.cardExpiryLabel}
                </label>
                <input
                  id="pay-expiry"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  className={`w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none ${
                    errors.expiry ? "border-red-500" : "border-slate-300 focus:border-amber-500"
                  }`}
                />
                {errors.expiry && <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>}
              </div>
              <div>
                <label htmlFor="pay-cvc" className="mb-1 block text-xs font-medium text-slate-600">
                  {dict.give.cardCvcLabel}
                </label>
                <input
                  id="pay-cvc"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className={`w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none ${
                    errors.cvc ? "border-red-500" : "border-slate-300 focus:border-amber-500"
                  }`}
                />
                {errors.cvc && <p className="mt-1 text-xs text-red-600">{errors.cvc}</p>}
              </div>
              <div>
                <label htmlFor="pay-zip" className="mb-1 block text-xs font-medium text-slate-600">
                  {dict.give.cardZipLabel}
                </label>
                <input
                  id="pay-zip"
                  autoComplete="postal-code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.slice(0, 10))}
                  className={`w-full rounded-lg border px-3 py-2 font-mono text-sm focus:outline-none ${
                    errors.zip ? "border-red-500" : "border-slate-300 focus:border-amber-500"
                  }`}
                />
                {errors.zip && <p className="mt-1 text-xs text-red-600">{errors.zip}</p>}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-6 text-navy-900">
            <Wallet className="h-6 w-6" aria-hidden="true" />
            <span className="font-semibold">Apple Pay / Google Pay</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isProcessing}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {dict.give.processingLabel}
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              {payLabel}
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
