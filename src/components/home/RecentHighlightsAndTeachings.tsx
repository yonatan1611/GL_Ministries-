"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle, Share2 } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { getYoutubeEmbedUrl, getYoutubeThumbnailUrl, extractYoutubeVideoId } from "@/lib/youtube";
import type { Locale } from "@/lib/utils";
import type { NewsHighlight, Sermon } from "@/types/ministry";
import { useToast } from "@/components/providers/AppProviders";
import { BookCoverImage } from "@/components/books/BookCoverImage";
import { Modal } from "@/components/ui/Modal";

const CATEGORY_BADGE_CLASS: Record<NewsHighlight["category"], string> = {
  "Washington, D.C. Sanctuary": "bg-blue-50 text-blue-700",
  "Revival & Crusade Report": "bg-amber-50 text-amber-700",
  "Ethiopian Synod Update": "bg-emerald-50 text-emerald-700",
  "Special Announcement": "bg-purple-50 text-purple-700",
  "Testimony & Baptism": "bg-rose-50 text-rose-700",
};

/**
 * "Recent Updates & Highlights" + "Latest Teachings" split grid, styled
 * after bennyhinn.org's Avada-style 2-column news/media split. Both
 * columns are 100% dynamic: updates come from the Admin Portal's News &
 * Highlights manager (`GET /api/updates`, SSR-seeded from
 * `listNewsUpdates()`), and teachings come from the live sermon catalog
 * (`GET /api/sermons`), preferring whichever sermons staff have marked
 * "Featured" so this card never needs a hardcoded video-id list again.
 */
export function RecentHighlightsAndTeachings({
  locale,
  initialUpdates,
  initialSermons,
}: {
  locale: Locale;
  initialUpdates: NewsHighlight[];
  initialSermons: Sermon[];
}) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();
  const [updates, setUpdates] = useState<NewsHighlight[]>(initialUpdates);
  const [sermons, setSermons] = useState<Sermon[]>(initialSermons);
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refreshUpdates() {
      try {
        const response = await fetch("/api/updates");
        const result = await response.json().catch(() => null);
        if (!cancelled && result?.success) setUpdates(result.data.updates as NewsHighlight[]);
      } catch {
        // Progressive enhancement over the SSR snapshot — fail silently.
      }
    }

    async function refreshSermons() {
      try {
        const response = await fetch("/api/sermons");
        const result = await response.json().catch(() => null);
        if (!cancelled && result?.success) setSermons(result.data.sermons as Sermon[]);
      } catch {
        // Progressive enhancement over the SSR snapshot — fail silently.
      }
    }

    refreshUpdates();
    refreshSermons();
    return () => {
      cancelled = true;
    };
  }, []);

  const leadStory = updates[0];
  const secondaryUpdates = updates.slice(1, 4);
  const openStory = updates.find((u) => u.id === openStoryId) ?? null;

  const featuredSermons = sermons.filter((s) => s.featured);
  const featuredTeachings = (featuredSermons.length > 0 ? featuredSermons : sermons).slice(0, 4);

  async function handleShare(update: NewsHighlight) {
    const title = locale === "am" ? update.titleAm : update.titleEn;
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      showToast(dict.dailyWord.copiedLabel, "success");
    } catch {
      // User-cancelled share sheets throw too — not an error worth surfacing.
    }
  }

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-10 lg:grid-cols-2">
        {/* Left: Recent Updates & Highlights */}
        <div>
          <p className="font-crest text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            {dict.recentHighlights.highlightsTitle}
          </p>

          {!leadStory ? (
            <p className="mt-4 text-sm text-slate-500">{dict.recentHighlights.noUpdatesLabel}</p>
          ) : (
            <>
              {/* Lead story card */}
              <button
                type="button"
                onClick={() => setOpenStoryId(leadStory.id)}
                className="mt-4 block w-full overflow-hidden border border-[#E6DFD3] bg-white text-left shadow-md transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-video w-full border-b-4 border-amber-600">
                  <BookCoverImage src={leadStory.imageUrl} alt="" fill className="object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${CATEGORY_BADGE_CLASS[leadStory.category]}`}
                    >
                      {leadStory.category}
                    </span>
                    <span className="text-xs text-slate-500">{leadStory.publishedDateLabel}</span>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold text-navy-900">
                    {locale === "am" ? leadStory.titleAm : leadStory.titleEn}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {locale === "am" ? leadStory.summaryAm : leadStory.summaryEn}
                  </p>
                  <span className="mt-4 flex items-center gap-1.5 font-nav text-xs font-bold uppercase tracking-[0.1em] text-[#1E40AF]">
                    {dict.recentHighlights.readFullStoryCta}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </button>

              {/* Secondary recent updates */}
              {secondaryUpdates.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  {secondaryUpdates.map((update) => (
                    <button
                      key={update.id}
                      type="button"
                      onClick={() => setOpenStoryId(update.id)}
                      className="flex items-center gap-3 border border-[#E6DFD3] bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded">
                        <BookCoverImage src={update.imageUrl} alt="" fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${CATEGORY_BADGE_CLASS[update.category]}`}
                        >
                          {update.category}
                        </span>
                        <p className="mt-1 truncate text-sm font-semibold text-navy-900">
                          {locale === "am" ? update.titleAm : update.titleEn}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Latest Teachings (VOD) */}
        <div>
          <p className="font-crest text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
            {dict.recentHighlights.teachingsTitle}
          </p>
          <div className="mt-4 overflow-hidden border border-[#E6DFD3] bg-white p-6 shadow-md">
            <div className="grid grid-cols-2 gap-3">
              {featuredTeachings.map((sermon) => (
                <Link
                  key={sermon.id}
                  href={`/${locale}/sermons?sermon=${sermon.id}`}
                  className="group overflow-hidden border border-[#E6DFD3]"
                >
                  <div className="relative aspect-video w-full bg-navy-950">
                    <BookCoverImage
                      src={getYoutubeThumbnailUrl(sermon.youtubeId)}
                      alt=""
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-950/0 transition-colors group-hover:bg-navy-950/40">
                      <PlayCircle
                        className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <p className="line-clamp-2 h-10 px-2 pt-2 text-xs font-semibold leading-4 text-navy-900">
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

      {/* Story Reader Modal */}
      <Modal
        isOpen={Boolean(openStory)}
        onClose={() => setOpenStoryId(null)}
        title={openStory ? (locale === "am" ? openStory.titleAm : openStory.titleEn) : ""}
        closeLabel={dict.buttons.close}
      >
        {openStory && (
          <div className="flex flex-col gap-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <BookCoverImage src={openStory.imageUrl} alt="" fill className="object-cover" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${CATEGORY_BADGE_CLASS[openStory.category]}`}
              >
                {openStory.category}
              </span>
              <span className="text-xs text-slate-500">
                {openStory.locationLabel} · {openStory.publishedDateLabel}
              </span>
            </div>

            {openStory.videoUrl && extractYoutubeVideoId(openStory.videoUrl) && (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe
                  src={getYoutubeEmbedUrl(extractYoutubeVideoId(openStory.videoUrl)!)}
                  title={locale === "am" ? openStory.titleAm : openStory.titleEn}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 text-sm leading-relaxed text-slate-700">
              {(locale === "am" ? openStory.contentAm : openStory.contentEn)
                .split("\n\n")
                .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>

            <button
              type="button"
              onClick={() => handleShare(openStory)}
              className="flex w-fit items-center gap-1.5 self-start rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              {dict.recentHighlights.shareCta}
            </button>
          </div>
        )}
      </Modal>
    </section>
  );
}
