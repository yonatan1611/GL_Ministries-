"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Gift, Loader2, Pencil, Plus, Star, Trash2, Upload, X } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { BookOrderRecord } from "@/lib/db";
import type { Book } from "@/types/ministry";
import { downloadCsv } from "@/lib/csv";
import { BookCoverImage } from "@/components/books/BookCoverImage";

type FormState = {
  titleEn: string;
  titleAm: string;
  authorEn: string;
  authorAm: string;
  coverImageUrl: string;
  priceUsdPrint: string;
  priceUsdPdf: string;
  pages: string;
  isbn: string;
  synopsisEn: string;
  synopsisAm: string;
  topics: string;
  isMonthlySpecialOffer: boolean;
  inStock: boolean;
};

const EMPTY_FORM: FormState = {
  titleEn: "",
  titleAm: "",
  authorEn: "Apostle Daniel Makonnen",
  authorAm: "ሐዋሪያው ዳንኤል መኮንን",
  coverImageUrl: "",
  priceUsdPrint: "",
  priceUsdPdf: "",
  pages: "",
  isbn: "",
  synopsisEn: "",
  synopsisAm: "",
  topics: "",
  isMonthlySpecialOffer: false,
  inStock: true,
};

function toForm(book: Book): FormState {
  return {
    titleEn: book.titleEn,
    titleAm: book.titleAm,
    authorEn: book.authorEn,
    authorAm: book.authorAm,
    coverImageUrl: book.coverImageUrl ?? "",
    priceUsdPrint: String(book.priceUsdPrint),
    priceUsdPdf: String(book.priceUsdPdf),
    pages: book.pages ? String(book.pages) : "",
    isbn: book.isbn ?? "",
    synopsisEn: book.synopsisEn,
    synopsisAm: book.synopsisAm,
    topics: book.topics.join(", "),
    isMonthlySpecialOffer: Boolean(book.isMonthlySpecialOffer),
    inStock: book.inStock !== false,
  };
}

type FulfillmentStatus = NonNullable<BookOrderRecord["fulfillmentStatus"]>;
const FULFILLMENT_STATUSES: FulfillmentStatus[] = ["pending", "shipped", "completed"];
const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  pending: "Pending Shipping",
  shipped: "Shipped",
  completed: "Completed",
};

/**
 * Book Store Catalog & Customer Orders: Sub-Tab A is full add/edit/
 * feature/delete catalog management (cover upload-or-URL, pricing,
 * descriptions, Monthly Partner Offer toggle); Sub-Tab B is the
 * customer order ledger with a per-row packing/shipping status
 * selector and CSV export.
 */
