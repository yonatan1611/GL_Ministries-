import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/data/i18n";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import type { LocalePageProps } from "@/types/ministry";
import { BookStoreClient } from "@/components/books/BookStoreClient";
import { BlurText } from "@/components/react-bits/BlurText";
import { listBooks } from "@/lib/db";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  const dict = getDictionary(loc);
  return {
    title: dict.booksPage.pageTitle,
    description: dict.booksPage.pageSubtitle,
  };
}

/**
 * GLM Press book store. Replaces the legacy page's four bare, unlabeled
 * "Buy" buttons (`page_id=28327`) with full bilingual metadata, pricing,
 * cart integration, and a bulk-order callout for churches and Bible
 * schools.
 */
export default async function BooksPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const books = await listBooks();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-navy-800 px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          <BlurText text={dict.booksPage.pageTitle} animateBy="words" direction="top" delay={80} as="span" />
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-navy-100 sm:text-base">
          {dict.booksPage.pageSubtitle}
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <BookStoreClient locale={locale} books={books} />
      </div>
    </main>
  );
}
