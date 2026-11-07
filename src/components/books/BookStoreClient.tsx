"use client";

import { useState } from "react";
import { Mail, ShoppingBag } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { HQ_EMAIL, DC_EMAIL } from "@/data/locations";
import type { Locale } from "@/lib/utils";
import type { Book } from "@/types/ministry";
import { useCart } from "@/components/providers/AppProviders";
import { BookCard } from "@/components/books/BookCard";
import { BookExcerptModal } from "@/components/books/BookExcerptModal";

export function BookStoreClient({ locale, books }: { locale: Locale; books: Book[] }) {
  const dict = getDictionary(locale);
  const { totalItems, setIsCartOpen } = useCart();
  const [excerptBook, setExcerptBook] = useState<Book | null>(null);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-end rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-900"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          {dict.booksPage.viewCartTemplate.replace("{count}", String(totalItems))}
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {books.map((book) => (
          <BookCard key={book.id} locale={locale} book={book} onReadExcerpt={setExcerptBook} />
        ))}
      </div>

      <div className="rounded-2xl border border-navy-800 bg-navy-950 p-6 text-white sm:p-8">
        <h2 className="font-display text-lg font-bold">{dict.booksPage.bulkOrderTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">{dict.booksPage.bulkOrderBody}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`mailto:${HQ_EMAIL}?subject=Bulk Book Order Inquiry`}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {dict.booksPage.bulkOrderHqCta}
          </a>
          <a
            href={`mailto:${DC_EMAIL}?subject=Bulk Book Order Inquiry`}
            className="flex items-center gap-1.5 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-navy-800"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {dict.booksPage.bulkOrderUsCta}
          </a>
        </div>
      </div>

      <BookExcerptModal locale={locale} book={excerptBook} onClose={() => setExcerptBook(null)} />
    </div>
  );
}
