"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Check, Copy, HeartHandshake, Users } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { cn, type Locale } from "@/lib/utils";
import type { DailyDevotional } from "@/types/ministry";
import { useToast } from "@/components/providers/AppProviders";
import { PrayerRequestForm } from "@/components/prayer/PrayerRequestForm";
import { PrayerWall, type PrayerWallStats } from "@/components/home/PrayerWall";
import { Particles } from "@/components/react-bits/Particles";
import { SplitText } from "@/components/react-bits/SplitText";
import { AnimatedContent } from "@/components/react-bits/AnimatedContent";

/** The entry flagged `isFeaturedToday` (sorted first by the API/db
 *  helper already), falling back to the first entry in the list. */
function getFeaturedId(devotionals: DailyDevotional[]): string | null {
  return devotionals[0]?.id ?? null;
}

/**
 * Two-panel section modeled on bennyhinn.org's "Today's Key Scripture /
 * A Prayer for Today" and "Take Your Place — Global Prayer Army" (GPA)
 * blocks: a Daily Scripture devotional selector on the left
 * (`id="todays-scripture"`) and the Global Prayer Army enrollment form
 * on the right (`id="global-prayer-army"`).
 *
 * `initialDevotionals` is the SSR snapshot from `listDevotionals()` (see
 * `src/app/[locale]/page.tsx`); this component then re-fetches
 * `GET /api/devotionals` on mount so an Admin Portal edit made after
 * the page loaded still shows up without a hard refresh.
 */
