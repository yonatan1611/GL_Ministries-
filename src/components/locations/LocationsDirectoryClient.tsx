"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Search, X } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { LOCATIONS } from "@/data/locations";
import { cn, type Locale } from "@/lib/utils";
import type { BranchLocation, BranchType, SynodRegion } from "@/types/ministry";
import { CONTACT_TARGET_OFFICES, type ContactInquiryType } from "@/lib/validations";
import { SynodBannerCards, type SynodFilter } from "@/components/locations/SynodBannerCards";
import { LocationCardGrid } from "@/components/locations/LocationCardGrid";
import { BranchDetailModal } from "@/components/locations/BranchDetailModal";
import { MinistryContactModal } from "@/components/home/MinistryContactModal";

const RURAL_TYPES: readonly BranchType[] = ["Outreach Station", "Outreach Stations"];
const VALID_SYNODS: readonly string[] = ["Addis Ababa", "East Showa", "Eastern Ethiopia", "USA"];

type TypeFilter = "all" | "urban" | "rural";

function matchesSearch(location: BranchLocation, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = [location.nameEn, location.nameAm, location.city, location.address]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function LocationsDirectoryClient({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const searchParams = useSearchParams();

  const [synodFilter, setSynodFilter] = useState<SynodFilter>(() => {
    const requested = searchParams.get("synod");
    return requested && VALID_SYNODS.includes(requested) ? (requested as SynodRegion) : "all";
  });
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [activeLocation, setActiveLocation] = useState<BranchLocation | null>(null);
  const [activeInquiry, setActiveInquiry] = useState<ContactInquiryType | null>(null);
  const [visitOffice, setVisitOffice] = useState<(typeof CONTACT_TARGET_OFFICES)[number] | undefined>();
  // Seeded with the curated static list so there's no empty-state flash
  // before the live fetch lands — matches it exactly until an admin
  // edits/adds a branch through the Admin Portal.
  const [locations, setLocations] = useState<BranchLocation[]>(LOCATIONS);

  useEffect(() => {
    fetch("/api/locations")
      .then((response) => response.json())
      .then((result) => {
        if (result?.success && Array.isArray(result.data?.locations)) {
          setLocations(result.data.locations as BranchLocation[]);
        }
      })
      .catch(() => {
        // Live branch directory is a progressive enhancement — fail silently.
      });
  }, []);

  const filtered = useMemo(
    () =>
      locations.filter(
        (location) =>
          (synodFilter === "all" || location.synod === synodFilter) &&
          (typeFilter === "all" ||
            (typeFilter === "rural" ? RURAL_TYPES.includes(location.type) : !RURAL_TYPES.includes(location.type))) &&
          matchesSearch(location, search)
      ),
    [locations, synodFilter, typeFilter, search]
  );

  const isFilterActive = synodFilter !== "all" || typeFilter !== "all" || search.trim() !== "";

  function resetFilters() {
    setSynodFilter("all");
    setTypeFilter("all");
    setSearch("");
  }

  function handlePlanVisit(location: BranchLocation) {
    setActiveLocation(null);
    setVisitOffice(location.synod === "USA" ? "dc@glministries.org" : "addis@glministries.org");
    setActiveInquiry("General Inquiry");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-2xl border-2 border-blue-500/30 bg-gradient-to-r from-[#0F2342] to-[#1B365D] p-6 text-white shadow-md sm:p-8">
        <span className="inline-block rounded-full border border-blue-400/40 bg-blue-600/20 px-3 py-1 font-nav text-[11px] font-bold uppercase tracking-[0.15em] text-blue-200">
          {dict.locationsPage.flagshipBadge}
        </span>
        <h2 className="mt-3 font-display text-xl font-bold sm:text-2xl">{dict.locationsPage.flagshipHeading}</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSynodFilter("USA")}
            className="flex items-start gap-3 rounded-xl border border-blue-400/30 bg-white/5 p-4 text-left hover:bg-white/10"
          >
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">{dict.locationsPage.flagshipDcLabel}</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-100">{dict.locationsPage.flagshipDcBody}</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSynodFilter("Addis Ababa")}
            className="flex items-start gap-3 rounded-xl border border-blue-400/30 bg-white/5 p-4 text-left hover:bg-white/10"
          >
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-white">{dict.locationsPage.flagshipAwareLabel}</p>
              <p className="mt-1 text-xs leading-relaxed text-blue-100">{dict.locationsPage.flagshipAwareBody}</p>
            </div>
          </button>
        </div>
      </div>

      <SynodBannerCards locale={locale} activeSynod={synodFilter} onSelect={setSynodFilter} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={dict.locationsPage.searchPlaceholder}
              aria-label={dict.locationsPage.searchPlaceholder}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          <label className="flex flex-col gap-1 text-xs font-medium text-slate-600 sm:w-64">
            {dict.locationsPage.typeFilterLabel}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">{dict.locationsPage.allTypesLabel}</option>
              <option value="urban">{dict.locationsPage.urbanLabel}</option>
              <option value="rural">{dict.locationsPage.ruralLabel}</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            {dict.locationsPage.showingCountTemplate
              .replace("{count}", String(filtered.length))
              .replace("{total}", String(locations.length))}
          </p>
          {isFilterActive && (
            <button
              type="button"
              onClick={resetFilters}
              className={cn("flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline")}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              {dict.locationsPage.resetFilters}
            </button>
          )}
        </div>
      </div>

      <LocationCardGrid locale={locale} locations={filtered} onOpenDetail={setActiveLocation} />

      <BranchDetailModal
        locale={locale}
        location={activeLocation}
        onClose={() => setActiveLocation(null)}
        onPlanVisit={handlePlanVisit}
      />

      <MinistryContactModal
        locale={locale}
        inquiryType={activeInquiry}
        defaultOffice={visitOffice}
        onClose={() => setActiveInquiry(null)}
      />
    </div>
  );
}
