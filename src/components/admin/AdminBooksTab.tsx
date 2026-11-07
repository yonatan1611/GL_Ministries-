"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import type { BookOrderRecord } from "@/lib/db";
import type { Book } from "@/types/ministry";
import { downloadCsv } from "@/lib/csv";

export function AdminBooksTab({
  locale,
  bookOrders,
  books,
}: {
  locale: Locale;
  bookOrders: BookOrderRecord[];
  books: Book[];
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
          Prices and titles are managed in source data for now — catalog editing from this portal is a planned
          follow-up, not wired yet.
        </p>
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Print</th>
                <th className="px-4 py-3">PDF</th>
                <th className="px-4 py-3">Monthly Offer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.map((book) => (
                <tr key={book.id}>
                  <td className="px-4 py-3 font-medium text-navy-900">
                    {locale === "am" ? book.titleAm : book.titleEn}
                  </td>
                  <td className="px-4 py-3 text-slate-600">${book.priceUsdPrint}</td>
                  <td className="px-4 py-3 text-slate-600">${book.priceUsdPdf}</td>
                  <td className="px-4 py-3">{book.isMonthlySpecialOffer ? "✓" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
