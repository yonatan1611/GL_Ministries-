import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/data/i18n";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import type { LocalePageProps } from "@/types/ministry";
import { GivingPortalClient } from "@/components/give/GivingPortalClient";
import { BlurText } from "@/components/react-bits/BlurText";
import { listBooks } from "@/lib/db";

// Reads the live book catalog on every render — force dynamic
// rendering instead of letting Next.js statically prerender this page
// at build time. See the homepage's page.tsx for why.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  const dict = getDictionary(loc);
  return {
    title: dict.give.sectionTitle,
    description: dict.give.pageSubtitle,
  };
}

/**
 * USD online giving & stewardship portal. Replaces the legacy one-line
 * Give stub (`page_id=28360`, "Credit Card, Debit Card, Apple Pay,
 * Check — GIVE NOW") with a full giving experience, fund transparency,
 * 501(c)(3)/security assurance, and mail-in details.
 */
export default async function GivePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const books = await listBooks();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-navy-800 px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          <BlurText text={dict.give.sectionTitle} animateBy="words" direction="top" delay={80} as="span" />
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-navy-100 sm:text-base">{dict.give.pageSubtitle}</p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <GivingPortalClient locale={locale} books={books} />
        </Suspense>
      </div>
    </main>
  );
}
