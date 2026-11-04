import { notFound } from "next/navigation";
import { isSupportedLocale } from "@/lib/utils";
import { HeroSection } from "@/components/home/HeroSection";
import { SalvationBanner } from "@/components/home/SalvationBanner";
import { WashingtonDcSpotlightSection } from "@/components/home/WashingtonDcSpotlightSection";
import { RecentHighlightsAndTeachings } from "@/components/home/RecentHighlightsAndTeachings";
import { MonthlyResourceOffer } from "@/components/home/MonthlyResourceOffer";
import { HistoricVisitationSection } from "@/components/home/HistoricVisitationSection";
import { GlobalPrayerArmyAndScripture } from "@/components/home/GlobalPrayerArmyAndScripture";
import { StayConnectedSignupSection } from "@/components/home/StayConnectedSignupSection";
import { DiscoverProductsBanner } from "@/components/home/DiscoverProductsBanner";
import { UpcomingEventsSection } from "@/components/home/UpcomingEventsSection";
import { ScriptureDividerBanner } from "@/components/home/ScriptureDividerBanner";

/**
 * Homepage, sequenced to replicate bennyhinn.org's exact top-to-bottom
 * conversion flow: a cinematic media hero, the Salvation callout, the
 * Washington, D.C. flagship spotlight, a Recent Updates / Latest
 * Teachings split, the Monthly Resource Offer, the Historic Divine
 * Visitation storytelling banner, the Global Prayer Army & Today's Key
 * Scripture panel, the Stay Connected signup, the Discover Products
 * banner, Upcoming Events & ministry action cards, and the Acts 5:42
 * Scripture divider just above the footer.
 */
export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <HeroSection locale={locale} />
      <SalvationBanner locale={locale} />
      <WashingtonDcSpotlightSection locale={locale} />
      <RecentHighlightsAndTeachings locale={locale} />
      <MonthlyResourceOffer locale={locale} />
      <HistoricVisitationSection locale={locale} />
      <GlobalPrayerArmyAndScripture locale={locale} />
      <StayConnectedSignupSection locale={locale} />
      <DiscoverProductsBanner locale={locale} />
      <UpcomingEventsSection locale={locale} />
      <ScriptureDividerBanner locale={locale} />
    </main>
  );
}
