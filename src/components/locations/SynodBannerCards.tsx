import { Church, Globe2 } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SYNOD_SUMMARY } from "@/data/locations";
import { MINISTRY_IMAGES } from "@/data/social-media";
import { cn, type Locale } from "@/lib/utils";
import type { SynodRegion } from "@/types/ministry";
import { MinistryImage } from "@/components/ui/MinistryImage";
import { CountUp } from "@/components/react-bits/CountUp";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";

export type SynodFilter = SynodRegion | "all";

/**
 * Four interactive synod summary cards — the real, verified counts
 * (3 / 5 / 22 / 1 = 31) replacing the legacy homepage's frozen
 * `0, 0, 2, 0` counters and the unformatted legacy locations list.
 */
export function SynodBannerCards({
  locale,
  activeSynod,
  onSelect,
}: {
  locale: Locale;
  activeSynod: SynodFilter;
  onSelect: (synod: SynodFilter) => void;
}) {
  const dict = getDictionary(locale);
  const totalBranches = SYNOD_SUMMARY.reduce((sum, entry) => sum + entry.branchCount, 0);

  return (
    <>
      {/* Mobile: single-row, horizontally swipeable synod chip bar —
          stacking the five full-size cards below would push the
          directory results off-screen on a phone. */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 snap-x sm:hidden">
        <button
          type="button"
          onClick={() => onSelect("all")}
          aria-pressed={activeSynod === "all"}
          className={cn(
            "flex min-h-[40px] shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
            activeSynod === "all"
              ? "border-amber-500 bg-amber-50 text-amber-800"
              : "border-slate-300 bg-white text-slate-600"
          )}
        >
          <Globe2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {dict.locationsPage.allSynodsLabel} ({totalBranches})
        </button>
        {SYNOD_SUMMARY.map((entry) => {
          const isActive = activeSynod === entry.synod;
          return (
            <button
              key={entry.synod}
              type="button"
              onClick={() => onSelect(entry.synod)}
              aria-pressed={isActive}
              className={cn(
                "flex min-h-[40px] shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                isActive ? "border-amber-500 bg-amber-50 text-amber-800" : "border-slate-300 bg-white text-slate-600"
              )}
            >
              {locale === "am" ? entry.labelAm : entry.labelEn} ({entry.branchCount})
            </button>
          );
        })}
      </div>

      {/* Tablet/desktop: the full detail-card grid. */}
      <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-5">
        <SpotlightCard
          spotlightColor="rgba(37, 99, 235, 0.22)"
          className={cn(
            "rounded-2xl border shadow-sm transition-colors",
            activeSynod === "all" ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-300"
          )}
        >
          <button
            type="button"
            onClick={() => onSelect("all")}
            aria-pressed={activeSynod === "all"}
            className="flex w-full flex-col items-start p-5 text-left"
          >
            <Globe2 className="h-6 w-6 text-amber-600" aria-hidden="true" />
            <p className="mt-3 font-display text-2xl font-bold text-navy-900">
              <CountUp to={totalBranches} duration={1.5} />
            </p>
            <p className="text-sm font-semibold text-navy-800">{dict.locationsPage.allSynodsLabel}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{dict.locationsPage.allSynodsNote}</p>
          </button>
        </SpotlightCard>

        {SYNOD_SUMMARY.map((entry) => {
          const isActive = activeSynod === entry.synod;
          return (
            <SpotlightCard
              key={entry.synod}
              spotlightColor="rgba(37, 99, 235, 0.22)"
              className={cn(
                "rounded-2xl border shadow-sm transition-colors",
                isActive ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-300"
              )}
            >
              <button
                type="button"
                onClick={() => onSelect(entry.synod)}
                aria-pressed={isActive}
                className="flex w-full flex-col items-start p-5 text-left"
              >
                {entry.synod === "East Showa" ? (
                  <div className="relative h-6 w-6 overflow-hidden rounded-full">
                    <MinistryImage
                      src={MINISTRY_IMAGES.eastShowaSynodBadge}
                      alt=""
                      fill
                      sizes="1.5rem"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <Church className="h-6 w-6 text-amber-600" aria-hidden="true" />
                )}
                <p className="mt-3 font-display text-2xl font-bold text-navy-900">
                  <CountUp to={entry.branchCount} duration={1.5} />
                </p>
                <p className="text-sm font-semibold text-navy-800">
                  {locale === "am" ? entry.labelAm : entry.labelEn}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {locale === "am" ? entry.noteAm : entry.noteEn}
                </p>
              </button>
            </SpotlightCard>
          );
        })}
      </div>
    </>
  );
}
