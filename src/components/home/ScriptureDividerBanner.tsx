import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";

/**
 * Pre-footer Scripture divider, styled after bennyhinn.org's large
 * centered italic-serif quote banner on a deep charcoal-and-blue
 * background — Acts 5:42, bilingual (EN/AM).
 */
export function ScriptureDividerBanner({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="border-y-2 border-amber-600 bg-navy-950 px-4 py-14 text-center sm:px-6 lg:px-8">
      <blockquote className="mx-auto max-w-3xl font-display text-xl italic leading-relaxed text-white sm:text-2xl">
        {dict.scriptureDivider.quoteEn}
      </blockquote>
      <p className="mt-3 font-nav text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
        {dict.scriptureDivider.referenceEn}
      </p>
      <blockquote className="mx-auto mt-6 max-w-3xl font-display text-lg italic leading-relaxed text-navy-100 sm:text-xl">
        {dict.scriptureDivider.quoteAm}
      </blockquote>
      <p className="mt-3 font-nav text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
        {dict.scriptureDivider.referenceAm}
      </p>
    </section>
  );
}
