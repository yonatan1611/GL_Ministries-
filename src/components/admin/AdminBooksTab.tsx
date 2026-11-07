"use client";

import { useMemo, useState } from "react";
import { Download, Loader2, Star } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import type { BookOrderRecord } from "@/lib/db";
import type { Book } from "@/types/ministry";
import { downloadCsv } from "@/lib/csv";

export function AdminBooksTab({
  locale,
  bookOrders,
  books,
  onChanged,
}: {
  locale: Locale;
  bookOrders: BookOrderRecord[];
  books: Book[];
  onChanged: () => void;
}) {
  const dict = getDictionary(locale);

  const sorted = useMemo(
    () => [...bookOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bookOrders]
  );
  const totalCompleted = bookOrders
    .filter((o) => o.paymentStatus === "completed")
    .reduce((sum, o) => sum + o.totalUsd, 0);

  function handleExport() {
    downloadCsv(
      "glm-book-orders.csv",
      sorted.map((order) => ({
        date: order.createdAt,
        orderNumber: order.orderNumber,
        customer: order.customerName,
        email: order.customerEmail,
        items: order.items.map((item) => `${item.titleEn} (${item.format} x${item.quantity})`).join(" | "),
        totalUsd: order.totalUsd,
        status: order.paymentStatus,
        shippingCity: order.shippingCity ?? "",
        shippingCountry: order.shippingCountry ?? "",
      }))
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-navy-900">
            {dict.admin.totalLabel}: ${totalCompleted.toLocaleString()}
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
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString(locale === "am" ? "am-ET" : "en-US")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {order.items.map((item) => `${item.titleEn} (${item.format} ×${item.quantity})`).join(", ")}
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy-900">${order.totalUsd.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          order.paymentStatus === "completed"
                            ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700"
                        }
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-navy-900">Current Catalog</p>
        <p className="mt-1 text-xs text-slate-500">
          Edit a price and click Save, or star a title to make it the current Monthly Partner Offer (only one book
          carries it at a time — starring one unstars the rest). Titles/synopsis stay source-controlled.
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Print</th>
                <th className="px-4 py-3">PDF</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3">Monthly Offer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.map((book) => (
                <BookCatalogRow key={book.id} locale={locale} book={book} onChanged={onChanged} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BookCatalogRow({ locale, book, onChanged }: { locale: Locale; book: Book; onChanged: () => void }) {
  const [priceUsdPrint, setPriceUsdPrint] = useState(String(book.priceUsdPrint));
  const [priceUsdPdf, setPriceUsdPdf] = useState(String(book.priceUsdPdf));
  const [isSaving, setIsSaving] = useState(false);
  const [isTogglingOffer, setIsTogglingOffer] = useState(false);

  const isDirty = priceUsdPrint !== String(book.priceUsdPrint) || priceUsdPdf !== String(book.priceUsdPdf);

  async function patchBook(patch: Record<string, unknown>) {
    await fetch(`/api/admin/books/${book.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    onChanged();
  }

  async function handleSavePrice() {
    const nextPrint = Number(priceUsdPrint);
    const nextPdf = Number(priceUsdPdf);
    if (!Number.isFinite(nextPrint) || nextPrint <= 0 || !Number.isFinite(nextPdf) || nextPdf <= 0) return;
    setIsSaving(true);
    try {
      await patchBook({ priceUsdPrint: nextPrint, priceUsdPdf: nextPdf });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSetMonthlyOffer() {
    if (book.isMonthlySpecialOffer) return;
    setIsTogglingOffer(true);
    try {
      await patchBook({ isMonthlySpecialOffer: true });
    } finally {
      setIsTogglingOffer(false);
    }
  }

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-navy-900">{locale === "am" ? book.titleAm : book.titleEn}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-slate-600">
          $
          <input
            type="number"
            min={1}
            step="0.01"
            value={priceUsdPrint}
            onChange={(e) => setPriceUsdPrint(e.target.value)}
            className="w-16 rounded border border-slate-300 px-1.5 py-1 text-sm"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-slate-600">
          $
          <input
            type="number"
            min={1}
            step="0.01"
            value={priceUsdPdf}
            onChange={(e) => setPriceUsdPdf(e.target.value)}
            className="w-16 rounded border border-slate-300 px-1.5 py-1 text-sm"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        {isDirty && (
          <button
            type="button"
            onClick={handleSavePrice}
            disabled={isSaving}
            className="flex items-center gap-1 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
            Save
          </button>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={handleSetMonthlyOffer}
          disabled={isTogglingOffer || book.isMonthlySpecialOffer}
          aria-pressed={book.isMonthlySpecialOffer}
          className="flex items-center gap-1 text-xs font-semibold disabled:cursor-default"
        >
          <Star
            className={
              book.isMonthlySpecialOffer ? "h-4 w-4 fill-amber-500 text-amber-500" : "h-4 w-4 text-slate-300"
            }
            aria-hidden="true"
          />
          {book.isMonthlySpecialOffer ? "Current Offer" : "Make Offer"}
        </button>
      </td>
    </tr>
  );
}