export function AdminBooksModule({
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subTab, setSubTab] = useState<"catalog" | "orders">("orders");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

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
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus ?? "pending",
        shippingCity: order.shippingCity ?? "",
        shippingCountry: order.shippingCountry ?? "",
      }))
    );
  }

  async function handleFulfillmentChange(order: BookOrderRecord, status: FulfillmentStatus) {
    setBusyId(order.id);
    try {
      await fetch("/api/books/checkout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, fulfillmentStatus: status }),
      });
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  function startEdit(book: Book) {
    setSubTab("catalog");
    setEditingId(book.id);
    setForm(toForm(book));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChosen(file: File | null) {
    if (!file) return;
    setError(null);
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.error ?? "Upload failed.");
        return;
      }
      setForm((f) => ({ ...f, coverImageUrl: result.imageUrl as string }));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/books?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (response.ok) {
        if (editingId === id) cancelEdit();
        onChanged();
      }
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleOffer(book: Book) {
    if (book.isMonthlySpecialOffer) return;
    setBusyId(book.id);
    try {
      await fetch("/api/books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: book.id, isMonthlySpecialOffer: true }),
      });
      onChanged();
    } finally {
      setBusyId(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const priceUsdPrint = Number(form.priceUsdPrint);
    const priceUsdPdf = Number(form.priceUsdPdf);
    if (!form.titleEn.trim()) {
      setError("Book Title (English) is required.");
      return;
    }
    if (!form.synopsisEn.trim()) {
      setError("Book Description / Synopsis (English) is required.");
      return;
    }
    if (!Number.isFinite(priceUsdPrint) || priceUsdPrint <= 0 || !Number.isFinite(priceUsdPdf) || priceUsdPdf <= 0) {
      setError("Print and PDF prices must be positive numbers.");
      return;
    }

    const payload = {
      titleEn: form.titleEn,
      titleAm: form.titleAm || form.titleEn,
      authorEn: form.authorEn,
      authorAm: form.authorAm,
      coverImageUrl: form.coverImageUrl || undefined,
      priceUsdPrint,
      priceUsdPdf,
      pages: form.pages ? Number(form.pages) : undefined,
      isbn: form.isbn || undefined,
      synopsisEn: form.synopsisEn,
      synopsisAm: form.synopsisAm || form.synopsisEn,
      topics: form.topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isMonthlySpecialOffer: form.isMonthlySpecialOffer,
      inStock: form.inStock,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/books", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        setError(result?.error ?? "Something went wrong.");
        return;
      }
      cancelEdit();
      onChanged();
    } finally {
      setIsSubmitting(false);
    }
  }

  function field(
    key: keyof Omit<FormState, "isMonthlySpecialOffer" | "inStock" | "coverImageUrl">,
    label: string,
    isTextarea = false
  ) {
    const value = form[key];
    const id = `admin-book-${key}`;
    return (
      <div>
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
          {label}
        </label>
        {isTextarea ? (
          <textarea
            id={id}
            rows={3}
            value={value}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        ) : (
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl font-bold text-navy-900">Book Store Catalog & Customer Orders</h1>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setSubTab("orders")}
          className={cn(
            "rounded-t-lg px-4 py-2 text-sm font-semibold",
            subTab === "orders" ? "border-b-2 border-amber-600 text-amber-700" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Customer Orders & Fulfillment
        </button>
        <button
          type="button"
          onClick={() => setSubTab("catalog")}
          className={cn(
            "rounded-t-lg px-4 py-2 text-sm font-semibold",
            subTab === "catalog" ? "border-b-2 border-amber-600 text-amber-700" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Manage Books Catalog
        </button>
      </div>

      {subTab === "orders" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-navy-900">
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
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Fulfillment</th>
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
                      <td className="px-4 py-3">
                        <select
                          value={order.fulfillmentStatus ?? "pending"}
                          onChange={(e) => handleFulfillmentChange(order, e.target.value as FulfillmentStatus)}
                          disabled={busyId === order.id}
                          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                        >
                          {FULFILLMENT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {FULFILLMENT_LABELS[status]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === "catalog" && (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-500">
              Edit any title below, star one as the current Monthly Partner Offer (only one book carries it at a
              time), or delete a title entirely.
            </p>

            {books.length === 0 ? (
              <p className="text-sm text-slate-500">{dict.admin.noDataLabel}</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                  <div key={book.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex gap-3">
                      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg border border-amber-500/30 bg-navy-900">
                        {book.coverImageUrl ? (
                          <BookCoverImage src={book.coverImageUrl} alt={book.titleEn} fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-amber-300">
                            No Cover
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy-900">
                          {locale === "am" ? book.titleAm : book.titleEn}
                        </p>
                        <p className="mt-0.5 h-8 overflow-hidden px-0 pt-0 text-xs leading-4 text-slate-500">
                          {locale === "am" ? book.synopsisAm : book.synopsisEn}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-amber-700">
                          ${book.priceUsdPdf} PDF / ${book.priceUsdPrint} Print
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {book.isMonthlySpecialOffer ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                          <Gift className="h-3 w-3" aria-hidden="true" />
                          Featured Monthly Offer
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleOffer(book)}
                          disabled={busyId === book.id}
                          className="flex items-center gap-1 rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                        >
                          <Star className="h-3 w-3" aria-hidden="true" />
                          Make Monthly Offer
                        </button>
                      )}
                      {book.inStock === false && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(book)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(book.id)}
                        disabled={busyId === book.id}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
                {editingId ? <Pencil className="h-4 w-4 text-amber-600" aria-hidden="true" /> : <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />}
                {editingId ? "Edit Book Details" : "Add a New Book to the Store"}
              </p>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
              <div className="relative h-40 w-28 shrink-0 overflow-hidden rounded-lg border border-amber-500/30 bg-navy-900">
                {form.coverImageUrl ? (
                  <BookCoverImage src={form.coverImageUrl} alt="Cover preview" fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-amber-300">
                    No Cover Selected
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">Book Cover Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs text-slate-600"
                />
                {isUploading && (
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                    Uploading...
                  </p>
                )}
                <p className="text-xs text-slate-400">— or —</p>
                <div className="flex items-center gap-2">
                  <Upload className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Paste an image URL, e.g. https://glministries.org/wp-content/uploads/...png"
                    value={form.coverImageUrl}
                    onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field("titleEn", "Book Title (English)")}
              {field("titleAm", "Book Title (Amharic — አማርኛ, optional)")}
              {field("authorEn", "Author Name (English)")}
              {field("authorAm", "Author Name (Amharic)")}
              {field("priceUsdPrint", "Print Paperback Price ($ USD)")}
              {field("priceUsdPdf", "Digital PDF eBook Price ($ USD)")}
              {field("pages", "Page Count")}
              {field("isbn", "ISBN (optional)")}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {field("synopsisEn", "Book Description / Synopsis (English)", true)}
              {field("synopsisAm", "Book Description / Synopsis (Amharic — optional, falls back to English)", true)}
            </div>

            <div className="mt-3">{field("topics", "Topics / Categories (comma-separated, e.g. Holy Spirit, Prayer, Discipleship)")}</div>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isMonthlySpecialOffer}
                  onChange={(e) => setForm((f) => ({ ...f, isMonthlySpecialOffer: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                Feature this book as the &quot;Monthly Partner Special Offer&quot; on the Homepage &amp; Give Page
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                In Stock
              </label>
            </div>

            {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {editingId ? "Update Book Details" : "+ Add Book to Store"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
