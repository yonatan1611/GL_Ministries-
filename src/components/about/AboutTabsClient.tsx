"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { LEADERS } from "@/data/ministry-content";
import { MINISTRY_IMAGES } from "@/data/social-media";
import { cn, type Locale } from "@/lib/utils";
import { OverviewSection } from "@/components/about/OverviewSection";
import { HistorySection } from "@/components/about/HistorySection";
import { LeaderSection } from "@/components/about/LeaderSection";
import { BeliefsSection } from "@/components/about/BeliefsSection";

type TabId = "overview" | "history" | "apostle-daniel" | "pastor-aberham" | "beliefs";

// Both legacy "About Us" (`#overview`) and "Vision" (`#vision`) redirects
// land on the same unified Mission & Vision tab.
const HASH_TO_TAB: Record<string, TabId> = {
  overview: "overview",
  vision: "overview",
  history: "history",
  "apostle-daniel": "apostle-daniel",
  "pastor-aberham": "pastor-aberham",
  beliefs: "beliefs",
};

const TAB_TO_HASH: Record<TabId, string> = {
  overview: "overview",
  history: "history",
  "apostle-daniel": "apostle-daniel",
  "pastor-aberham": "pastor-aberham",
  beliefs: "beliefs",
};

const APOSTLE_DANIEL = LEADERS.find((leader) => leader.id === "leader-daniel-makonnen")!;
const PASTOR_ABERHAM = LEADERS.find((leader) => leader.id === "leader-aberham-bedasso")!;

export function AboutTabsClient({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    function syncFromHash() {
      const hash = window.location.hash.replace("#", "");
      if (hash && HASH_TO_TAB[hash]) {
        setActiveTab(HASH_TO_TAB[hash]);
      }
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  function selectTab(tab: TabId) {
    setActiveTab(tab);
    window.history.replaceState(null, "", `#${TAB_TO_HASH[tab]}`);
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: dict.about.navOverview },
    { id: "history", label: dict.about.navHistory },
    { id: "apostle-daniel", label: dict.about.navApostle },
    { id: "pastor-aberham", label: dict.about.navPastor },
    { id: "beliefs", label: dict.about.navBeliefs },
  ];

  return (
    <div>
      <nav aria-label={dict.about.pageTitle} className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => selectTab(tab.id)}
            aria-current={activeTab === tab.id ? "true" : undefined}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-navy-800 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {activeTab === "overview" && <OverviewSection locale={locale} />}
        {activeTab === "history" && <HistorySection locale={locale} />}
        {activeTab === "apostle-daniel" && (
          <LeaderSection
            locale={locale}
            leader={APOSTLE_DANIEL}
            showSermonsLink
            showBooksLink
            secondaryImageUrl={MINISTRY_IMAGES.apostleDanielPreachingHd}
            secondaryImageAlt={dict.about.navApostle}
          />
        )}
        {activeTab === "pastor-aberham" && (
          <LeaderSection
            locale={locale}
            leader={PASTOR_ABERHAM}
            showSermonsLink
            extraInfo={[
              {
                icon: MapPin,
                text: "US Administrative Office — 85 South Bragg Street, Suite 200, Alexandria, VA 22312",
              },
            ]}
            scheduleSection={
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {dict.about.naServiceScheduleTitle}
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                  <p>{dict.schedule.dcSunday}</p>
                  <p>{dict.schedule.dcWednesday}</p>
                </div>
              </div>
            }
          />
        )}
        {activeTab === "beliefs" && <BeliefsSection locale={locale} />}
      </div>
    </div>
  );
}
