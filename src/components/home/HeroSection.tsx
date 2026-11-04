"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, PlayCircle } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { FACEBOOK_PAGES, MINISTRY_IMAGES, MINISTRY_VIDEO_IDS } from "@/data/social-media";
import { DC_EMAIL, DC_PHONE, SYNOD_SUMMARY } from "@/data/locations";
import { getYoutubeAutoplayEmbedUrl, getYoutubeBackgroundEmbedUrl } from "@/lib/youtube";
import { cn, type Locale } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";
import { VideoModal } from "@/components/ui/VideoModal";
import { usePrayerModal } from "@/components/providers/AppProviders";

type BackgroundMode = "video" | "dc" | "global" | "youtube";

const WATCH_EMBED_URL = getYoutubeAutoplayEmbedUrl(MINISTRY_VIDEO_IDS.worshipChoir);

/** Full-bleed ambient YouTube loop, used only as the automatic fallback
 *  when the self-hosted `<video>` fails to load (or the visitor asks
 *  for it via the "Switch to Live YouTube Stream" pill) — never on
 *  first paint. */
const YOUTUBE_BACKGROUND_URL = `${getYoutubeBackgroundEmbedUrl(MINISTRY_VIDEO_IDS.worshipChoir, [
  MINISTRY_VIDEO_IDS.worshipChoir,
  MINISTRY_VIDEO_IDS.crusadeRevival,
  MINISTRY_VIDEO_IDS.pastoralTime,
])}&iv_load_policy=3&enablejsapi=1&vq=hd1080`;

