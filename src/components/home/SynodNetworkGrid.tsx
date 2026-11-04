import Link from "next/link";
import { ArrowRight, Church } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { SYNOD_SUMMARY } from "@/data/locations";
import { MINISTRY_IMAGES } from "@/data/social-media";
import type { Locale } from "@/lib/utils";
import { MinistryImage } from "@/components/ui/MinistryImage";

/**
 * Verified synod network counter grid. Replaces the legacy homepage's
 * frozen `0, 0, 2, 0` counter widgets with live counts derived from
 * `SYNOD_SUMMARY` (itself derived from the 31-location directory), each
 * card linking to a pre-filtered view of `/[locale]/locations`.
 */
export function SynodNetworkGrid({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold text-navy-900 sm:text-3xl">
            {dict.synods.sectionTitle}
          </h2>
          <p className="mt-3 text-sm text-slate-600 sm:text-base">{dict.synods.sectionSubtitle}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SYNOD_SUMMARY.map((entry) => (
            <Link
              key={entry.synod}
              href={`/${locale}/locations?synod=${encodeURIComponent(entry.synod)}`}
              className="group flex flex-col rounded-2xl border border-slate-200 p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {entry.synod === "East Showa" ? (
                <MinistryImage
                  src={MINISTRY_IMAGES.eastShowaSynodBadge}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded object-cover"
                />
              ) : (
                <Church className="h-6 w-6 text-amber-600" aria-hidden="true" />
              )}
              <p className="mt-4 font-display text-3xl font-bold text-navy-900">
                {entry.branchCount}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {dict.synods.branchesLabel}
              </p>
              <p className="mt-3 text-sm font-semibold text-navy-800">
                {locale === "am" ? entry.labelAm : entry.labelEn}
              </p>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-500">
                {locale === "am" ? entry.noteAm : entry.noteEn}
              </p>
              <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-700 group-hover:underline">
                {dict.synods.viewDirectory}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
