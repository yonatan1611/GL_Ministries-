import { notFound } from "next/navigation";
import { isSupportedLocale } from "@/lib/utils";
import { listDevotionals } from "@/lib/db";
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

  const devotionals = await listDevotionals();

  return (
    <main className="min-h-screen bg-slate-50">
      <HeroSection locale={locale} />
      <AnimatedContent>
        <SalvationBanner locale={locale} />
      </AnimatedContent>
      <AnimatedContent>
        <WashingtonDcSpotlightSection locale={locale} />
      </AnimatedContent>
      <AnimatedContent>
        <RecentHighlightsAndTeachings locale={locale} />
      </AnimatedContent>
      <AnimatedContent>
        <MonthlyResourceOffer locale={locale} />
      </AnimatedContent>
      <AnimatedContent>
        <HistoricVisitationSection locale={locale} />
      </AnimatedContent>
      <AnimatedContent>
        <GlobalPrayerArmyAndScripture locale={locale} initialDevotionals={devotionals} />
      </AnimatedContent>
      <AnimatedContent>
        <StayConnectedSignupSection locale={locale} />
      </AnimatedContent>
      <AnimatedContent>
        <DiscoverProductsBanner locale={locale} />
      </AnimatedContent>
      <AnimatedContent>
        <UpcomingEventsSection locale={locale} />
      </AnimatedContent>
      <AnimatedContent>
        <ScriptureDividerBanner locale={locale} />
      </AnimatedContent>
    </main>
  );
}
