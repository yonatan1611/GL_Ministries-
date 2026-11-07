import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { cn, type Locale } from "@/lib/utils";
import type { Sermon, SermonTopic } from "@/types/ministry";

export interface QuickFilterChip {
  id: string;
  labelEn: string;
  labelAm: string;
  /** Substring tested against `titleEn`/`yearLabel`, matched to the
   *  real teaching series in the 22-video YouTube catalog. */
  matchText: string;
}

/**
 * Real teaching-series quick filters, replacing the legacy page's 21
 * unstyled Amharic scripture checkboxes. These match actual series from
 * the channel's real catalog (Pastoral Time, the Nehemiah revival
 * series, the Watchman series, dated classic archive teachings, and
 * live sanctuary worship) rather than invented scripture references.
 */
export const QUICK_FILTER_CHIPS: QuickFilterChip[] = [
  { id: "pastoral-time", labelEn: "Pastoral Time Series", labelAm: "የእረኝነት ጊዜ ተከታታይ", matchText: "Pastoral Time" },
  { id: "nehemiah", labelEn: "Nehemiah Revival Series", labelAm: "የነህምያ ተሃድሶ ተከታታይ", matchText: "Nehemiah" },
  { id: "watchman", labelEn: "Watchman Series", labelAm: "የጉበኛ አገልግሎት ተከታታይ", matchText: "Watchman" },
  { id: "classic-archive", labelEn: "Classic Archive", labelAm: "ክላሲክ ማህደር", matchText: "Archive" },
  { id: "live-worship", labelEn: "Live Worship", labelAm: "ቀጥታ አምልኮ", matchText: "Worship" },
];

export function matchesQuickFilter(sermon: Sermon, chipId: string | null): boolean {
  if (!chipId) return true;
  const chip = QUICK_FILTER_CHIPS.find((candidate) => candidate.id === chipId);
  if (!chip) return true;
  return sermon.titleEn.includes(chip.matchText) || sermon.yearLabel.includes(chip.matchText);
}

const TOPIC_OPTIONS: SermonTopic[] = [
  "Christian Growth",
  "Holy Spirit",
  "Hearing God's Voice",
  "Revival & Repentance",
  "Prophetic Archive",
  "Discipleship",
  "New Upload",
];

interface Speaker {
  en: string;
  am: string;
}

export interface SermonFilters {
  search: string;
  topic: SermonTopic | "all";
  speaker: string | "all";
  quickFilterId: string | null;
}

export const EMPTY_SERMON_FILTERS: SermonFilters = {
  search: "",
  topic: "all",
  speaker: "all",
  quickFilterId: null,
};

export function isFiltersActive(filters: SermonFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.topic !== "all" ||
    filters.speaker !== "all" ||
    filters.quickFilterId !== null
  );
}

interface SermonFilterBarProps {
  locale: Locale;
  sermons: Sermon[];
  filters: SermonFilters;
  onChange: (filters: SermonFilters) => void;
  filteredCount: number;
  totalCount: number;
}

/**
 * Instant faceted search/filter bar — replaces the legacy page's leaked
 * WordPress plugin controls ("Generic selectors", "Post Type Selectors")
 * and 21 unorganized scripture checkboxes. The speaker list is derived
 * from the live `sermons` list (not a static import) so a
 * newly-synced-from-YouTube speaker shows up in the filter too.
 */
export function SermonFilterBar({ locale, sermons, filters, onChange, filteredCount, totalCount }: SermonFilterBarProps) {
  const dict = getDictionary(locale);
  const active = isFiltersActive(filters);
  const speakers = useMemo<Speaker[]>(
    () =>
      Array.from(
        new Map(sermons.map((sermon) => [sermon.speakerEn, { en: sermon.speakerEn, am: sermon.speakerAm }])).values()
      ),
    [sermons]
  );

  function update(partial: Partial<SermonFilters>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder={dict.sermonsPage.searchPlaceholder}
            aria-label={dict.sermonsPage.searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:w-48">
          {dict.sermonsPage.topicFilterLabel}
          <select
            value={filters.topic}
            onChange={(e) => update({ topic: e.target.value as SermonTopic | "all" })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">{dict.sermonsPage.allTopicsLabel}</option>
            {TOPIC_OPTIONS.map((topic) => (
              <option key={topic} value={topic}>
                {dict.sermonsPage.topics[topic]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:w-56">
          {dict.sermonsPage.speakerFilterLabel}
          <select
            value={filters.speaker}
            onChange={(e) => update({ speaker: e.target.value })}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none"
          >
            <option value="all">{dict.sermonsPage.allSpeakersLabel}</option>
            {speakers.map((speaker) => (
              <option key={speaker.en} value={speaker.en}>
                {locale === "am" ? speaker.am : speaker.en}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {dict.sermonsPage.scriptureFiltersLabel}
        </span>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 snap-x sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {QUICK_FILTER_CHIPS.map((chip) => {
            const isActive = filters.quickFilterId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => update({ quickFilterId: isActive ? null : chip.id })}
                aria-pressed={isActive}
                className={cn(
                  "min-h-[36px] shrink-0 touch-manipulation snap-start whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "border-amber-600 bg-amber-100 text-amber-800"
                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                )}
              >
                {locale === "am" ? chip.labelAm : chip.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-xs text-slate-500">
          {dict.sermonsPage.showingCountTemplate
            .replace("{count}", String(filteredCount))
            .replace("{total}", String(totalCount))}
        </p>
        {active && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_SERMON_FILTERS)}
            className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            {dict.sermonsPage.resetFilters}
          </button>
        )}
      </div>
    </div>
  );
}
