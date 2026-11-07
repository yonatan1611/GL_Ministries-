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
import { AnimatedContent } from "@/components/react-bits/AnimatedContent";

// MonthlyResourceOffer/DiscoverProductsBanner read the live book catalog
// (src/lib/db.ts) on every render — force dynamic rendering so Next.js
// never tries to statically prerender this page at build time (which
// both bakes in stale data and, on Vercel's build filesystem, raced
// writing data/glm-database.json across parallel prerender workers).
export const dynamic = "force-dynamic";

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
      <AnimatedContent distance={40} duration={0.7}>
        <SalvationBanner locale={locale} />
      </AnimatedContent>
      <AnimatedContent distance={40} duration={0.7}>
        <WashingtonDcSpotlightSection locale={locale} />
      </AnimatedContent>
      <AnimatedContent distance={40} duration={0.7}>
        <RecentHighlightsAndTeachings locale={locale} />
      </AnimatedContent>
      <AnimatedContent distance={40} duration={0.7}>
        <MonthlyResourceOffer locale={locale} />
      </AnimatedContent>
      <AnimatedContent distance={40} duration={0.7}>
        <HistoricVisitationSection locale={locale} />
      </AnimatedContent>
      <AnimatedContent distance={40} duration={0.7}>
        <GlobalPrayerArmyAndScripture locale={locale} />
      </AnimatedContent>
      <AnimatedContent distance={40} duration={0.7}>
        <StayConnectedSignupSection locale={locale} />
      </AnimatedContent>
      <AnimatedContent distance={40} duration={0.7}>
        <DiscoverProductsBanner locale={locale} />
      </AnimatedContent>
      <AnimatedContent distance={40} duration={0.7}>
        <UpcomingEventsSection locale={locale} />
      </AnimatedContent>
      <AnimatedContent distance={40} duration={0.7}>
        <ScriptureDividerBanner locale={locale} />
      </AnimatedContent>
    </main>
  );
}
