"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Mail, Phone, Search, ShoppingBag, X } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { HQ_PHONE, HQ_EMAIL, DC_PHONE, DC_EMAIL } from "@/data/locations";
import { resolveSiteSearchHref } from "@/lib/siteSearch";
import { swapLocaleInPathname, type Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/AppProviders";

/**
 * Tier 1 of the bennyhinn.org-style 2-tier header: a slim dark/royal-blue
 * utility strip carrying the ministry motto, office quick-contact, and
 * the Contact / Donate / Products / Cart / Search / Language actions
 * that sit above the main `Navbar` crest + menu (Tier 2).
 */
export function TopUtilityBar({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname() ?? `/${locale}`;
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(resolveSiteSearchHref(locale, searchQuery));
    setIsSearchOpen(false);
    setSearchQuery("");
  }

  return (
    <div className="border-b border-blue-600/40 bg-navy-950 text-xs text-navy-100">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-1.5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          <span className="hidden font-display italic text-blue-200 md:inline">{dict.topBar.motto}</span>
          <span className="flex items-center gap-1.5 text-navy-200">
            <Phone className="h-3 w-3 text-amber-500" aria-hidden="true" />
            <span className="font-semibold text-navy-300">{dict.topBar.usPrefix}</span>
            {DC_PHONE}
          </span>
          <a
            href={`mailto:${DC_EMAIL}`}
            className="hidden items-center gap-1.5 text-navy-200 hover:text-amber-400 lg:flex"
          >
            <Mail className="h-3 w-3 text-amber-500" aria-hidden="true" />
            {DC_EMAIL}
          </a>
          <span className="hidden items-center gap-1.5 text-navy-200 sm:flex">
            <Phone className="h-3 w-3 text-amber-500" aria-hidden="true" />
            <span className="font-semibold text-navy-300">{dict.topBar.hqPrefix}</span>
            {HQ_PHONE}
          </span>
          <a
            href={`mailto:${HQ_EMAIL}`}
            className="hidden items-center gap-1.5 text-navy-200 hover:text-amber-400 lg:flex"
          >
            <Mail className="h-3 w-3 text-amber-500" aria-hidden="true" />
            {HQ_EMAIL}
          </a>
        </div>

        <div className="flex items-center gap-3">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.nav.searchPlaceholder}
                aria-label={dict.nav.searchAria}
                className="w-40 rounded border border-navy-700 bg-navy-900 px-2 py-1 text-xs text-white placeholder:text-navy-400 focus:border-amber-500 focus:outline-none sm:w-56"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                aria-label={dict.buttons.close}
                className="flex h-6 w-6 items-center justify-center text-navy-300 hover:text-amber-400"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <>
              <Link
                href={`/${locale}#stay-connected`}
                className="font-nav font-bold uppercase tracking-[0.12em] text-navy-200 hover:text-amber-400"
              >
                {dict.topBar.contactLabel}
              </Link>
              <Link
                href={`/${locale}/give`}
                className="rounded bg-crimson-600 px-3 py-1 font-nav font-bold uppercase tracking-[0.1em] text-white hover:bg-crimson-700"
              >
                {dict.topBar.donateLabel}
              </Link>
              <Link
                href={`/${locale}/books`}
                className="hidden font-nav font-bold uppercase tracking-[0.12em] text-navy-200 hover:text-amber-400 sm:inline"
              >
                {dict.topBar.productsLabel}
              </Link>
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={dict.cart.openAria}
                className="relative flex items-center text-navy-200 hover:text-amber-400"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                {totalItems > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-crimson-600 px-1 text-[10px] font-bold text-white"
                  >
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label={dict.nav.searchAria}
                className="flex items-center text-navy-200 hover:text-amber-400"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}

          <div
            className="flex items-center gap-0.5 rounded border border-navy-700 p-0.5"
            role="group"
            aria-label={dict.a11y.languageSwitcher}
          >
            <Link
              href={swapLocaleInPathname(pathname, "en")}
              aria-current={locale === "en" ? "true" : undefined}
              className={cn(
                "rounded px-2 py-0.5 font-nav font-bold transition-colors",
                locale === "en" ? "bg-amber-600 text-navy-950" : "text-navy-300 hover:text-white"
              )}
            >
              EN
            </Link>
            <Link
              href={swapLocaleInPathname(pathname, "am")}
              aria-current={locale === "am" ? "true" : undefined}
              className={cn(
                "rounded px-2 py-0.5 font-nav font-bold transition-colors",
                locale === "am" ? "bg-amber-600 text-navy-950" : "text-navy-300 hover:text-white"
              )}
            >
              አማርኛ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
