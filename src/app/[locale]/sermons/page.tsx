import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/data/i18n";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import type { LocalePageProps } from "@/types/ministry";
import { SermonsPageClient } from "@/components/sermons/SermonsPageClient";
import { BlurText } from "@/components/react-bits/BlurText";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  const dict = getDictionary(loc);
  return {
    title: dict.sermonsPage.pageTitle,
    description: dict.sermonsPage.pageSubtitle,
  };
}

/**
 * Sermons & Live Stream Portal. Legacy `page_id=28288` (Sermon archive,
 * with leaked WordPress plugin controls and broken embeds) and
 * `page_id=28418` (empty GLM Live Stream page) both 301-redirect here
 * (`middleware.ts`), the latter landing directly on the `#live` theater.
 */
export default async function SermonsPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-navy-800 px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          <BlurText text={dict.sermonsPage.pageTitle} animateBy="words" direction="top" delay={80} as="span" />
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-navy-100 sm:text-base">
          {dict.sermonsPage.pageSubtitle}
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <SermonsPageClient locale={locale} />
        </Suspense>
      </div>
    </main>
  );
}
