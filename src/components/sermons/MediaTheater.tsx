"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FastForward,
  Headphones,
  MessageCircle,
  Pause,
  Play,
  Radio,
  Rewind,
  Send,
  Share2,
  Youtube,
} from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SOCIAL_LINKS, YOUTUBE_CHANNEL } from "@/data/social-media";
import { FacebookIcon, InstagramIcon, TikTokIcon, XIcon, YoutubeIcon } from "@/components/ui/BrandIcons";
import { BROADCAST_WINDOWS, formatCountdown, getBroadcastStatus } from "@/lib/broadcastSchedule";
import { getYoutubeEmbedUrl, getYoutubeWatchUrl } from "@/lib/youtube";
import {
  cn,
  formatSecondsToDuration,
  parseDurationToSeconds,
  type Locale,
} from "@/lib/utils";
import type { Sermon } from "@/types/ministry";
import { useToast } from "@/components/providers/AppProviders";

type TheaterMode = "ondemand" | "live";
type PlayerMode = "video" | "audio";

const PLAYBACK_RATES = [1, 1.25, 1.5] as const;

const BROADCAST_LABELS: Record<(typeof BROADCAST_WINDOWS)[number]["key"], { scheduleKey: "hqSunday" | "hqWednesday" | "dcSunday" | "dcWednesday"; titleKey: "hqTitle" | "dcTitle" }> = {
  "hq-sunday": { scheduleKey: "hqSunday", titleKey: "hqTitle" },
  "hq-wednesday": { scheduleKey: "hqWednesday", titleKey: "hqTitle" },
  "dc-sunday": { scheduleKey: "dcSunday", titleKey: "dcTitle" },
  "dc-wednesday": { scheduleKey: "dcWednesday", titleKey: "dcTitle" },
};

interface MediaTheaterProps {
  locale: Locale;
  sermon: Sermon;
  mode: TheaterMode;
  onModeChange: (mode: TheaterMode) => void;
  onRequestPrayerComment: () => void;
}

/**
 * Dual-mode media theater: an on-demand HD video / low-bandwidth audio
 * sermon player, and a live broadcast view with a real schedule-driven
 * "LIVE NOW" / next-broadcast status. Replaces the legacy site's empty
 * Live Stream page and its two sermon embeds that showed playback
 * errors.
 */
export function MediaTheater({ locale, sermon, mode, onModeChange, onRequestPrayerComment }: MediaTheaterProps) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();

  return (
    <section
      id="live"
      className="overflow-hidden rounded-2xl border border-navy-800 bg-navy-950 text-white shadow-xl"
    >
      <div className="flex gap-2 border-b border-navy-800 p-4">
        <button
          type="button"
          onClick={() => onModeChange("ondemand")}
          aria-pressed={mode === "ondemand"}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            mode === "ondemand" ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-navy-800"
          )}
        >
          {dict.sermonsPage.onDemandTabLabel}
        </button>
        <button
          type="button"
          onClick={() => onModeChange("live")}
          aria-pressed={mode === "live"}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            mode === "live" ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-navy-800"
          )}
        >
          <Radio className="h-4 w-4" aria-hidden="true" />
          {dict.sermonsPage.liveTabLabel}
        </button>
      </div>

      <div className="p-6">
        {mode === "ondemand" ? (
          <OnDemandView locale={locale} sermon={sermon} showToast={showToast} />
        ) : (
          <LiveView locale={locale} onRequestPrayerComment={onRequestPrayerComment} />
        )}

        <ChannelBar locale={locale} />
      </div>
    </section>
  );
}

