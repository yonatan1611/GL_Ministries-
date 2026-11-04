"use client";

import { useState } from "react";
import { Church, MapPin, PlayCircle, Users } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { MINISTRY_IMAGES, MINISTRY_VIDEO_IDS } from "@/data/social-media";
import { getYoutubeAutoplayEmbedUrl } from "@/lib/youtube";
import type { Locale } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";
import { VideoModal } from "@/components/ui/VideoModal";
import { MinistryContactModal } from "@/components/home/MinistryContactModal";
import type { ContactInquiryType } from "@/lib/validations";

const DC_SANCTUARY_ADDRESS = "2401 Virginia Ave NW, Washington, DC 20037";
const DC_ADMIN_OFFICE_ADDRESS = "85 South Bragg St, Suite 200, Alexandria, VA 22312";
const DC_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DC_SANCTUARY_ADDRESS)}`;
const WATCH_EMBED_URL = getYoutubeAutoplayEmbedUrl(MINISTRY_VIDEO_IDS.worshipChoir);

/**
 * "Welcome to Gospel Light Washington, D.C. — Plan Your Visit" flagship
 * section: a Facebook/YouTube-sourced photo gallery on the left and the
 * D.C. sanctuary's history + DMV community ministries on the right,
 * anchored at `#visit-dc` so the hero card's "Plan Your Visit" link and
 * the locations directory can both jump straight to it.
 */
export function WashingtonDcSpotlightSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [isWatchOpen, setIsWatchOpen] = useState(false);
  const [activeInquiry, setActiveInquiry] = useState<ContactInquiryType | null>(null);

  return (
    <section id="visit-dc" className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
        {/* Left: Facebook & YouTube photo gallery */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-2xl shadow-md">
            <MinistryImage
              src={MINISTRY_IMAGES.pastorAberhamPortrait}
              alt={dict.dcSpotlight.galleryPastorAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl shadow-md">
            <MinistryImage
              src={MINISTRY_IMAGES.apostleDanielPreachingHd}
              alt={dict.dcSpotlight.galleryApostleAlt}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsWatchOpen(true)}
            aria-label={dict.dcSpotlight.watchAria}
            className="group relative aspect-square overflow-hidden rounded-2xl shadow-md"
          >
            <MinistryImage
              src={MINISTRY_IMAGES.sanctuaryWorshipChoir}
              alt={dict.dcSpotlight.galleryWorshipAlt}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-navy-950/20 transition-colors group-hover:bg-navy-950/50">
              <PlayCircle className="h-10 w-10 text-white" aria-hidden="true" />
            </div>
          </button>
        </div>

        {/* Right: D.C. sanctuary details & DMV community ministries */}
        <div>
          <p className="font-nav text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            {dict.dcSpotlight.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            {dict.dcSpotlight.heading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            {dict.dcSpotlight.historyParagraph}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <MapPin className="h-5 w-5 text-amber-600" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-navy-900">{dict.dcSpotlight.infoSanctuaryTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{dict.dcSpotlight.infoSanctuaryBody}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <MapPin className="h-5 w-5 text-amber-600" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-navy-900">{dict.dcSpotlight.infoOfficeTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{dict.dcSpotlight.infoOfficeBody}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <Users className="h-5 w-5 text-amber-600" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-navy-900">{dict.dcSpotlight.infoCellGroupsTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{dict.dcSpotlight.infoCellGroupsBody}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <Church className="h-5 w-5 text-amber-600" aria-hidden="true" />
              <p className="mt-2 text-sm font-semibold text-navy-900">{dict.dcSpotlight.infoMissionBridgeTitle}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{dict.dcSpotlight.infoMissionBridgeBody}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={DC_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-brand-logo-gradient px-5 py-3 font-nav text-xs font-bold uppercase tracking-[0.1em] text-white hover:brightness-110"
            >
              {dict.dcSpotlight.ctaDirections}
            </a>
            <button
              type="button"
              onClick={() => setActiveInquiry("General Inquiry")}
              className="rounded border border-navy-300 px-5 py-3 font-nav text-xs font-bold uppercase tracking-[0.1em] text-navy-800 hover:bg-navy-50"
            >
              {dict.dcSpotlight.ctaPlanVisit}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">{DC_ADMIN_OFFICE_ADDRESS}</p>
        </div>
      </div>

      <VideoModal
        isOpen={isWatchOpen}
        onClose={() => setIsWatchOpen(false)}
        title={dict.dcSpotlight.galleryWorshipAlt}
        closeLabel={dict.buttons.close}
        embedUrl={WATCH_EMBED_URL}
      />

      <MinistryContactModal
        locale={locale}
        inquiryType={activeInquiry}
        defaultOffice="dc@glministries.org"
        onClose={() => setActiveInquiry(null)}
      />
    </section>
  );
}
