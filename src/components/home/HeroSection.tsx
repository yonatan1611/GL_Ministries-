"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { MINISTRY_VIDEO_IDS } from "@/data/social-media";
import { getYoutubeAutoplayEmbedUrl, getYoutubeBackgroundEmbedUrl } from "@/lib/youtube";
import { cn, type Locale } from "@/lib/utils";
import { VideoModal } from "@/components/ui/VideoModal";
import { HeroBottomInfoStrip } from "@/components/layout/HeroBottomInfoStrip";
import { usePrayerModal } from "@/components/providers/AppProviders";
import { BlurText } from "@/components/react-bits/BlurText";
import { Magnet } from "@/components/react-bits/Magnet";

/** The "Watch Latest Washington, D.C. Service" modal leads with
 *  Gospel Light Church, DC's live service broadcasts, then the
 *  Ethiopia HQ worship video, via YouTube's `playlist` param — so the
 *  modal still surfaces both channels without a second button. */
const WATCH_PLAYLIST_IDS = [
  MINISTRY_VIDEO_IDS.dcHeIsWorthy,
  MINISTRY_VIDEO_IDS.dcSeasonLordLookedUpon,
  MINISTRY_VIDEO_IDS.dcGiveMeThisLivingWater,
  MINISTRY_VIDEO_IDS.worshipChoir,
];
const WATCH_EMBED_URL = `${getYoutubeAutoplayEmbedUrl(MINISTRY_VIDEO_IDS.dcHeIsWorthy)}&playlist=${WATCH_PLAYLIST_IDS.join(",")}`;

/** Full-bleed ambient YouTube loop — the automatic fallback only when
 *  the self-hosted `<video>` fails to load, never on first paint. */
const YOUTUBE_BACKGROUND_URL = `${getYoutubeBackgroundEmbedUrl(MINISTRY_VIDEO_IDS.worshipChoir, [
  MINISTRY_VIDEO_IDS.worshipChoir,
  MINISTRY_VIDEO_IDS.crusadeRevival,
  MINISTRY_VIDEO_IDS.pastoralTime,
])}&iv_load_policy=3&enablejsapi=1&vq=hd1080`;

/** Local, true-HD (1280x720 `maxresdefault`) hero photos (see
 *  `public/images/hero/`) used by the Ken Burns crossfade base layer —
 *  always present, always instant, and never a blurry 480x360
 *  `hqdefault` thumbnail. */
const KEN_BURNS_SLIDES = [
  "/images/hero/hero-hd-1.jpg",
  "/images/hero/hero-hd-2.jpg",
  "/images/hero/hero-hd-3.jpg",
  "/images/hero/hero-hd-4.jpg",
];
const HERO_VIDEO_POSTER = "/images/hero/hero-hd-3.jpg";
const KEN_BURNS_INTERVAL_MS = 6000;

/** Narrowed shape of the non-standard `navigator.connection` Network
 *  Information API (Chromium only) — used only to skip the self-hosted
 *  video on data-saver / very slow connections. */
interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}

/**
 * Calm, cinema-grade Media Hero: the same zero-latency, true-HD
 * background (a local Ken Burns photo crossfade with a self-hosted,
 * muted, real-motion `<video>` loop over it, and an automatic
 * ambient-YouTube fallback if the local clip ever fails to load) as
 * before, kept clearly visible (`opacity-70`) under only a light
 * deep-navy vignette — just enough to keep the overlaid text legible
 * without dimming the worship video into the background, with no
 * WebGL shaders layered on top of it. A single,
 * centered welcome: one quiet pill, one dignified headline (one
 * gentle `BlurText` entrance, no flashing or orbiting effects), a
 * short subtitle, and two calm buttons plus one quiet watch link — the
 * detailed sanctuary/leadership/network content that used to crowd
 * this section now lives in the `HeroBottomInfoStrip` below and the
 * `#visit-dc` section just past the fold.
 */
