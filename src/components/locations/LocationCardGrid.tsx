import { Mail, MapPin, Phone } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SYNOD_SUMMARY } from "@/data/locations";
import type { Locale } from "@/lib/utils";
import type { BranchLocation, BranchType } from "@/types/ministry";

const TYPE_LABELS: Record<Locale, Record<BranchType, string>> = {
  en: {
    "Headquarters Church": "Headquarters Church",
    "Synod Center": "Synod Center",
    "Branch Church": "Branch Church",
    "Outreach Station": "Outreach Station",
    "Outreach Stations": "Outreach Stations",
    "North America Branch": "North America Branch",
  },
  am: {
    "Headquarters Church": "ዋና ቢሮ ቤተክርስቲያን",
    "Synod Center": "ሲኖዶስ ማዕከል",
    "Branch Church": "አጥቢያ ቤተክርስቲያን",
    "Outreach Station": "ስርጭት ጣቢያ",
    "Outreach Stations": "ስርጭት ጣቢያዎች",
    "North America Branch": "የሰሜን አሜሪካ አጥቢያ",
  },
};

interface LocationCardGridProps {
  locale: Locale;
  locations: BranchLocation[];
  onOpenDetail: (location: BranchLocation) => void;
}

/**
 * Responsive branch/outreach-station grid. Each card shows both English
 * and Amharic names side by side, replacing the legacy page's
 * unformatted, unsearchable 31-line text dump.
 */
export function LocationCardGrid({ locale, locations, onOpenDetail }: LocationCardGridProps) {
  const dict = getDictionary(locale);

  if (locations.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        {dict.locationsPage.showingCountTemplate.replace("{count}", "0").replace("{total}", "0")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {locations.map((location) => {
        const synodEntry = SYNOD_SUMMARY.find((entry) => entry.synod === location.synod);
        return (
          <div
            key={location.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-navy-800 px-3 py-1 text-xs font-semibold text-amber-300">
                {synodEntry ? (locale === "am" ? synodEntry.labelAm : synodEntry.labelEn) : location.synod}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {TYPE_LABELS[locale][location.type]}
              </span>
            </div>

            <h3 className="mt-3 font-display text-base font-bold text-navy-900">{location.nameEn}</h3>
            <p className="text-sm text-slate-500">{location.nameAm}</p>

            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-700">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {location.city}
            </p>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
              {locale === "am" ? location.detailsAm : location.detailsEn}
            </p>

            <div className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
              <a href={`tel:${location.phone}`} className="flex items-center gap-1.5 hover:text-amber-700">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {location.phone}
              </a>
              <a href={`mailto:${location.email}`} className="flex items-center gap-1.5 hover:text-amber-700">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                {location.email}
              </a>
            </div>

            <button
              type="button"
              onClick={() => onOpenDetail(location)}
              className="mt-4 w-full rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              {dict.locationsPage.serviceTimesMapContact}
            </button>
          </div>
        );
      })}
    </div>
  );
}
