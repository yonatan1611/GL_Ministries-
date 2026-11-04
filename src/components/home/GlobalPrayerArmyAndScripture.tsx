"use client";

import { useMemo, useState } from "react";
import { BookOpen, Check, Copy, HeartHandshake } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { DAILY_DEVOTIONALS } from "@/data/ministry-content";
import { cn, type Locale } from "@/lib/utils";
import { useToast } from "@/components/providers/AppProviders";
import { PrayerRequestForm } from "@/components/prayer/PrayerRequestForm";

/** Picks today's devotional by weekday if one is scheduled for today's
 *  date, otherwise falls back to the first entry in the series. */
function getTodaysDevotionalId(): string {
  const todayIso = new Date().toISOString().slice(0, 10);
  const match = DAILY_DEVOTIONALS.find((devotional) => devotional.date === todayIso);
  // DAILY_DEVOTIONALS is a static, non-empty 7-entry series (see
  // src/data/ministry-content.ts) — the fallback index is always defined.
  return (match ?? DAILY_DEVOTIONALS[0]!).id;
}

/**
 * Two-panel section modeled on bennyhinn.org's "Today's Key Scripture /
 * A Prayer for Today" and "Take Your Place — Global Prayer Army" (GPA)
 * blocks: a Daily Scripture devotional selector on the left
 * (`id="todays-scripture"`) and the Global Prayer Army enrollment form
 * on the right (`id="global-prayer-army"`).
 */
export function GlobalPrayerArmyAndScripture({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { showToast } = useToast();
  const [activeId, setActiveId] = useState<string>(getTodaysDevotionalId());
  const [isPrayerConfirmed, setIsPrayerConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const active = useMemo(
    () => DAILY_DEVOTIONALS.find((devotional) => devotional.id === activeId) ?? DAILY_DEVOTIONALS[0]!,
    [activeId]
  );

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

  const formattedDate = new Date(`${active.date}T00:00:00`).toLocaleDateString(
    locale === "am" ? "am-ET" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left: Today's Key Scripture & A Prayer for Today */}
        <div id="todays-scripture">
          <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            {dict.dailyWord.sectionTitle}
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">{dict.dailyWord.sectionSubtitle}</p>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.dailyWord.selectDayLabel}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {DAILY_DEVOTIONALS.map((devotional, index) => (
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

          <div className="mt-6 border-t-4 border-amber-600 bg-navy-950 p-6 text-white sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-amber-400">
              <span className="font-semibold uppercase tracking-wide">{dict.dailyWord.todayLabel}</span>
              <span>{formattedDate}</span>
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
            {dict.prayerArmySection.sectionTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            {dict.prayerArmySection.sectionSubtitle}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-amber-700">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>
              {dict.dailyWord.todayLabel}: {scriptureRef}
            </span>
          </div>

          <div className="mt-6 border border-[#E6DFD3] bg-white p-6 shadow-md sm:p-7">
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
                onSuccess={() => setIsPrayerConfirmed(true)}
                idPrefix="prayer-army"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