export function HeroSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { openPrayerModal } = usePrayerModal();
  const [isWatchOpen, setIsWatchOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [allowVideo, setAllowVideo] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showYoutubeFallback, setShowYoutubeFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Advance the Ken Burns photo crossfade every 6s.
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((current) => (current + 1) % KEN_BURNS_SLIDES.length);
    }, KEN_BURNS_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // Skip the self-hosted video loop on data-saver / 2G connections so
  // the photo crossfade alone carries the background.
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    if (connection?.saveData || connection?.effectiveType === "2g" || connection?.effectiveType === "slow-2g") {
      setAllowVideo(false);
    }
    setMounted(true);
  }, []);

  // Fade the local <video> in immediately once mounted (not gated behind
  // a `canplaythrough` event, which may never fire for a cached/short
  // clip) and force playback. React's hydration does not reliably sync
  // the live `muted` DOM property from the server-rendered `muted`
  // attribute, so the browser's "autoplay requires muted" policy can
  // silently reject `.play()` even though `muted` is in the JSX —
  // setting `.muted = true` imperatively first is what actually makes
  // autoplay work.
  useEffect(() => {
    const videoEl = videoRef.current;
    if (allowVideo && !videoFailed && videoEl) {
      videoEl.muted = true;
      const playPromise = videoEl.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay was blocked outright (rare once `.muted` is forced,
          // but can still happen) — fall back to the ambient YouTube
          // stream rather than leaving the poster frame on screen.
          setShowYoutubeFallback(true);
        });
      }
    }
  }, [allowVideo, videoFailed]);

  // Once the self-hosted video is actually up and playing, it should
  // fully replace the Ken Burns photo crossfade underneath — not sit
  // blended on top of it.
  const videoActive = allowVideo && !videoFailed && mounted;

  return (
    <section className="relative overflow-hidden bg-[#091528] text-white">
      {/* Background media, dimmed to a calm, reverent backdrop */}
      <div className="absolute inset-0">
        {/* Layer 1: instant local Ken Burns photo crossfade — fades
            fully out once the self-hosted video takes over, instead of
            staying blended underneath it. */}
        <div
          className={cn(
            "absolute inset-0 opacity-70 transition-opacity duration-1000",
            videoActive ? "opacity-0" : "opacity-70"
          )}
        >
          {KEN_BURNS_SLIDES.map((src, index) => (
            <div
              key={src}
              aria-hidden="true"
              className={cn(
                "absolute inset-0 transition-opacity duration-[1500ms]",
                index === slideIndex ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="100vw"
                priority={index === 0}
                className="animate-hero-ken-burns object-cover"
              />
            </div>
          ))}
        </div>

        {/* Layer 2: self-hosted HD video loop, kept clearly visible
            (opacity-70) rather than dimmed into an atmospheric blur. */}
        {allowVideo && !videoFailed && (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_VIDEO_POSTER}
            onError={() => {
              setVideoFailed(true);
              setShowYoutubeFallback(true);
            }}
            className={cn(
              "absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity duration-1000",
              mounted ? "opacity-70" : "opacity-0"
            )}
          >
            <source src="/videos/hero-worship-loop.webm" type="video/webm" />
            <source src="/videos/hero-worship-loop.mp4" type="video/mp4" />
          </video>
        )}

        {/* Layer 2b: full-bleed ambient YouTube stream — only when the
            local clip fails to load. Cropped to a true "object-fit:
            cover" via the oversized width/min-height trick below,
            hiding YouTube's own letterboxing at any viewport size. */}
        {showYoutubeFallback && (
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <iframe
              src={YOUTUBE_BACKGROUND_URL}
              title={dict.hero.watchModalTitle}
              tabIndex={-1}
              allow="autoplay; encrypted-media"
              className="pointer-events-none absolute left-1/2 top-1/2 w-[177.77vh] min-w-full min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 opacity-70"
            />
          </div>
        )}

        {/* Soft, deep-navy vignette — just enough at the top and
            bottom to keep the pill/headline and bottom strip legible,
            while staying light in the middle so the worship video
            itself stays clearly visible. */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#091528]/55 via-[#091528]/20 to-[#091528]/70" />
      </div>

      {/* Centered, open, sanctuary-style welcome */}
      <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center px-4 py-20 text-center sm:py-28 lg:py-36">
        <span className="mb-6 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200 backdrop-blur-md">
          {dict.hero.badge}
        </span>

        <h1 className="mb-6 font-display text-3xl font-bold leading-[1.18] tracking-tight text-white sm:text-5xl lg:text-6xl">
          <BlurText text={dict.hero.headline} animateBy="words" direction="top" delay={60} duration={0.8} />
        </h1>

        <p className="mb-10 max-w-2xl text-base font-normal leading-relaxed text-slate-200/90 sm:text-xl">
          {dict.hero.subtitle}
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Magnet padding={40} magnetStrength={3} className="w-full sm:w-auto">
            <button
              type="button"
              onClick={openPrayerModal}
              className="flex w-full min-w-[200px] touch-manipulation items-center justify-center rounded-xl bg-[#2563EB] px-8 py-4 font-semibold text-white shadow-lg transition hover:bg-[#1D4ED8] active:scale-[0.98] sm:w-auto"
            >
              {dict.hero.ctaSecondary}
            </button>
          </Magnet>
          <Magnet padding={40} magnetStrength={3} className="w-full sm:w-auto">
            <Link
              href={`/${locale}/give`}
              className="flex w-full min-w-[200px] touch-manipulation items-center justify-center rounded-xl border border-white/30 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 active:scale-[0.98] sm:w-auto"
            >
              {dict.hero.ctaPrimary}
            </Link>
          </Magnet>
        </div>

        <button
          type="button"
          onClick={() => setIsWatchOpen(true)}
          className="mt-5 inline-flex items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
        >
          <PlayCircle className="h-4 w-4" aria-hidden="true" />
          {dict.hero.ctaWatch}
        </button>
      </div>

      <HeroBottomInfoStrip locale={locale} />

      <VideoModal
        isOpen={isWatchOpen}
        onClose={() => setIsWatchOpen(false)}
        title={dict.hero.watchModalTitle}
        closeLabel={dict.hero.closeVideoAria}
        embedUrl={WATCH_EMBED_URL}
      />
    </section>
  );
}
