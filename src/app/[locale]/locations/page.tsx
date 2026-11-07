import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/data/i18n";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import type { LocalePageProps } from "@/types/ministry";
import { LocationsDirectoryClient } from "@/components/locations/LocationsDirectoryClient";
import { BlurText } from "@/components/react-bits/BlurText";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  const dict = getDictionary(loc);
  return {
    title: dict.locationsPage.pageTitle,
    description: dict.locationsPage.pageSubtitle,
  };
}

/**
 * The definitive, searchable 31-branch synod directory. Replaces the
 * legacy unformatted text dump (`page_id=28324`, with "Bracnh" and
 * "Estern Ethiopia" typos) and the homepage's frozen `0, 0, 2, 0`
 * counters with live, verified `SYNOD_SUMMARY` data.
 */
export default async function LocationsPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-navy-800 px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          <BlurText text={dict.locationsPage.pageTitle} animateBy="words" direction="top" delay={80} as="span" />
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-navy-100 sm:text-base">
          {dict.locationsPage.pageSubtitle}
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <LocationsDirectoryClient locale={locale} />
        </Suspense>
      </div>
    </main>
  );
}