const CHANNEL_BADGES = [
  { href: SOCIAL_LINKS.youtubeChannelUrl, labelEn: "YouTube", labelAm: "YouTube", Icon: YoutubeIcon },
  { href: SOCIAL_LINKS.facebookPageUrl, labelEn: "Facebook", labelAm: "Facebook", Icon: FacebookIcon },
  { href: SOCIAL_LINKS.telegramUrl, labelEn: "Telegram", labelAm: "Telegram", Icon: Send },
  { href: SOCIAL_LINKS.instagramUrl, labelEn: "Instagram", labelAm: "Instagram", Icon: InstagramIcon },
  { href: SOCIAL_LINKS.tiktokUrl, labelEn: "TikTok", labelAm: "TikTok", Icon: TikTokIcon },
  { href: SOCIAL_LINKS.xTwitterUrl, labelEn: "X", labelAm: "X", Icon: XIcon },
] as const;

/**
 * Multi-platform channel bar — direct badges to every verified live
 * channel (YouTube, Facebook, Telegram, Instagram, TikTok, X), modeled
 * on bennyhinn.org's multi-platform presence and replacing the legacy
 * site's single dead video embed.
 */
function ChannelBar({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-navy-800 pt-5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {dict.sermonsPage.followEverywhereLabel}
      </span>
      {CHANNEL_BADGES.map(({ href, labelEn, labelAm, Icon }) => (
        <a
          key={labelEn}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-full border border-navy-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-amber-500 hover:text-amber-400"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {locale === "am" ? labelAm : labelEn}
        </a>
      ))}
    </div>
  );
}

