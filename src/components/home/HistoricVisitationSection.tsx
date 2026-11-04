import Link from "next/link";
import { getDictionary } from "@/data/i18n";
import { IMPACT_STATS, MINISTRY_IMAGES } from "@/data/social-media";
import type { Locale } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";

/**
 * "The Historic Divine Visitation of the Holy Spirit in Ethiopia" — a
 * full-bleed dark crusade-photo banner with oversized royal-blue
 * statistics, styled after bennyhinn.org's dramatic African Crusade
 * storytelling section ("Will you say YES to Africa?").
 */
export function HistoricVisitationSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const featuredStats = IMPACT_STATS.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-navy-950 px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <MinistryImage
          src={MINISTRY_IMAGES.historyRevival1970s}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-bh-stage-radial" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <h2 className="font-display text-2xl font-bold italic text-white sm:text-3xl lg:text-4xl">
          {dict.historicVisitation.headline}
        </h2>
        <div className="section-divider" aria-hidden="true">
          <span className="section-divider-diamond">◆</span>
        </div>
      </div>

      <div className="relative mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
        {featuredStats.map((stat) => (
          <div key={stat.id} className="text-center">
            <p className="font-display text-4xl font-extrabold text-blue-400 sm:text-5xl">{stat.value}</p>
            <p className="mt-2 font-nav text-xs font-bold uppercase tracking-[0.1em] text-white sm:text-sm">
              {locale === "am" ? stat.labelAm : stat.labelEn}
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-navy-300">
              {locale === "am" ? stat.detailAm : stat.detailEn}
            </p>
          </div>
        ))}
      </div>

      <div className="relative mt-12 flex flex-wrap items-center justify-center gap-4">
        <Link
          href={`/${locale}/locations`}
          className="rounded border border-blue-400/50 bg-brand-logo-gradient px-6 py-3 font-nav text-sm font-extrabold uppercase tracking-wider text-white shadow-lg hover:brightness-110"
        >
          {dict.historicVisitation.exploreLocationsCta}
        </Link>
        <Link
          href={`/${locale}/about#history`}
          className="rounded border border-navy-600 px-6 py-3 font-nav text-sm font-bold uppercase tracking-wider text-white hover:bg-navy-900"
        >
          {dict.historicVisitation.readHistoryCta}
        </Link>
      </div>
    </section>
  );
}