export function GlobalPrayerArmyAndScripture({
  locale,
  initialDevotionals,
}: {
  locale: Locale;
  initialDevotionals: DailyDevotional[];
}) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();
  const [devotionals, setDevotionals] = useState<DailyDevotional[]>(initialDevotionals);
  const [activeId, setActiveId] = useState<string | null>(getFeaturedId(initialDevotionals));
  const [isPrayerConfirmed, setIsPrayerConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<PrayerWallStats | null>(null);

  async function refreshStats() {
    try {
      const response = await fetch("/api/prayer");
      const result = await response.json().catch(() => null);
      if (result?.success) setStats(result.data as PrayerWallStats);
    } catch {
      // Live counter is a progressive enhancement — fail silently.
    }
  }

  async function refreshDevotionals() {
    try {
      const response = await fetch("/api/devotionals");
      const result = await response.json().catch(() => null);
      const fresh = result?.success ? (result.data.devotionals as DailyDevotional[]) : null;
      if (fresh && fresh.length > 0) {
        setDevotionals(fresh);
        setActiveId((current) => (current && fresh.some((d) => d.id === current) ? current : getFeaturedId(fresh)));
      }
    } catch {
      // Progressive enhancement over the SSR snapshot — fail silently.
    }
  }

  useEffect(() => {
    refreshStats();
    refreshDevotionals();
  }, []);

  const active = useMemo(
    () => devotionals.find((devotional) => devotional.id === activeId) ?? devotionals[0] ?? null,
    [devotionals, activeId]
  );

  if (!active) return null;

  const verseText = locale === "am" ? active.verseTextAm : active.verseTextEn;
  const scriptureRef = locale === "am" ? active.scriptureRefAm : active.scriptureRefEn;

  async function handleCopyVerse() {
    try {
      await navigator.clipboard.writeText(`${verseText} — ${scriptureRef}`);
      setCopied(true);
      showToast(dict.dailyWord.copiedLabel, "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast(dict.forms.error, "error");
    }
  }

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left: Today's Key Scripture & A Prayer for Today */}
        <div id="todays-scripture">
          <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            <SplitText text={dict.dailyWord.sectionTitle} animateBy="words" as="span" />
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">{dict.dailyWord.sectionSubtitle}</p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.dailyWord.selectDayLabel}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {devotionals.map((devotional, index) => (
              <button
                key={devotional.id}
                type="button"
                onClick={() => setActiveId(devotional.id)}
                aria-pressed={devotional.id === activeId}
                aria-label={locale === "am" ? devotional.titleAm : devotional.titleEn}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  devotional.id === activeId
                    ? "bg-navy-800 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-300 hover:bg-slate-100"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="relative mt-6 overflow-hidden border-t-4 border-amber-600 bg-navy-950 p-6 text-white sm:p-8">
            <Particles
              className="absolute inset-0"
              particleColors={["#60A5FA", "#93C5FD", "#FFFFFF"]}
              particleCount={60}
              speed={0.15}
              moveParticlesOnHover
            />
            <div className="relative flex flex-wrap items-center justify-between gap-2 text-xs text-amber-400">
              <span className="font-semibold uppercase tracking-wide">{dict.dailyWord.todayLabel}</span>
              <span>{active.dateLabel}</span>
            </div>
            <h3 className="mt-4 font-display text-xl font-bold">
              {locale === "am" ? active.titleAm : active.titleEn}
            </h3>
            <p className="mt-1 text-sm font-semibold text-amber-300">{scriptureRef}</p>
            <blockquote className="mt-4 border-l-2 border-amber-500 pl-4 text-base italic leading-relaxed text-navy-100">
              {verseText}
            </blockquote>

            <div className="mt-6 border-t border-navy-800 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">
                {dict.dailyWord.reflectionLabel}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-200">
                {locale === "am" ? active.reflectionAm : active.reflectionEn}
              </p>
            </div>

            <div className="mt-5 rounded-xl bg-navy-900 p-4">
              <p className="text-sm font-medium italic text-amber-200">
                {locale === "am" ? active.prayerDeclarationAm : active.prayerDeclarationEn}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-navy-400">
                {dict.dailyWord.authorLabel} {locale === "am" ? active.authorAm : active.authorEn}
              </p>
              <button
                type="button"
                onClick={handleCopyVerse}
                className="flex items-center gap-1.5 rounded border border-navy-700 px-3 py-2 text-xs font-semibold text-navy-200 hover:bg-navy-900"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {dict.dailyWord.copyVerseCta}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Take Your Place — Global Prayer Army */}
        <div id="global-prayer-army">
          <HeartHandshake className="h-8 w-8 text-amber-600" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            <SplitText text={dict.prayerArmySection.sectionTitle} animateBy="words" as="span" />
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {dict.prayerArmySection.sectionSubtitle}
          </p>
          {stats && stats.totalPrayerArmyMembers > 0 && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
              <Users className="h-4 w-4" aria-hidden="true" />
              {dict.prayerArmySection.memberCountTemplate.replace(
                "{count}",
                stats.totalPrayerArmyMembers.toLocaleString(locale === "am" ? "am-ET" : "en-US")
              )}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-amber-700">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>
              {dict.dailyWord.todayLabel}: {scriptureRef}
            </span>
          </div>

          <AnimatedContent distance={30} duration={0.6} className="mt-6 border border-[#E6DFD3] bg-white p-6 shadow-md sm:p-7">
            {isPrayerConfirmed ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <HeartHandshake className="h-10 w-10 text-emerald-600" aria-hidden="true" />
                <h3 className="font-display text-lg font-bold text-navy-900">
                  {dict.prayerModal.confirmTitle}
                </h3>
                <p className="text-sm text-slate-600">{dict.prayerModal.confirmBody}</p>
                <button
                  type="button"
                  onClick={() => setIsPrayerConfirmed(false)}
                  className="mt-3 w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  {dict.buttons.close}
                </button>
              </div>
            ) : (
              <PrayerRequestForm
                locale={locale}
                onSuccess={() => {
                  setIsPrayerConfirmed(true);
                  refreshStats();
                }}
                idPrefix="prayer-army"
              />
            )}
          </AnimatedContent>

          <PrayerWall locale={locale} stats={stats} />
        </div>
      </div>
    </section>
  );
}