function OnDemandView({
  locale,
  sermon,
  showToast,
}: {
  locale: Locale;
  sermon: Sermon;
  showToast: (message: string, variant?: "success" | "error" | "info") => void;
}) {
  const dict = getDictionary(locale);
  const hasAudio = Boolean(sermon.audioMp3Url);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playerMode, setPlayerMode] = useState<PlayerMode>("video");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(() =>
    sermon.duration ? parseDurationToSeconds(sermon.duration) : 0
  );
  const [playbackRate, setPlaybackRate] = useState<(typeof PLAYBACK_RATES)[number]>(1);
  const [showStudyNotes, setShowStudyNotes] = useState(false);

  // Reset the player whenever the active sermon changes.
  useEffect(() => {
    audioRef.current?.pause();
    setPlayerMode("video");
    setIsPlaying(false);
    setCurrentTime(0);
    setDurationSeconds(sermon.duration ? parseDurationToSeconds(sermon.duration) : 0);
    setPlaybackRate(1);
    setShowStudyNotes(false);
  }, [sermon.id, sermon.duration]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => showToast(dict.forms.error, "error"));
  }

  function skip(deltaSeconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.min(Math.max(0, audio.currentTime + deltaSeconds), durationSeconds || audio.duration || 0);
    audio.currentTime = next;
    setCurrentTime(next);
  }

  function handleScrub(value: number) {
    const audio = audioRef.current;
    if (audio) audio.currentTime = value;
    setCurrentTime(value);
  }

  function changeSpeed(rate: (typeof PLAYBACK_RATES)[number]) {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }

  async function handleShare() {
    const url = `${window.location.origin}/${locale}/sermons?sermon=${sermon.id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast(dict.sermonsPage.shareCopied, "success");
    } catch {
      showToast(dict.forms.error, "error");
    }
  }

  const title = locale === "am" ? sermon.titleAm : sermon.titleEn;
  const speaker = locale === "am" ? sermon.speakerAm : sermon.speakerEn;
  const scripture = locale === "am" ? sermon.scriptureAm : sermon.scriptureEn;
  const scriptureOther = locale === "am" ? sermon.scriptureEn : sermon.scriptureAm;
  const summary = locale === "am" ? sermon.summaryAm : sermon.summaryEn;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">{sermon.yearLabel}</p>
          <h2 className="mt-1 font-display text-xl font-bold sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-slate-300">
            {speaker}
            {scripture ? ` · ${scripture}` : ""}
          </p>
        </div>

        {hasAudio && (
          <div className="flex gap-1 rounded-lg border border-navy-700 p-1">
            <button
              type="button"
              onClick={() => setPlayerMode("video")}
              aria-pressed={playerMode === "video"}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-semibold",
                playerMode === "video" ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-navy-800"
              )}
            >
              {dict.sermonsPage.hdVideoMode}
            </button>
            <button
              type="button"
              onClick={() => setPlayerMode("audio")}
              aria-pressed={playerMode === "audio"}
              className={cn(
                "rounded px-3 py-1.5 text-xs font-semibold",
                playerMode === "audio" ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-navy-800"
              )}
            >
              {dict.sermonsPage.audioMode}
            </button>
          </div>
        )}
      </div>

      <div className="sticky top-16 z-30 -mx-6 bg-navy-950 px-6 py-2 shadow-xl lg:static lg:top-auto lg:z-auto lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none">
        {playerMode === "video" || !hasAudio ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe
              key={sermon.id}
              src={getYoutubeEmbedUrl(sermon.youtubeId)}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-navy-800 bg-navy-900 p-5">
            <audio
              ref={audioRef}
              src={sermon.audioMp3Url}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                if (Number.isFinite(e.currentTarget.duration)) {
                  setDurationSeconds(e.currentTarget.duration);
                }
              }}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              className="hidden"
            />

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? dict.sermonsPage.pauseAria : dict.sermonsPage.playAria}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-600 text-white hover:bg-amber-700"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Play className="h-6 w-6" aria-hidden="true" />
                )}
              </button>

              <AudioWaveform isPlaying={isPlaying} />
            </div>

            <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
              <span>{formatSecondsToDuration(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(durationSeconds, 1)}
                step={1}
                value={Math.min(currentTime, durationSeconds)}
                onChange={(e) => handleScrub(Number(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-navy-700 accent-amber-500"
                aria-label={dict.sermonsPage.audioMode}
              />
              <span>{formatSecondsToDuration(durationSeconds)}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => skip(-15)}
                  aria-label={dict.sermonsPage.skipBack}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-700 text-slate-300 hover:bg-navy-800"
                >
                  <Rewind className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => skip(15)}
                  aria-label={dict.sermonsPage.skipForward}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-700 text-slate-300 hover:bg-navy-800"
                >
                  <FastForward className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">{dict.sermonsPage.speedLabel}</span>
                {PLAYBACK_RATES.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => changeSpeed(rate)}
                    aria-pressed={playbackRate === rate}
                    className={cn(
                      "rounded px-2 py-1 text-xs font-semibold",
                      playbackRate === rate ? "bg-amber-600 text-white" : "text-slate-300 hover:bg-navy-800"
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={getYoutubeWatchUrl(sermon.youtubeId)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          <Youtube className="h-4 w-4" aria-hidden="true" />
          {dict.sermonsPage.watchYoutube}
        </a>
        <a
          href={YOUTUBE_CHANNEL.subscribeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-navy-800"
        >
          <Radio className="h-4 w-4" aria-hidden="true" />
          {dict.sermonsPage.subscribeYoutube}
        </a>
        {hasAudio && (
          <a
            href={sermon.audioMp3Url}
            download
            onClick={() =>
              showToast(dict.sermonsPage.downloadAudioTemplate.replace("{size}", String(sermon.audioSizeMb ?? 0)), "info")
            }
            className="flex items-center gap-1.5 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-navy-800"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {dict.sermonsPage.downloadAudioTemplate.replace("{size}", String(sermon.audioSizeMb ?? 0))}
          </a>
        )}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-navy-800"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          {dict.sermonsPage.shareTeaching}
        </button>
        <button
          type="button"
          onClick={() => setShowStudyNotes((open) => !open)}
          aria-expanded={showStudyNotes}
          className="flex items-center gap-1.5 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-navy-800"
        >
          {showStudyNotes ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
          {dict.sermonsPage.studyNotesToggle}
        </button>
      </div>

      {showStudyNotes && (
        <div className="mt-4 rounded-xl border border-navy-800 bg-navy-900 p-5 text-sm text-slate-200">
          {scripture && <p className="font-semibold text-amber-400">{scripture}</p>}
          {scriptureOther && <p className="text-slate-400">{scriptureOther}</p>}
          <p className="mt-3 leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}

function AudioWaveform({ isPlaying }: { isPlaying: boolean }) {
  const bars = [6, 10, 14, 10, 6, 12, 8];
  return (
    <div className="flex h-10 flex-1 items-center gap-1" aria-hidden="true">
      {bars.map((height, index) => (
        <span
          key={index}
          className={cn("w-1.5 rounded-full bg-amber-500", isPlaying ? "animate-pulse" : "opacity-40")}
          style={{
            height: `${height}px`,
            animationDelay: `${index * 90}ms`,
            animationDuration: "900ms",
          }}
        />
      ))}
    </div>
  );
}

function LiveView({
  locale,
  onRequestPrayerComment,
}: {
  locale: Locale;
  onRequestPrayerComment: () => void;
}) {
  const dict = getDictionary(locale);
  const [status, setStatus] = useState(() => getBroadcastStatus());

  useEffect(() => {
    const interval = setInterval(() => setStatus(getBroadcastStatus()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const activeLabels = status.activeWindow ? BROADCAST_LABELS[status.activeWindow.key] : null;
  const nextLabels = status.nextWindow ? BROADCAST_LABELS[status.nextWindow.key] : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {status.isLiveNow ? (
          <span className="flex items-center gap-2 rounded-full bg-red-600/20 px-4 py-1.5 text-sm font-bold text-red-400">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            {dict.sermonsPage.liveNowBadge}
          </span>
        ) : (
          <span className="rounded-full bg-navy-800 px-4 py-1.5 text-sm font-semibold text-slate-300">
            {dict.sermonsPage.offlineBadge}
          </span>
        )}

        {activeLabels && (
          <span className="text-sm text-slate-300">{dict.schedule[activeLabels.titleKey]}</span>
        )}
        {!status.isLiveNow && nextLabels && status.minutesUntilNext !== null && (
          <span className="text-sm text-slate-300">
            {dict.sermonsPage.nextBroadcastLabel}: {dict.schedule[nextLabels.titleKey]} —{" "}
            {formatCountdown(status.minutesUntilNext)}
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-navy-800 bg-navy-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">{dict.schedule.hqTitle}</p>
          <p className="mt-2 text-sm text-slate-200">{dict.schedule.hqSunday}</p>
          <p className="text-sm text-slate-200">{dict.schedule.hqWednesday}</p>
        </div>
        <div className="rounded-xl border border-navy-800 bg-navy-900 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-400">{dict.schedule.dcTitle}</p>
          <p className="mt-1 text-xs text-slate-500">{dict.schedule.dcAddress}</p>
          <p className="mt-2 text-sm text-slate-200">{dict.schedule.dcSunday}</p>
          <p className="text-sm text-slate-200">{dict.schedule.dcWednesday}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={YOUTUBE_CHANNEL.channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          <Youtube className="h-4 w-4" aria-hidden="true" />
          {dict.sermonsPage.watchYoutube}
        </a>
        <a
          href={SOCIAL_LINKS.facebookLiveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-navy-800"
        >
          <FacebookIcon className="h-4 w-4" aria-hidden="true" />
          {dict.sermonsPage.watchFacebookLive}
        </a>
        <a
          href={YOUTUBE_CHANNEL.channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-navy-800"
        >
          <Headphones className="h-4 w-4" aria-hidden="true" />
          {dict.sermonsPage.listenAudioStream}
        </a>
        <button
          type="button"
          onClick={onRequestPrayerComment}
          className="flex items-center gap-1.5 rounded-lg border border-navy-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-navy-800"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          {dict.sermonsPage.submitPrayerComment}
        </button>
      </div>
    </div>
  );
}
