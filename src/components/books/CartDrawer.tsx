"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { bookOrderSchema } from "@/lib/validations";
import { postJson } from "@/lib/http";
import { cn, getLocaleFromPathname } from "@/lib/utils";
import { MINISTRY_IMAGES } from "@/data/social-media";
import { useCart, useToast, type CartItem } from "@/components/providers/AppProviders";
import { BookCoverImage } from "@/components/books/BookCoverImage";
import { InteractivePaymentGatewayModal } from "@/components/give/InteractivePaymentGatewayModal";
import { STRIPE_IS_LIVE } from "@/lib/stripe-public";

type FormState = {
  customerName: string;
  customerEmail: string;
  shippingCity: string;
  shippingCountry: string;
};

const EMPTY_FORM: FormState = {
  customerName: "",
  customerEmail: "",
  shippingCity: "",
  shippingCountry: "",
};

/**
 * Slide-over book cart & checkout drawer, reachable from any page via the
 * `Navbar` cart trigger. Handles both digital PDF orders (instant email
 * delivery) and print orders (shipped from Alexandria, VA / Addis Ababa).
 */
export function CartDrawer() {
  const pathname = usePathname() ?? "/en";
  const locale = getLocaleFromPathname(pathname);
  const dict = getDictionary(locale);
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, subtotalUsd, clearCart } = useCart();
  const { showToast } = useToast();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!isCartOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsCartOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  function lineLabel(item: CartItem) {
    return locale === "am" ? item.titleAm : item.titleEn;
  }

  function formatLabel(format: CartItem["format"]) {
    return format === "Print" ? dict.cart.formatPrint : dict.cart.formatPdf;
  }

async function submitOrder(payload: Record<string, unknown>) {
    setIsSubmitting(true);
    const { result } = await postJson<{ redirectUrl?: string }>("/api/books/checkout", payload);
    setIsSubmitting(false);

    if (!result || !result.success) {
      showToast((result && !result.success && result.error) || dict.forms.error, "error");
      return;
    }

    clearCart();
    setForm(EMPTY_FORM);
    setIsCheckingOut(false);

    if (result.data?.redirectUrl) {
      window.location.href = result.data.redirectUrl;
      return;
    }

    setIsCartOpen(false);
    showToast(result.message, "success");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const payload = {
      items: items.map((item) => ({
        bookId: item.bookId,
        format: item.format,
        quantity: item.quantity,
      })),
      ...form,
      locale,
    };

    const localCheck = bookOrderSchema.safeParse(payload);
    if (!localCheck.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of localCheck.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (key in EMPTY_FORM) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      showToast(dict.forms.error, "error");
      return;
    }

    setErrors({});

    // No real Stripe key yet: collect card details in the local
    // interactive test-mode modal before this ever reaches the
    // server, same as the giving flow.
    if (!STRIPE_IS_LIVE) {
      setPendingPayload(payload);
      setShowPaymentModal(true);
      return;
    }

    await submitOrder(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label={dict.cart.closeAria}
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-navy-950/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={dict.cart.title}
        className="relative flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden overscroll-contain rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl sm:rounded-2xl sm:pb-0"
      >
        <span aria-hidden="true" className="mx-auto mb-1 mt-3 h-1.5 w-12 shrink-0 rounded-full bg-slate-300 sm:hidden" />
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900">
            <ShoppingBag className="h-5 w-5 text-amber-600" aria-hidden="true" />
            {dict.cart.title}
          </h2>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label={dict.cart.closeAria}
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-lg text-slate-500 transition-transform active:scale-[0.98] hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">{dict.cart.empty}</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={`${item.bookId}-${item.format}`}
                  className="flex gap-3 border-b border-slate-100 pb-4 last:border-0"
                >
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md border border-amber-500/30 bg-navy-900">
                    <BookCoverImage
                      src={item.coverImageUrl ?? MINISTRY_IMAGES.bookHearingGodsVoiceCover}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-navy-900">{lineLabel(item)}</p>
                    <p className="text-xs text-slate-500">{formatLabel(item.format)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={dict.cart.decrease}
                        onClick={() => updateQuantity(item.bookId, item.format, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={dict.cart.increase}
                        onClick={() => updateQuantity(item.bookId, item.format, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 text-slate-600 hover:bg-slate-50"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      aria-label={`${dict.cart.remove} — ${lineLabel(item)}`}
                      onClick={() => removeItem(item.bookId, item.format)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <div className="text-right text-xs text-slate-600">
                      <p>${(item.priceUsd * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-4">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">{dict.cart.subtotalUsd}</span>
              <span className="font-semibold text-navy-900">${subtotalUsd.toFixed(2)}</span>
            </div>

            {!isCheckingOut ? (
              <button
                type="button"
                onClick={() => setIsCheckingOut(true)}
                className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
              >
                {dict.cart.checkoutTitle}
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <p className="text-xs text-slate-500">{dict.cart.deliveryNote}</p>
                <div>
                  <label htmlFor="cart-name" className="mb-1 block text-xs font-medium text-slate-600">
                    {dict.forms.fullName}
                  </label>
                  <input
                    id="cart-name"
                    type="text"
                    autoComplete="name"
                    value={form.customerName}
                    onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm",
                      errors.customerName ? "border-red-500" : "border-slate-300"
                    )}
                  />
                  {errors.customerName && <p className="mt-1 text-xs text-red-600">{errors.customerName}</p>}
                </div>
                <div>
                  <label htmlFor="cart-email" className="mb-1 block text-xs font-medium text-slate-600">
                    {dict.forms.email}
                  </label>
                  <input
                    id="cart-email"
                    type="email"
                    autoComplete="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-sm",
                      errors.customerEmail ? "border-red-500" : "border-slate-300"
                    )}
                  />
                  {errors.customerEmail && <p className="mt-1 text-xs text-red-600">{errors.customerEmail}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="cart-city" className="mb-1 block text-xs font-medium text-slate-600">
                      {dict.forms.city}
                    </label>
                    <input
                      id="cart-city"
                      type="text"
                      value={form.shippingCity}
                      onChange={(e) => setForm((f) => ({ ...f, shippingCity: e.target.value }))}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2 text-sm",
                        errors.shippingCity ? "border-red-500" : "border-slate-300"
                      )}
                    />
                    {errors.shippingCity && <p className="mt-1 text-xs text-red-600">{errors.shippingCity}</p>}
                  </div>
                  <div>
                    <label htmlFor="cart-country" className="mb-1 block text-xs font-medium text-slate-600">
                      {dict.forms.country}
                    </label>
                    <input
                      id="cart-country"
                      type="text"
                      value={form.shippingCountry}
                      onChange={(e) => setForm((f) => ({ ...f, shippingCountry: e.target.value }))}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2 text-sm",
                        errors.shippingCountry ? "border-red-500" : "border-slate-300"
                      )}
                    />
                    {errors.shippingCountry && (
                      <p className="mt-1 text-xs text-red-600">{errors.shippingCountry}</p>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {dict.buttons.submit}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <InteractivePaymentGatewayModal
        isOpen={showPaymentModal && pendingPayload !== null}
        locale={locale}
        amountUsd={subtotalUsd}
        paymentMethod="card"
        onClose={() => setShowPaymentModal(false)}
        onConfirm={async () => {
          if (!pendingPayload) return;
          await submitOrder(pendingPayload);
        }}
      />
    </div>
  );
}
