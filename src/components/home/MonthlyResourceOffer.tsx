import Link from "next/link";
import { BookOpen, Check, Gift } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { listBooks } from "@/lib/db";
import type { Locale } from "@/lib/utils";
import { BookCoverImage } from "@/components/books/BookCoverImage";
import { Aurora } from "@/components/react-bits/Aurora";
import { ShinyText } from "@/components/react-bits/ShinyText";
import { TiltedCard } from "@/components/react-bits/TiltedCard";
import { Magnet } from "@/components/react-bits/Magnet";
import { SplitText } from "@/components/react-bits/SplitText";

/**
 * Full-bleed theatrical Monthly Partner Resource Offer showcase, styled
 * after bennyhinn.org's "Intimate Moments... / Get the Offer" banner: a
 * dark charcoal-and-blue stage with a glowing spotlight behind the
 * featured book cover. Surfaces whichever live catalog entry is
 * flagged `isMonthlySpecialOffer` (editable from the Admin Portal)
 * rather than hardcoding the title. No client hooks of its own — the
 * animated children (Aurora, TiltedCard, Magnet, ShinyText, SplitText)
 * are each their own "use client" island, so this can stay a plain
 * async Server Component and read the database directly.
 */
export async function MonthlyResourceOffer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  const books = await listBooks();
  const found = books.find((book) => book.isMonthlySpecialOffer);
  if (!found) return null;
  const offerBook = found;

  const title = locale === "am" ? offerBook.titleAm : offerBook.titleEn;

  return (
    <section className="relative overflow-hidden bg-navy-950 px-4 py-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-bh-stage-radial" />
      <Aurora
        className="absolute inset-0 opacity-35 mix-blend-screen"
        colorStops={["#091528", "#1B365D", "#2563EB", "#1E40AF"]}
        amplitude={1.1}
        blend={0.55}
        speed={0.6}
      />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10 sm:flex-row">
        <TiltedCard rotateAmplitude={10} scaleOnHover={1.04} className="relative h-72 w-52 shrink-0">
          <div className="absolute inset-0 scale-125 rounded-full bg-amber-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative h-full w-full -rotate-3 overflow-hidden rounded-xl border border-amber-500/50 shadow-2xl">
            {offerBook.coverImageUrl ? (
              <BookCoverImage src={offerBook.coverImageUrl} alt={title} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-800 to-navy-950">
                <BookOpen className="h-10 w-10 text-amber-300" aria-hidden="true" />
              </div>
            )}
          </div>
        </TiltedCard>

        <div className="flex-1 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/60 px-3 py-1 font-nav text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            <Gift className="h-3.5 w-3.5" aria-hidden="true" />
            <ShinyText text={dict.monthlyOffer.badge} speed={3} baseColor="rgba(251, 191, 36, 0.85)" shineColor="rgba(255, 255, 255, 0.95)" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
            <SplitText text={dict.monthlyOffer.title} animateBy="words" as="span" />
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-200">{dict.monthlyOffer.body}</p>

          <ul className="mt-5 flex flex-col gap-2 text-sm text-navy-100 sm:items-start">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              {dict.monthlyOffer.bulletDigital}
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
              {dict.monthlyOffer.bulletPhysical}
            </li>
          </ul>

          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
            <Magnet padding={40} magnetStrength={3}>
              <Link
                href={`/${locale}/give?offer=${offerBook.slug}#partnership`}
                className="block rounded border border-blue-400/50 bg-brand-logo-gradient px-6 py-3 font-nav text-sm font-extrabold uppercase tracking-wider text-white shadow-lg hover:brightness-110"
              >
                {dict.monthlyOffer.claimCta}
              </Link>
            </Magnet>
            <Link
              href={`/${locale}/books`}
              className="rounded border border-navy-600 px-6 py-3 font-nav text-sm font-bold uppercase tracking-wider text-white hover:bg-navy-900"
            >
              {dict.monthlyOffer.exploreBookPackCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
