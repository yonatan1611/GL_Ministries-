"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Heart, Mail, Phone, Radio } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { HQ_EMAIL, HQ_PHONE, DC_EMAIL, DC_PHONE } from "@/data/locations";
import { SOCIAL_LINKS } from "@/data/social-media";
import type { Locale } from "@/lib/utils";
import { FacebookIcon, InstagramIcon, TikTokIcon, XIcon, YoutubeIcon } from "@/components/ui/BrandIcons";
import { YoutubeChannelCards } from "@/components/ui/YoutubeChannelCards";

/**
 * 4-column dark charcoal footer in Gospel Light's own logo colors —
 * About, Media, Keep in Touch, Connect & Give — plus a floating
 * "Go to Top" royal-navy/blue square button. Replaces the legacy
 * site's footer widget bloat with one authoritative, accurate footer:
 * real addresses, the corrected `dc@glministries.org` domain, and a
 * single clean set of legal links.
 */
export function Footer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const year = new Date().getFullYear();
  const [showGoToTop, setShowGoToTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowGoToTop(window.scrollY > 480);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const socialIcons = [
    { href: SOCIAL_LINKS.youtubeChannelUrl, label: dict.footer.socialYoutube, Icon: YoutubeIcon },
    { href: SOCIAL_LINKS.facebookLiveUrl, label: dict.footer.socialFacebook, Icon: FacebookIcon },
    { href: SOCIAL_LINKS.tiktokUrl, label: dict.footer.socialTiktok, Icon: TikTokIcon },
    { href: SOCIAL_LINKS.instagramUrl, label: dict.footer.socialInstagram, Icon: InstagramIcon },
    { href: SOCIAL_LINKS.xTwitterUrl, label: dict.footer.socialX, Icon: XIcon },
  ];

  return (
    <footer className="border-t-4 border-[#1E40AF] bg-navy-950 pb-20 text-navy-200 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Image
            src="/brand/glm-logo.jpg"
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="font-crest text-base font-bold tracking-wide text-white">{dict.brand.name}</p>
            <p className="text-xs text-navy-400">{dict.brand.tagline}</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-navy-300">{dict.footer.missionStatement}</p>

        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <p className="border-b border-navy-800 pb-2 font-crest text-sm font-bold uppercase tracking-widest text-blue-400">
              {dict.footer.colAbout}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li>
                <Link href={`/${locale}/about#apostle-daniel`} className="hover:text-amber-400">
                  {dict.about.navApostle}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about#pastor-aberham`} className="hover:text-amber-400">
                  {dict.about.navPastor}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#todays-scripture`} className="hover:text-amber-400">
                  {dict.nav.todaysScripture}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#salvation`} className="hover:text-amber-400">
                  {dict.nav.faithWalk}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/books`} className="hover:text-amber-400">
                  {dict.nav.products} / {dict.nav.books}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/locations`} className="hover:text-amber-400">
                  {dict.nav.locations}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Media */}
          <div>
            <p className="border-b border-navy-800 pb-2 font-crest text-sm font-bold uppercase tracking-widest text-blue-400">
              {dict.footer.colMedia}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li>
                <Link href={`/${locale}/sermons#live`} className="flex items-center gap-1.5 hover:text-amber-400">
                  <Radio className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {dict.footer.waysToWatchLabel}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/sermons`} className="hover:text-amber-400">
                  {dict.footer.vodLabel}
                </Link>
              </li>
              <li>
                <a href={SOCIAL_LINKS.youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">
                  {dict.footer.youtubeChannelLabel}
                </a>
              </li>
              <li>
                <a href={SOCIAL_LINKS.facebookLiveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">
                  {dict.footer.facebookLiveLabel}
                </a>
              </li>
              <li>
                <a href={SOCIAL_LINKS.telegramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400">
                  {dict.footer.telegramChannelLabel}
                </a>
              </li>
            </ul>
            <YoutubeChannelCards locale={locale} className="mt-4 flex flex-col gap-2 border-t border-navy-800 pt-4" />
          </div>

          {/* Column 3: Keep in Touch */}
          <div>
            <p className="border-b border-navy-800 pb-2 font-crest text-sm font-bold uppercase tracking-widest text-blue-400">
              {dict.footer.colKeepInTouch}
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li>
                <Link href={`/${locale}/about#vision`} className="hover:text-amber-400">
                  {dict.footer.discipleshipLabel}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#global-prayer-army`} className="hover:text-amber-400">
                  {dict.nav.prayerArmy}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/give#partnership`} className="hover:text-amber-400">
                  {dict.footer.partnerConnectLabel}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#stay-connected`} className="hover:text-amber-400">
                  {dict.footer.enewsletterLabel}
                </Link>
              </li>
            </ul>
            <div className="mt-4 border-t border-navy-800 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
                {dict.footer.emailUsLabel}
              </p>
              <address className="mt-2 flex flex-col gap-1.5 text-sm not-italic">
                <a href={`mailto:${HQ_EMAIL}`} className="flex items-center gap-2 hover:text-amber-400">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                  {HQ_EMAIL}
                </a>
                <a href={`mailto:${DC_EMAIL}`} className="flex items-center gap-2 hover:text-amber-400">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                  {DC_EMAIL}
                </a>
                <span className="flex items-center gap-2 text-navy-400">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                  {HQ_PHONE} · {DC_PHONE}
                </span>
              </address>
            </div>
          </div>

          {/* Column 4: Connect & Give */}
          <div>
            <p className="border-b border-navy-800 pb-2 font-crest text-sm font-bold uppercase tracking-widest text-blue-400">
              {dict.footer.colGiveSocials}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/${locale}/give`}
                className="flex items-center justify-center gap-1.5 rounded bg-bh-crimson-gradient px-4 py-2.5 font-nav text-xs font-bold uppercase tracking-wide text-white hover:brightness-110"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                {dict.buttons.donateNow}
              </Link>
              <a
                href={SOCIAL_LINKS.tithelyGivingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-navy-700 px-4 py-2.5 text-center text-xs font-semibold text-navy-200 hover:bg-navy-900"
              >
                {dict.footer.tithelyCta}
              </a>
            </div>

            <div className="mt-5 flex items-center gap-3">
              {socialIcons.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-700 text-navy-300 hover:border-amber-500 hover:text-amber-400"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom legal bar */}
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-navy-800 pt-6 text-xs text-navy-500 sm:flex-row sm:justify-between">
          <p>
            {dict.footer.updatedLabel} • © {year} {dict.footer.rightsReserved}
          </p>
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/legal/privacy`} className="hover:text-amber-400">
              {dict.footer.privacyPolicy}
            </Link>
            <Link href={`/${locale}/legal/terms`} className="hover:text-amber-400">
              {dict.footer.termsOfUse}
            </Link>
            <Link href={`/${locale}#stay-connected`} className="hover:text-amber-400">
              {dict.topBar.contactLabel}
            </Link>
            <Link href={`/${locale}/admin`} className="text-navy-700 hover:text-amber-400">
              {dict.admin.footerLinkLabel}
            </Link>
          </div>
        </div>
      </div>

      {showGoToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={dict.footer.goToTopAria}
          className="fixed bottom-20 right-4 z-30 flex h-11 w-11 touch-manipulation items-center justify-center border border-blue-400/40 bg-[#1B365D] text-white shadow-lg transition-transform hover:bg-[#1E40AF] active:scale-[0.98] lg:bottom-6 lg:right-6 lg:h-10 lg:w-10"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </footer>
  );
}
