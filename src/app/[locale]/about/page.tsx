import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/data/i18n";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import type { LocalePageProps } from "@/types/ministry";
import { AboutTabsClient } from "@/components/about/AboutTabsClient";
import { FacebookCommunitySection } from "@/components/home/FacebookCommunitySection";

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = isSupportedLocale(locale) ? locale : "en";
  return { title: getDictionary(loc).about.pageTitle };
}

/**
 * Consolidated About, Vision, History, Statement of Faith & Leadership
 * hub. Every legacy `page_id` redirect in `middleware.ts` for About Us
 * (28263), Vision (28322), History (28318), the Apostle's bio (28320),
 * and Pastor Bedasso's empty stub (28597) lands here on the matching
 * `#hash` tab via `AboutTabsClient`.
 */
export default async function AboutPage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-navy-800 px-4 py-14 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          {dict.about.pageTitle}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-navy-100 sm:text-base">
          {dict.about.pageSubtitle}
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <AboutTabsClient locale={locale} />
      </div>

      <FacebookCommunitySection locale={locale} />
    </main>
  );
}
