import Link from "next/link";
import { Globe2, MapPin, Clock } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";

const DC_SANCTUARY_ADDRESS = "2401 Virginia Ave NW, Washington, DC 20037";

/**
 * A single, calm, translucent bar along the Hero's bottom edge —
 * replaces the old crowded side-card with 3 scannable, bilingual
 * items (sanctuary address, worship schedule, global family) instead
 * of a wall of leadership photos, two office addresses, and 32 synod
 * pills crammed above the fold. All of that detail still lives one
 * scroll down in the `#visit-dc` section and on `/locations` — this
 * strip's two links jump straight there.
 */
export function HeroBottomInfoStrip({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <div className="relative z-10 w-full border-t border-white/10 bg-[#091528]/80 px-4 py-4 backdrop-blur-md sm:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 text-center text-xs text-slate-200 sm:text-sm md:grid-cols-3 md:text-left">
        <div className="flex items-center justify-center gap-2 md:justify-start">
          <MapPin className="h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
          <p>
            <span className="font-semibold text-white">{dict.heroStrip.sanctuaryLabel}:</span>{" "}
            {DC_SANCTUARY_ADDRESS}{" "}
            <Link href={`/${locale}#visit-dc`} className="font-semibold text-blue-300 hover:text-blue-200">
              {dict.heroStrip.planVisitCta} ↓
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
          <p>
            <span className="font-semibold text-white">{dict.heroStrip.scheduleLabel}:</span>{" "}
            {dict.schedule.dcSunday} • {dict.schedule.dcWednesday}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 md:justify-end">
          <Globe2 className="h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
          <p>
            <span className="font-semibold text-white">{dict.heroStrip.globalLabel}:</span>{" "}
            {dict.heroStrip.globalValue}{" "}
            <Link href={`/${locale}/locations`} className="font-semibold text-blue-300 hover:text-blue-200">
              {dict.heroStrip.exploreLocationsCta} →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
