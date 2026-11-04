import { getDictionary } from "@/data/i18n";
import { STATEMENT_OF_FAITH } from "@/data/ministry-content";
import type { Locale } from "@/lib/utils";

/** 8-point evangelical Statement of Faith with bilingual Scripture citations. */
export function BeliefsSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div>
      <h3 className="font-display text-lg font-bold text-navy-900">{dict.about.beliefsTitle}</h3>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {STATEMENT_OF_FAITH.map((point) => (
          <div key={point.numberLabel} className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-800 font-display text-sm font-bold text-amber-400">
                {point.numberLabel}
              </span>
              <p className="font-display text-base font-bold text-navy-900">
                {locale === "am" ? point.titleAm : point.titleEn}
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {locale === "am" ? point.textAm : point.textEn}
            </p>
            <p className="mt-2 text-xs font-medium italic text-amber-700">
              {locale === "am" ? point.scriptureAm : point.scriptureEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