const DC_SANCTUARY_ADDRESS = "2401 Virginia Ave NW, Washington, DC 20037";
const DC_ADMIN_OFFICE_ADDRESS = "85 South Bragg St, Suite 200, Alexandria, VA 22312";
const DC_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(DC_SANCTUARY_ADDRESS)}`;

const GLOBAL_NETWORK_SYNODS = SYNOD_SUMMARY.filter((entry) => entry.synod !== "USA");

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
 * Cinematic, full-bleed Media Hero with a zero-latency, true-HD
 * background: a local Ken Burns photo crossfade (real 1280x720
 * `maxresdefault` stills, never a blurry 480x360 `hqdefault`
 * thumbnail) renders instantly on frame one, and a self-hosted,
 * muted, real-motion `<video>` loop is visible over it immediately —
 * with an automatic (or visitor-triggered) fallback to a full-bleed,
 * cropped ambient YouTube stream if the local clip ever fails to
 * load. The on-demand "Watch Full Worship & Sermons" modal is the
 * only other place a YouTube iframe appears. A Washington, D.C.-
 * flagship headline with the ministry's three signature CTAs and an
 * interactive leadership + sanctuary-schedule card bridge straight
 * into the 32-branch Ethiopian synod network.
 */
export function HeroSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { openPrayerModal } = usePrayerModal();
  const [background, setBackground] = useState<BackgroundMode>("video");
  const [isWatchOpen, setIsWatchOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [allowVideo, setAllowVideo] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [showYoutubeFallback, setShowYoutubeFallback] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Layer 1: advance the Ken Burns photo crossfade every 6s.
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((current) => (current + 1) % KEN_BURNS_SLIDES.length);
    }, KEN_BURNS_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  // Layer 2: skip the self-hosted video loop on data-saver / 2G
  // connections so the photo crossfade alone carries the background.
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
    if (background === "video" && allowVideo && !videoFailed && videoEl) {
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
  }, [background, allowVideo, videoFailed]);

  const showYoutubeBackground = background === "youtube" || showYoutubeFallback;
  // Once the self-hosted video is actually up and playing, it should
  // fully replace the Ken Burns photo crossfade underneath — not sit
  // blended on top of it.
  const videoActive = background === "video" && allowVideo && !videoFailed && mounted;

  const BACKGROUND_OPTIONS: { mode: BackgroundMode; label: string }[] = [
    { mode: "video", label: dict.hero.mediaSlideWorshipLabel },
    { mode: "dc", label: dict.hero.mediaSlideDcLabel },
    { mode: "global", label: dict.hero.mediaSlideGlobalLabel },
    { mode: "youtube", label: dict.hero.mediaSlideYoutubeLabel },
  ];

  return (
    <section className="relative min-h-[640px] overflow-hidden bg-[#091528] text-white lg:min-h-[720px]">
      {/* Background media */}
      <div className="absolute inset-0">
        {/* Layer 1: instant local Ken Burns photo crossfade — fades
            fully out once the self-hosted video takes over, instead of
            staying blended underneath it. */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            videoActive ? "opacity-0" : "opacity-100"
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

        {/* Layer 2: self-hosted HD video loop — visible immediately
            (not gated behind a `canplaythrough` event, which may never
            fire for a short cached clip) so real motion video is
            guaranteed on first paint instead of a static image. */}
        {background === "video" && allowVideo && !videoFailed && (
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
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
              mounted ? "opacity-100" : "opacity-0"
            )}
          >
            <source src="/videos/hero-worship-loop.webm" type="video/webm" />
            <source src="/videos/hero-worship-loop.mp4" type="video/mp4" />
          </video>
        )}

        {/* Layer 2b: full-bleed ambient YouTube stream — only when the
            visitor explicitly asks for it, or the local video failed
            to load. Cropped to a true "object-fit: cover" via the
            oversized width/min-height trick below, hiding YouTube's
            own letterboxing at any viewport size. */}
        {showYoutubeBackground && (
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <iframe
              src={YOUTUBE_BACKGROUND_URL}
              title={dict.hero.mediaSlideWorshipLabel}
              tabIndex={-1}
              allow="autoplay; encrypted-media"
              className="pointer-events-none absolute left-1/2 top-1/2 w-[177.77vh] min-w-full min-h-[56.25vw] -translate-x-1/2 -translate-y-1/2 opacity-55"
            />
          </div>
        )}

        {background === "dc" && (
          <div className="absolute inset-0">
            <Image
              src="/images/hero/pastor-aberham-dc.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-70"
            />
          </div>
        )}

        {background === "global" && (
          <div className="absolute inset-0">
            <Image
              src="/images/hero/hero-hd-3.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-70"
            />
          </div>
        )}

        {/* Layer 3: Royal Navy stage vignette so the typography and
            sanctuary card stay high-contrast over any backdrop */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#091528]/80 via-[#0F2342]/45 to-[#091528]/35" />
      </div>

      {/* Background mode switcher controls */}
      <div className="absolute bottom-5 right-4 z-10 flex gap-2 sm:right-6 lg:right-8">
        {BACKGROUND_OPTIONS.map((option) => (
          <button
            key={option.mode}
            type="button"
            onClick={() => setBackground(option.mode)}
            aria-pressed={background === option.mode}
            className={cn(
              "rounded-full border px-3 py-1.5 font-nav text-[11px] font-bold uppercase tracking-wider transition-colors",
              background === option.mode
                ? "border-blue-400 bg-blue-600/90 text-white"
                : "border-white/30 bg-black/30 text-white/80 hover:bg-black/50"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8 lg:py-20">
        {/* Left column: headline & CTAs */}
        <div className="max-w-2xl">
          <span className="inline-block rounded-full border border-blue-400/40 bg-blue-600/20 px-4 py-1.5 font-nav text-[11px] font-bold uppercase tracking-[0.15em] text-blue-200">
            {dict.hero.badge}
          </span>

          <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {dict.hero.headlinePrefix}{" "}
            <span className="font-display italic text-blue-400">{dict.hero.headlineAccent}</span>{" "}
            {dict.hero.headlineSuffix}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
            {dict.hero.subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={openPrayerModal}
              className="rounded-lg border border-blue-400/50 bg-brand-logo-gradient px-7 py-4 font-nav text-sm font-extrabold uppercase tracking-wider text-white shadow-xl hover:brightness-110"
            >
              {dict.hero.ctaSecondary}
            </button>
            <Link
              href={`/${locale}/give`}
              className="rounded-lg border border-red-400/40 bg-bh-crimson-gradient px-7 py-4 font-nav text-sm font-extrabold uppercase tracking-wider text-white shadow-xl hover:brightness-110"
            >
              {dict.hero.ctaPrimary}
            </Link>
            <button
              type="button"
              onClick={() => setIsWatchOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-7 py-4 font-nav text-sm font-extrabold uppercase tracking-wider text-white backdrop-blur-md hover:bg-white/20"
            >
              <PlayCircle className="h-5 w-5 animate-pulse text-blue-300" aria-hidden="true" />
              {dict.hero.ctaWatch}
            </button>
          </div>
        </div>

        {/* Right column: Washington, D.C. sanctuary + global network card */}
        <div className="w-full max-w-md rounded-2xl border-2 border-blue-500/40 bg-[#0F2342]/90 p-6 shadow-2xl backdrop-blur-md lg:ml-auto">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-blue-400/60">
                <MinistryImage
                  src={MINISTRY_IMAGES.apostleDanielPortrait}
                  alt="Apostle Daniel Makonnen"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-blue-400/60">
                <MinistryImage
                  src={MINISTRY_IMAGES.pastorAberhamPortrait}
                  alt="Pastor Aberham Bedasso"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/30">
              <MinistryImage
                src={FACEBOOK_PAGES.washingtonDc.pictureUrl}
                alt={FACEBOOK_PAGES.washingtonDc.name}
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-blue-100">
            <span>{dict.hero.cardFounderRole}</span>
            <span>{dict.hero.cardPastorRole}</span>
          </div>

          <div className="mt-5 space-y-3 border-t border-blue-500/30 pt-4 text-sm text-blue-50">
            <div className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                  {dict.hero.cardSanctuaryLabel}
                </p>
                <p className="mt-0.5">{DC_SANCTUARY_ADDRESS}</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                  {dict.hero.cardAdminOfficeLabel}
                </p>
                <p className="mt-0.5">{DC_ADMIN_OFFICE_ADDRESS}</p>
              </div>
            </div>
            <p>{dict.schedule.dcSunday}</p>
            <p>{dict.schedule.dcWednesday}</p>
            <div className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
                  {dict.hero.cardContactLabel}
                </p>
                <p className="mt-0.5">{DC_PHONE}</p>
                <a href={`mailto:${DC_EMAIL}`} className="mt-0.5 flex items-center gap-1.5 hover:underline">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-blue-300" aria-hidden="true" />
                  {DC_EMAIL}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={DC_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-500"
            >
              {dict.hero.cardDirectionsCta}
            </a>
            <Link
              href={`/${locale}#visit-dc`}
              className="rounded-lg border border-blue-400/50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-blue-100 hover:bg-blue-500/20"
            >
              {dict.hero.cardVisitCta}
            </Link>
          </div>

          <div className="mt-5 border-t border-blue-500/30 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">
              {dict.hero.cardNetworkTitle}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {GLOBAL_NETWORK_SYNODS.map((entry) => (
                <Link
                  key={entry.synod}
                  href={`/${locale}/locations?synod=${encodeURIComponent(entry.synod)}`}
                  className="rounded-full border border-blue-400/40 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-100 hover:bg-blue-500/30"
                >
                  {locale === "am" ? entry.labelAm : entry.labelEn} ({entry.branchCount})
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

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
