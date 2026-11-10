"use client";

import { BookOpen, Gift } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import type { Book } from "@/types/ministry";
import { useCart, useToast } from "@/components/providers/AppProviders";
import { BookCoverImage } from "@/components/books/BookCoverImage";
import { TiltedCard } from "@/components/react-bits/TiltedCard";

interface BookCardProps {
  locale: Locale;
  book: Book;
  onReadExcerpt: (book: Book) => void;
}

export function BookCard({ locale, book, onReadExcerpt }: BookCardProps) {
  const dict = getDictionary(locale);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const titleEn = book.titleEn;
  const titleAm = book.titleAm;
  const primaryTitle = locale === "am" ? titleAm : titleEn;
  const secondaryTitle = locale === "am" ? titleEn : titleAm;
  const synopsis = locale === "am" ? book.synopsisAm : book.synopsisEn;
  const author = locale === "am" ? book.authorAm : book.authorEn;

  function handleAddPrint() {
    addItem({
      bookId: book.id,
      titleEn,
      titleAm,
      format: "Print",
      priceUsd: book.priceUsdPrint,
      coverImageUrl: book.coverImageUrl,
    });
    showToast(dict.booksPage.addedToCartTemplate.replace("{title}", primaryTitle), "success");
  }

  function handleAddPdf() {
    addItem({
      bookId: book.id,
      titleEn,
      titleAm,
      format: "PDF",
      priceUsd: book.priceUsdPdf,
      coverImageUrl: book.coverImageUrl,
    });
    showToast(dict.booksPage.addedToCartTemplate.replace("{title}", primaryTitle), "success");
  }

  function priceLine(usd: number) {
    return <span className="font-semibold text-navy-900">${usd.toFixed(2)}</span>;
  }

  return (
    <div className="flex flex-row gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:gap-5 sm:p-5">
      {book.coverImageUrl ? (
        <TiltedCard rotateAmplitude={10} scaleOnHover={1.04} className="w-24 shrink-0 sm:w-48">
          <div className="relative overflow-hidden rounded-xl border border-amber-500/40 shadow-md">
            <BookCoverImage src={book.coverImageUrl} alt={titleEn} className="h-full w-full object-cover" />
          </div>
        </TiltedCard>
      ) : (
        <div className="flex w-24 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-500/40 bg-gradient-to-br from-navy-800 to-navy-950 p-2 text-center shadow-md sm:w-48 sm:p-5">
          <span className="hidden text-xs font-bold uppercase tracking-widest text-amber-400 sm:inline">
            {dict.booksPage.pressCrest}
          </span>
          <BookOpen className="mt-1 h-6 w-6 text-amber-300 sm:mt-3 sm:h-8 sm:w-8" aria-hidden="true" />
          <p className="mt-2 hidden font-display text-base font-bold text-white sm:mt-3 sm:block">{titleAm}</p>
          <p className="mt-1 hidden text-xs text-slate-300 sm:block">{titleEn}</p>
          <p className="mt-2 hidden text-xs font-medium text-amber-200 sm:mt-3 sm:block">{author}</p>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        {book.isMonthlySpecialOffer && (
          <span className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
            <Gift className="h-3.5 w-3.5" aria-hidden="true" />
            {dict.monthlyOffer.badge}
          </span>
        )}
        <h3 className="font-display text-lg font-bold text-navy-900">{primaryTitle}</h3>
        <p className="text-sm text-slate-500">{secondaryTitle}</p>
        <p className="mt-1 text-xs text-slate-500">
          {book.pages} {dict.booksPage.pagesLabel} · {dict.booksPage.isbnLabel} {book.isbn}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {book.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700"
            >
              {topic}
            </span>
          ))}
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{synopsis}</p>

        <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {dict.booksPage.printLabel}
            </p>
            <p className="mt-0.5">{priceLine(book.priceUsdPrint)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {dict.booksPage.pdfLabel}
            </p>
            <p className="mt-0.5">{priceLine(book.priceUsdPdf)}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onReadExcerpt(book)}
            className="min-h-[40px] touch-manipulation self-start rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition-transform active:scale-[0.98] hover:bg-slate-50"
          >
            {dict.booksPage.readExcerpt}
          </button>
          <div className="grid w-full grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddPrint}
              disabled={book.inStock === false}
              className="min-h-[44px] touch-manipulation rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-transform active:scale-[0.98] hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {book.inStock === false ? "Out of Print Stock" : dict.booksPage.addPrint}
            </button>
            <button
              type="button"
              onClick={handleAddPdf}
              className="min-h-[44px] touch-manipulation rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-transform active:scale-[0.98] hover:bg-amber-700"
            >
              {dict.booksPage.addDigitalPdf}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
