"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
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

  const filtered = useMemo(
    () =>
      LOCATIONS.filter(
        (location) =>
          (synodFilter === "all" || location.synod === synodFilter) &&
          (typeFilter === "all" ||
            (typeFilter === "rural" ? RURAL_TYPES.includes(location.type) : !RURAL_TYPES.includes(location.type))) &&
          matchesSearch(location, search)
      ),
    [synodFilter, typeFilter, search]
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
              .replace("{total}", String(LOCATIONS.length))}
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
