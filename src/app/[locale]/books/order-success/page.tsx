import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Download, Truck } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import { findBookOrder, updateBookOrder, type BookOrderRecord } from "@/lib/db";
import { isStripeLiveConfigured, retrieveCheckoutSession } from "@/lib/stripe";

interface OrderSuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; session_id?: string }>;
}

// Reads the live order from src/lib/db.ts (Neon Postgres) by query
// param — force dynamic rendering so this never gets statically
// prerendered at build time, which would both require DATABASE_URL to
// be reachable during every build and bake in a stale/empty order.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: OrderSuccessPageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  const dict = getDictionary(loc);
  return { title: dict.cart.orderSuccessTitle };
}

/**
 * Real post-payment book order confirmation — fetches the actual order
 * from `src/lib/db.ts` and, for each completed PDF line, links to the
 * token-gated `/api/books/download/[bookId]` endpoint. Mirrors
 * `/give/success`'s Stripe-session fallback: if the webhook hasn't
 * landed yet, verifies directly with Stripe so the page doesn't get
 * stuck showing "pending" for an order that actually paid.
 */
export default async function BooksOrderSuccessPage({ params, searchParams }: OrderSuccessPageProps) {
  const { locale: rawLocale } = await params;
  if (!isSupportedLocale(rawLocale)) notFound();
  const locale = rawLocale;
  const { ref, session_id: sessionId } = await searchParams;

  let order: BookOrderRecord | null = await findBookOrder({ orderNumber: ref, stripeSessionId: sessionId });

  if (order && order.paymentStatus === "pending" && sessionId && isStripeLiveConfigured) {
    try {
      const session = await retrieveCheckoutSession(sessionId);
      if (session.payment_status === "paid") {
        order = await updateBookOrder(
          { orderNumber: order.orderNumber },
          { paymentStatus: "completed", completedAt: new Date().toISOString() }
        );
      }
    } catch {
      // Stripe lookup failed — the webhook will still reconcile this.
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {!order ? (
          <NotFoundCard locale={locale} />
        ) : order.paymentStatus === "completed" ? (
          <OrderCard locale={locale} order={order} />
        ) : (
          <PendingCard locale={locale} order={order} />
        )}
      </div>
    </main>
  );
}

function BackToBooksLink({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <Link href={`/${locale}/books`} className="mt-6 inline-block text-sm font-semibold text-amber-700 hover:text-amber-800">
      &larr; {dict.cart.backToBooksLabel}
    </Link>
  );
}

function NotFoundCard({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="font-display text-xl font-bold text-navy-900">{dict.cart.orderNotFoundTitle}</h1>
      <p className="mt-2 text-sm text-slate-600">{dict.cart.orderNotFoundBody}</p>
      <BackToBooksLink locale={locale} />
    </div>
  );
}

function PendingCard({ locale, order }: { locale: Locale; order: BookOrderRecord }) {
  const dict = getDictionary(locale);
  return (
    <div className="rounded-2xl border border-amber-300 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-2 text-amber-700">
        <Clock className="h-5 w-5" aria-hidden="true" />
        <h1 className="font-display text-xl font-bold text-navy-900">{dict.cart.pendingOrderTitle}</h1>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{dict.cart.pendingOrderBody}</p>
      <p className="mt-4 text-sm">
        <span className="text-slate-500">{dict.cart.orderNumberLabel}: </span>
        <span className="font-mono font-semibold text-navy-900">{order.orderNumber}</span>
      </p>
      <BackToBooksLink locale={locale} />
    </div>
  );
}

function OrderCard({ locale, order }: { locale: Locale; order: BookOrderRecord }) {
  const dict = getDictionary(locale);
  const hasPrintItem = order.items.some((item) => item.format === "Print");
  const dateLabel = new Date(order.completedAt ?? order.createdAt).toLocaleString(
    locale === "am" ? "am-ET" : "en-US"
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        <p className="text-sm font-semibold uppercase tracking-wide">{dict.cart.orderThankYou}</p>
      </div>

      <h1 className="mt-3 font-display text-2xl font-bold text-navy-900">{dict.cart.orderSuccessTitle}</h1>

      <dl className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">{dict.cart.orderNumberLabel}</dt>
          <dd className="font-mono font-semibold text-navy-900">{order.orderNumber}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{dict.forms.fullName}</dt>
          <dd className="font-medium text-navy-900">{order.customerName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">{locale === "am" ? "ቀን" : "Date"}</dt>
          <dd className="font-medium text-navy-900">{dateLabel}</dd>
        </div>
      </dl>

      <ul className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4">
        {order.items.map((item) => (
          <li key={`${item.bookId}-${item.format}`} className="flex items-center justify-between gap-4 text-sm">
            <div>
              <p className="font-medium text-navy-900">{locale === "am" ? item.titleAm : item.titleEn}</p>
              <p className="text-xs text-slate-500">
                {item.format} &middot; &times;{item.quantity} &middot; ${(item.unitPriceUsd * item.quantity).toFixed(2)}
              </p>
            </div>
            {item.format === "PDF" && item.downloadToken && (
              <a
                href={`/api/books/download/${item.bookId}?order=${encodeURIComponent(order.orderNumber)}&token=${encodeURIComponent(item.downloadToken)}`}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-700"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {dict.cart.downloadPdfButton}
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="font-semibold text-navy-900">{dict.cart.subtotalUsd}</span>
        <span className="font-semibold text-navy-900">${order.totalUsd.toFixed(2)}</span>
      </div>

      {hasPrintItem && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-800">
          <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {dict.cart.printOrderShipsNote}
        </p>
      )}

      <BackToBooksLink locale={locale} />
    </div>
  );
}
