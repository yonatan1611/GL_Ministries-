import { Church, Globe2 } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SYNOD_SUMMARY } from "@/data/locations";
import { MINISTRY_IMAGES } from "@/data/social-media";
import { cn, type Locale } from "@/lib/utils";
import type { SynodRegion } from "@/types/ministry";
import { MinistryImage } from "@/components/ui/MinistryImage";

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <button
        type="button"
        onClick={() => onSelect("all")}
        aria-pressed={activeSynod === "all"}
        className={cn(
          "flex flex-col items-start rounded-2xl border p-5 text-left shadow-sm transition-colors",
          activeSynod === "all" ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-300"
        )}
      >
        <Globe2 className="h-6 w-6 text-amber-600" aria-hidden="true" />
        <p className="mt-3 font-display text-2xl font-bold text-navy-900">{totalBranches}</p>
        <p className="text-sm font-semibold text-navy-800">{dict.locationsPage.allSynodsLabel}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{dict.locationsPage.allSynodsNote}</p>
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
              "flex flex-col items-start rounded-2xl border p-5 text-left shadow-sm transition-colors",
              isActive ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-300"
            )}
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
            <p className="mt-3 font-display text-2xl font-bold text-navy-900">{entry.branchCount}</p>
            <p className="text-sm font-semibold text-navy-800">
              {locale === "am" ? entry.labelAm : entry.labelEn}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              {locale === "am" ? entry.noteAm : entry.noteEn}
            </p>
          </button>
        );
      })}
    </div>
  );
}
