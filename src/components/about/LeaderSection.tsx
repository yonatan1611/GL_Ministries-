import type { ReactNode } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import type { Locale } from "@/lib/utils";
import type { LeaderProfile } from "@/types/ministry";
import { MinistryImage } from "@/components/ui/MinistryImage";

interface ExtraInfoRow {
  icon: typeof MapPin;
  text: string;
}

/**
 * Full, dignified leader biography — used for both Apostle Daniel
 * Makonnen (with sermon/book links) and Pastor Aberham Bedasso (with the
 * Washington, D.C. sanctuary + Alexandria admin office addresses).
 * Replaces the legacy site's empty stub page for Pastor Bedasso
 * (`page_id=28597`) and the spelling errors on the Apostle's bio
 * ("Apostel Daniel Makonen", "edifiying", "familly").
 */
export function LeaderSection({
  locale,
  leader,
  extraInfo,
  showSermonsLink,
  showBooksLink,
  secondaryImageUrl,
  secondaryImageAlt,
  scheduleSection,
}: {
  locale: Locale;
  leader: LeaderProfile;
  extraInfo?: ExtraInfoRow[];
  showSermonsLink?: boolean;
  showBooksLink?: boolean;
  /** An additional real photo (e.g. a preaching still) shown alongside
   *  the portrait — omitted when not supplied, never fabricated. */
  secondaryImageUrl?: string;
  secondaryImageAlt?: string;
  scheduleSection?: ReactNode;
}) {
  const dict = getDictionary(locale);
  const bioParagraphs = locale === "am" ? leader.bioParagraphsAm : leader.bioParagraphsEn;
  const highlights = locale === "am" ? leader.highlightsAm : leader.highlightsEn;
  const name = locale === "am" ? leader.nameAm : leader.nameEn;
  const role = locale === "am" ? leader.roleAm : leader.roleEn;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {(leader.portraitUrl || secondaryImageUrl) && (
          <div className="mb-5 grid grid-cols-2 gap-3 sm:max-w-md">
            {leader.portraitUrl && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <MinistryImage
                  src={leader.portraitUrl}
                  alt={name}
                  fill
                  sizes="(min-width: 640px) 14rem, 50vw"
                  className="object-cover"
                />
              </div>
            )}
            {secondaryImageUrl && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <MinistryImage
                  src={secondaryImageUrl}
                  alt={secondaryImageAlt ?? name}
                  fill
                  sizes="(min-width: 640px) 14rem, 50vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        )}
        <h3 className="font-display text-xl font-bold text-navy-900">{name}</h3>
        <p className="mt-1 text-sm font-medium text-amber-700">{role}</p>
        <div className="mt-5 flex flex-col gap-3">
          {bioParagraphs.map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-slate-600">
              {paragraph}
            </p>
          ))}
        </div>

        {(showSermonsLink || showBooksLink) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {showSermonsLink && (
              <Link
                href={`/${locale}/sermons`}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
              >
                {dict.about.viewSermons}
              </Link>
            )}
            {showBooksLink && (
              <Link
                href={`/${locale}/books`}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {dict.about.viewBooks}
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.about.contactTitle}
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            <span className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              {leader.locationBadge}
            </span>
            {extraInfo?.map((row, index) => (
              <span key={index} className="flex items-start gap-2">
                <row.icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
                {row.text}
              </span>
            ))}
            <a href={`tel:${leader.phone}`} className="flex items-center gap-2 hover:text-amber-700">
              <Phone className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              {leader.phone}
            </a>
            <a href={`mailto:${leader.email}`} className="flex items-center gap-2 hover:text-amber-700">
              <Mail className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
              {leader.email}
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {dict.about.bioHighlightsTitle}
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" aria-hidden="true" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {scheduleSection}
      </div>
    </div>
  );
}
