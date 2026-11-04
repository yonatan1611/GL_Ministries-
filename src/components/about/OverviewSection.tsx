import Link from "next/link";
import { HandHeart } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { CORE_COMMITMENTS, VISION_MISSION } from "@/data/ministry-content";
import { MINISTRY_IMAGES } from "@/data/social-media";
import type { Locale } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";

/**
 * Unified Mission & Vision overview — merges the legacy site's two
 * 100%-duplicate "About Us" (`page_id=28263`) and "Vision"
 * (`page_id=28322`) pages into one authoritative section.
 */
export function OverviewSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-col gap-10">
      <div className="relative overflow-hidden rounded-2xl border border-navy-800 bg-navy-950">
        <div className="absolute inset-0">
          <MinistryImage
            src={MINISTRY_IMAGES.crusadeRevivalGathering}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-navy-950/60" />
        </div>
        <div className="relative flex flex-col items-start gap-4 p-6 sm:p-10">
          <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
            {dict.about.partnerBannerTitle}
          </h3>
          <p className="max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {dict.about.partnerBannerBody}
          </p>
          <Link
            href={`/${locale}/give`}
            className="mt-2 flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <HandHeart className="h-4 w-4" aria-hidden="true" />
            {dict.about.partnerCta}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div id="vision" className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold text-navy-900">
            {dict.about.visionLabel}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {locale === "am" ? VISION_MISSION.visionAm : VISION_MISSION.visionEn}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-display text-lg font-bold text-navy-900">
            {dict.about.missionLabel}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {locale === "am" ? VISION_MISSION.missionAm : VISION_MISSION.missionEn}
          </p>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-bold text-navy-900">
          {dict.about.commitmentsTitle}
        </h3>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {CORE_COMMITMENTS.map((commitment) => (
            <div
              key={commitment.titleEn}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <p className="font-display text-base font-bold text-amber-700">
                {locale === "am" ? commitment.titleAm : commitment.titleEn}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {locale === "am" ? commitment.descriptionAm : commitment.descriptionEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
