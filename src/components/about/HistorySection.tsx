import { getDictionary } from "@/data/i18n";
import { HISTORY_TIMELINE } from "@/data/ministry-content";
import { MINISTRY_IMAGES } from "@/data/social-media";
import type { Locale } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";

/**
 * Corrected, authoritative historical timeline — replaces the legacy
 * page's corrupted text ("in the Ethiopian Evangelical
 * churchePastor Daniel Makonnens today", "ninteen seventies",
 * "comunisim") with the 1970s Awakening → founding → synod expansion →
 * North American & digital broadcast narrative.
 */
export function HistorySection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div>
      <h3 className="font-display text-lg font-bold text-navy-900">{dict.about.historyTitle}</h3>
      <ol className="mt-6 flex flex-col gap-6 border-l border-slate-200 pl-6">
        {HISTORY_TIMELINE.map((milestone) => (
          <li key={milestone.era} className="relative">
            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-amber-600" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {milestone.era}
            </p>
            <p className="mt-1 font-display text-base font-bold text-navy-900">
              {locale === "am" ? milestone.titleAm : milestone.titleEn}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {locale === "am" ? milestone.descriptionAm : milestone.descriptionEn}
            </p>
            {milestone.era === "1970s" && (
              <div className="relative mt-3 aspect-[300/209] w-full max-w-xs overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                <MinistryImage
                  src={MINISTRY_IMAGES.historyRevival1970s}
                  alt=""
                  fill
                  sizes="20rem"
                  className="object-cover"
                />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
