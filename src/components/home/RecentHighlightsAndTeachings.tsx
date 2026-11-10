"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SERMONS } from "@/data/ministry-content";
import { MINISTRY_IMAGES } from "@/data/social-media";
import { getYoutubeThumbnailUrl } from "@/lib/youtube";
import type { Locale } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";
import { Modal } from "@/components/ui/Modal";

/** Top 4 featured teachings (2x2 grid) — Gospel Light Church, DC leads,
 *  followed by Ethiopia HQ teachings — with a clean "Watch All 38+
 *  Sermons" button doing the rest of the work, rather than dumping
 *  dozens of video cards onto the homepage. */
const FEATURED_TEACHING_IDS = ["5wNOAS6kUQ8", "PPdkq9gddlU", "-ilsw36Mh8E", "oLx8cvN83w4"];

/**
 * "Recent Updates & Highlights" + "Latest Teachings" split grid, styled
 * after bennyhinn.org's Avada-style 2-column news/media split: a
 * featured editorial story on the left, real YouTube VOD teachings on
 * the right.
 */
export function RecentHighlightsAndTeachings({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  const featuredTeachings = FEATURED_TEACHING_IDS.map((youtubeId) =>
    SERMONS.find((sermon) => sermon.youtubeId === youtubeId)
  ).filter((sermon): sermon is (typeof SERMONS)[number] => Boolean(sermon));

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left: Recent Updates & Highlights */}
        <div className="overflow-hidden border border-[#E6DFD3] bg-white shadow-md">
          <div className="relative aspect-video w-full border-b-4 border-amber-600">
            <MinistryImage
              src={MINISTRY_IMAGES.crusadeRevivalGathering}
              alt=""
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <p className="font-crest text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              {dict.recentHighlights.highlightsTitle}
            </p>
            <h3 className="mt-3 font-display text-xl font-bold text-navy-900">
              {dict.recentHighlights.storyHeadline}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{dict.recentHighlights.storyBody}</p>
            <button
              type="button"
              onClick={() => setIsStoryOpen(true)}
              className="mt-4 flex items-center gap-1.5 font-nav text-xs font-bold uppercase tracking-[0.1em] text-[#1E40AF] hover:text-[#2563EB]"
            >
              {dict.recentHighlights.readMore}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Right: Latest Teachings (VOD) */}
        <div className="overflow-hidden border border-[#E6DFD3] bg-white shadow-md">
          <div className="p-6">
            <p className="font-crest text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              {dict.recentHighlights.teachingsTitle}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {featuredTeachings.map((sermon) => (
                <Link
                  key={sermon.id}
                  href={`/${locale}/sermons?sermon=${sermon.id}`}
                  className="group overflow-hidden border border-[#E6DFD3]"
                >
                  <div className="relative aspect-video w-full bg-navy-950">
                    <MinistryImage
                      src={getYoutubeThumbnailUrl(sermon.youtubeId)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-950/0 transition-colors group-hover:bg-navy-950/40">
                      <PlayCircle
                        className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <p className="h-10 overflow-hidden px-2 pt-2 text-xs font-semibold leading-4 text-navy-900">
                    {locale === "am" ? sermon.titleAm : sermon.titleEn}
                  </p>
                </Link>
              ))}
            </div>
            <Link
              href={`/${locale}/sermons`}
              className="mt-5 flex items-center justify-center gap-1.5 rounded bg-brand-logo-gradient px-4 py-3 font-nav text-xs font-bold uppercase tracking-[0.1em] text-white hover:brightness-110"
            >
              {dict.recentHighlights.watchAllCta}
            </Link>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isStoryOpen}
        onClose={() => setIsStoryOpen(false)}
        title={dict.recentHighlights.storyHeadline}
        closeLabel={dict.buttons.close}
      >
        <p className="text-sm leading-relaxed text-slate-700">{dict.recentHighlights.readMoreBody}</p>
      </Modal>
    </section>
  );
}
