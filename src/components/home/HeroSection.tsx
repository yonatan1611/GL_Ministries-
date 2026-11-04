"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { MINISTRY_IMAGES } from "@/data/social-media";
import type { Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";
import { usePrayerModal } from "@/components/providers/AppProviders";

const AUTO_ADVANCE_MS = 7000;

/**
 * Full-bleed, stage-lit 2-slide hero carousel modeled on bennyhinn.org's
 * television-broadcast slider: a main ministry hero (portrait + stacked
 * blue/white headline) and a "Special Announcement" live-service card,
 * both carrying the same two signature CTAs — Prayer Requests and
 * Donate Now.
 */
export function HeroSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { openPrayerModal } = usePrayerModal();
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = 2;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % totalSlides);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  function goTo(index: number) {
    setActiveSlide(((index % totalSlides) + totalSlides) % totalSlides);
  }

  const PrayerButton = (
    <button
      type="button"
      onClick={openPrayerModal}
      className="rounded border border-blue-400/50 bg-brand-logo-gradient px-8 py-4 font-nav text-sm font-extrabold uppercase tracking-wider text-white shadow-lg hover:brightness-110"
    >
      {dict.hero.ctaSecondary}
    </button>
  );

  const DonateButton = (
    <Link
      href={`/${locale}/give`}
      className="rounded border border-red-400/40 bg-bh-crimson-gradient px-8 py-4 font-nav text-sm font-extrabold uppercase tracking-wider text-white shadow-lg hover:brightness-110"
    >
      {dict.hero.ctaPrimary}
    </Link>
  );

  return (
    <section className="relative min-h-[540px] overflow-hidden bg-navy-950 lg:min-h-[620px]">
      {/* Slide 1: Main Ministry Hero */}
      <div
        aria-hidden={activeSlide !== 0}
        className={cn(
          "absolute inset-0 transition-opacity duration-700",
          activeSlide === 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <MinistryImage
          src={MINISTRY_IMAGES.sanctuaryWorshipChoir}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-bh-stage-radial" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center gap-8 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {dict.hero.headlineLine1}
              <br />
              <span className="font-display italic text-blue-400">{dict.hero.headlineLine2Gold}</span>
              <br />
              {dict.hero.headlineLine3}
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg lg:mx-0">
              {dict.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              {PrayerButton}
              {DonateButton}
            </div>
          </div>

          <div className="relative h-56 w-56 shrink-0 overflow-hidden rounded-full border-4 border-blue-600/60 shadow-2xl sm:h-72 sm:w-72">
            <MinistryImage
              src={MINISTRY_IMAGES.apostleDanielPortrait}
              alt="Apostle Daniel Makonnen"
              fill
              sizes="288px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Slide 2: Special Announcement */}
      <div
        aria-hidden={activeSlide !== 1}
        className={cn(
          "absolute inset-0 flex items-center transition-opacity duration-700",
          activeSlide === 1 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <MinistryImage
          src={MINISTRY_IMAGES.crusadeRevivalGathering}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-bh-stage-radial" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="rounded-full bg-brand-logo-gradient px-5 py-1.5 font-nav text-xs font-extrabold uppercase tracking-[0.2em] text-white shadow">
            {dict.hero.slide2Badge}
          </span>
          <h2 className="mt-6 font-display text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            {dict.hero.slide2Title}
          </h2>
          <p className="mt-4 text-sm font-semibold text-amber-300 sm:text-base">{dict.hero.slide2Subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {PrayerButton}
            {DonateButton}
            <Link
              href={`/${locale}/sermons#live`}
              className="flex items-center gap-2 rounded border border-navy-600 px-6 py-4 font-nav text-sm font-extrabold uppercase tracking-wider text-white hover:bg-navy-900"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              {dict.hero.watchLive}
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel controls */}
      <button
        type="button"
        onClick={() => goTo(activeSlide - 1)}
        aria-label={dict.hero.prevSlideAria}
        className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy-950/50 text-amber-300 hover:bg-navy-950/80 sm:left-4"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => goTo(activeSlide + 1)}
        aria-label={dict.hero.nextSlideAria}
        className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy-950/50 text-amber-300 hover:bg-navy-950/80 sm:right-4"
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={dict.hero.slideAriaTemplate.replace("{n}", String(index + 1)).replace("{total}", String(totalSlides))}
            aria-current={activeSlide === index ? "true" : undefined}
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-colors",
              activeSlide === index ? "bg-blue-600" : "bg-white/40 hover:bg-white/70"
            )}
          />
        ))}
      </div>
    </section>
  );
}
