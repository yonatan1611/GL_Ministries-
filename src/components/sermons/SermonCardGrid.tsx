import { Download, ExternalLink, Play, PlayCircle } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { getYoutubeThumbnailUrl, getYoutubeWatchUrl } from "@/lib/youtube";
import { cn, type Locale } from "@/lib/utils";
import type { Sermon } from "@/types/ministry";
import { MinistryImage } from "@/components/ui/MinistryImage";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";

interface SermonCardGridProps {
  locale: Locale;
  sermons: Sermon[];
  activeSermonId: string;
  onSelectSermon: (id: string) => void;
}

/**
 * Responsive sermon archive grid. Each card shows the real YouTube
 * thumbnail with a play overlay, bilingual titles (both languages,
 * always) so English- and Amharic-reading visitors can both identify
 * every message at a glance, and a direct link to watch on YouTube
 * alongside the in-app player button.
 */
export function SermonCardGrid({ locale, sermons, activeSermonId, onSelectSermon }: SermonCardGridProps) {
  const dict = getDictionary(locale);

  if (sermons.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        {dict.sermonsPage.showingCountTemplate.replace("{count}", "0").replace("{total}", "0")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sermons.map((sermon) => {
        const isActive = sermon.id === activeSermonId;
        const primaryTitle = locale === "am" ? sermon.titleAm : sermon.titleEn;
        const secondaryTitle = locale === "am" ? sermon.titleEn : sermon.titleAm;
        const scripture = locale === "am" ? sermon.scriptureAm : sermon.scriptureEn;

        return (
          <SpotlightCard
            key={sermon.id}
            spotlightColor="rgba(37, 99, 235, 0.22)"
            className={cn(
              "flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-colors",
              isActive ? "border-amber-500 bg-amber-50/30" : "border-slate-200 bg-white"
            )}
          >
            <button
              type="button"
              onClick={() => onSelectSermon(sermon.id)}
              aria-label={`${dict.sermonsPage.loadAndWatch} — ${primaryTitle}`}
              className="group relative block aspect-video w-full overflow-hidden bg-navy-950"
            >
              <MinistryImage
                src={getYoutubeThumbnailUrl(sermon.youtubeId)}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-navy-950/20 transition-colors group-hover:bg-navy-950/35">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600/90 text-white shadow-lg">
                  <Play className="h-5 w-5 translate-x-0.5" aria-hidden="true" fill="currentColor" />
                </span>
              </span>
            </button>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-navy-100 px-3 py-1 text-xs font-semibold text-navy-800">
                  {dict.sermonsPage.topics[sermon.topic]}
                </span>
                <span className="text-xs font-medium text-slate-500">{sermon.yearLabel}</span>
              </div>

              <h3 className="mt-3 font-display text-base font-bold text-navy-900">{primaryTitle}</h3>
              <p className="text-xs text-slate-500">{secondaryTitle}</p>

              {scripture && <p className="mt-2 text-xs font-medium text-amber-700">{scripture}</p>}

              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                {locale === "am" ? sermon.summaryAm : sermon.summaryEn}
              </p>

              {(sermon.duration || sermon.audioSizeMb) && (
                <p className="mt-3 text-xs text-slate-500">
                  {sermon.duration}
                  {sermon.duration && sermon.audioSizeMb ? " • " : ""}
                  {sermon.audioSizeMb ? `${sermon.audioSizeMb} MB MP3` : ""}
                </p>
              )}
              <p className="mt-1 text-xs font-medium text-slate-700">
                {locale === "am" ? sermon.speakerAm : sermon.speakerEn}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectSermon(sermon.id)}
                  disabled={isActive}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold",
                    isActive
                      ? "cursor-default bg-amber-100 text-amber-800"
                      : "bg-amber-600 text-white hover:bg-amber-700"
                  )}
                >
                  <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {isActive ? dict.sermonsPage.nowPlaying : dict.sermonsPage.loadAndWatch}
                </button>
                <a
                  href={getYoutubeWatchUrl(sermon.youtubeId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={dict.sermonsPage.watchYoutube}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                {sermon.audioMp3Url && (
                  <a
                    href={sermon.audioMp3Url}
                    download
                    aria-label={dict.sermonsPage.downloadAudioTemplate.replace("{size}", String(sermon.audioSizeMb ?? 0))}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </SpotlightCard>
        );
      })}
    </div>
  );
}
