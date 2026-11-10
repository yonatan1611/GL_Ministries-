import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { listBooks } from "@/lib/db";
import type { Locale } from "@/lib/utils";
import { BookCoverImage } from "@/components/books/BookCoverImage";

/**
 * "Discover Resources / Products" banner, styled after bennyhinn.org's
 * products showcase: a short mission-framed pitch alongside previews of
 * the live book catalog (prices editable from the Admin Portal) and an
 * "Explore Now!" link into the Book Store.
 */
export async function DiscoverProductsBanner({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const books = await listBooks();

  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
          {dict.discoverProducts.sectionTitle}
        </h2>
        <div className="section-divider" aria-hidden="true">
          <span className="section-divider-diamond">◆</span>
        </div>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
          {dict.discoverProducts.body}
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/${locale}/books`}
              className="group flex flex-col items-center gap-3 border border-[#E6DFD3] bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative h-32 w-24 overflow-hidden rounded border border-amber-500/30 shadow">
                {book.coverImageUrl ? (
                  <BookCoverImage src={book.coverImageUrl} alt={book.titleEn} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950">
                    <BookOpen className="h-6 w-6 text-amber-300" aria-hidden="true" />
                  </div>
                )}
              </div>
              <p className="line-clamp-2 text-xs font-semibold text-navy-900">
                {locale === "am" ? book.titleAm : book.titleEn}
              </p>
              <p className="font-nav text-xs font-bold text-amber-700">
                ${book.priceUsdPdf}–${book.priceUsdPrint} USD
              </p>
            </Link>
          ))}
        </div>

        <Link
          href={`/${locale}/books`}
          className="mt-10 inline-flex items-center justify-center rounded bg-brand-logo-gradient px-8 py-3.5 font-nav text-sm font-extrabold uppercase tracking-wider text-white shadow-lg hover:brightness-110"
        >
          {dict.discoverProducts.exploreCta}
        </Link>
      </div>
    </section>
  );
}
