"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SERMONS } from "@/data/ministry-content";
import type { Locale } from "@/lib/utils";
import type { Sermon, SermonTopic } from "@/types/ministry";
import { MediaTheater } from "@/components/sermons/MediaTheater";
import {
  EMPTY_SERMON_FILTERS,
  matchesQuickFilter,
  SermonFilterBar,
  type SermonFilters,
} from "@/components/sermons/SermonFilterBar";
import { SermonCardGrid } from "@/components/sermons/SermonCardGrid";
import { MinistryContactModal } from "@/components/home/MinistryContactModal";
import type { ContactInquiryType } from "@/lib/validations";

const DEFAULT_SERMON_ID = "s1";
const VALID_TOPICS: readonly string[] = [
  "Christian Growth",
  "Holy Spirit",
  "Hearing God's Voice",
  "Revival & Repentance",
  "Prophetic Archive",
  "Discipleship",
];

function matchesSearch(sermon: Sermon, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = [
    sermon.titleAm,
    sermon.titleEn,
    sermon.scriptureAm,
    sermon.scriptureEn,
    sermon.speakerEn,
    sermon.speakerAm,
    sermon.summaryEn,
    sermon.summaryAm,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

export function SermonsPageClient({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? `/${locale}/sermons`;

  const [activeSermonId, setActiveSermonId] = useState<string>(() => {
    const requested = searchParams.get("sermon");
    return requested && SERMONS.some((sermon) => sermon.id === requested) ? requested : DEFAULT_SERMON_ID;
  });
  const [theaterMode, setTheaterMode] = useState<"ondemand" | "live">(() =>
    typeof window !== "undefined" && window.location.hash === "#live" ? "live" : "ondemand"
  );
  const [filters, setFilters] = useState<SermonFilters>(() => {
    const requestedTopic = searchParams.get("topic");
    const requestedQuery = searchParams.get("q") ?? "";
    const topic =
      requestedTopic && VALID_TOPICS.includes(requestedTopic) ? (requestedTopic as SermonTopic) : "all";
    return { ...EMPTY_SERMON_FILTERS, topic, search: requestedQuery };
  });
  const [activeInquiry, setActiveInquiry] = useState<ContactInquiryType | null>(null);

  const activeSermon = SERMONS.find((sermon) => sermon.id === activeSermonId) ?? SERMONS[0];

  const filteredSermons = useMemo(
    () =>
      SERMONS.filter(
        (sermon) =>
          matchesSearch(sermon, filters.search) &&
          (filters.topic === "all" || sermon.topic === filters.topic) &&
          (filters.speaker === "all" || sermon.speakerEn === filters.speaker) &&
          matchesQuickFilter(sermon, filters.quickFilterId)
      ),
    [filters]
  );

  function syncUrl(nextSermonId: string, nextMode: "ondemand" | "live") {
    const params = new URLSearchParams(searchParams.toString());
    if (nextMode === "live") {
      params.delete("sermon");
    } else {
      params.set("sermon", nextSermonId);
    }
    const query = params.toString();
    const hash = nextMode === "live" ? "#live" : "";
    router.replace(`${pathname}${query ? `?${query}` : ""}${hash}`, { scroll: false });
  }

  function handleSelectSermon(id: string) {
    setActiveSermonId(id);
    setTheaterMode("ondemand");
    syncUrl(id, "ondemand");
    document.getElementById("live")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleModeChange(nextMode: "ondemand" | "live") {
    setTheaterMode(nextMode);
    syncUrl(activeSermonId, nextMode);
  }

  if (!activeSermon) return null;

  return (
    <div className="flex flex-col gap-8">
      <MediaTheater
        locale={locale}
        sermon={activeSermon}
        mode={theaterMode}
        onModeChange={handleModeChange}
        onRequestPrayerComment={() => setActiveInquiry("Prayer Request")}
      />

      <SermonFilterBar
        locale={locale}
        filters={filters}
        onChange={setFilters}
        filteredCount={filteredSermons.length}
        totalCount={SERMONS.length}
      />

      <SermonCardGrid
        locale={locale}
        sermons={filteredSermons}
        activeSermonId={activeSermon.id}
        onSelectSermon={handleSelectSermon}
      />

      <MinistryContactModal
        locale={locale}
        inquiryType={activeInquiry}
        onClose={() => setActiveInquiry(null)}
      />
    </div>
  );
}
