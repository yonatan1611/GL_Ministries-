import { ExternalLink, Facebook } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { FACEBOOK_PAGE_PICTURE_URL, FACEBOOK_PAGE_URL, FACEBOOK_PAGES, MINISTRY_IMAGES, YOUTUBE_CHANNEL } from "@/data/social-media";
import type { Locale } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";

/**
 * "Ministry in Action" — the verified Facebook page card plus a real
 * photo/media gallery drawn from the ministry's own live assets
 * (glministries.org media library, YouTube thumbnails). Replaces
 * generic stock-feeling placeholders with authentic ministry imagery.
 */
export function FacebookCommunitySection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  const galleryItems = [
    { src: MINISTRY_IMAGES.apostleDanielPortrait, caption: dict.community.captionApostleDaniel },
    { src: MINISTRY_IMAGES.pastorAberhamPortrait, caption: dict.community.captionPastorAberham },
    { src: MINISTRY_IMAGES.historyRevival1970s, caption: dict.community.captionHistory },
    { src: MINISTRY_IMAGES.eastShowaSynodBadge, caption: dict.community.captionEastShowa },
    { src: MINISTRY_IMAGES.sanctuaryWorshipChoir, caption: dict.community.captionWorship },
    { src: MINISTRY_IMAGES.bookHearingGodsVoiceCover, caption: dict.community.captionBookCover },
  ];

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            {dict.community.sectionTitle}
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">{dict.community.sectionSubtitle}</p>
        </div>

        <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center sm:flex-row sm:text-left">
          <MinistryImage
            src={FACEBOOK_PAGE_PICTURE_URL}
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-[72px] shrink-0 rounded-full object-cover shadow-sm"
          />
          <div className="flex-1">
            <p className="font-display text-base font-bold text-navy-900">{FACEBOOK_PAGES.washingtonDc.name}</p>
            <p className="text-xs text-slate-500">facebook.com/{FACEBOOK_PAGES.washingtonDc.username}</p>
          </div>
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#1877F2] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Facebook className="h-4 w-4" aria-hidden="true" />
            {dict.community.followFacebook}
          </a>
        </div>

        <div className="mt-10">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.community.galleryLabel}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {galleryItems.map((item) => (
              <figure key={item.src} className="overflow-hidden rounded-xl border border-slate-200">
                <div className="relative aspect-square bg-slate-100">
                  <MinistryImage src={item.src} alt="" fill sizes="(min-width: 1024px) 16vw, 33vw" className="object-cover" />
                </div>
                <figcaption className="px-2 py-1.5 text-center text-[11px] font-medium text-slate-600">
                  {item.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href={YOUTUBE_CHANNEL.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            {dict.community.watchYoutube}
          </a>
        </div>
      </div>
    </section>
  );
}
