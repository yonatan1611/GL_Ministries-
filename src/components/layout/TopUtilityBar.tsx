"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, ShoppingBag } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { DC_PHONE } from "@/data/locations";
import { swapLocaleInPathname, type Locale } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/AppProviders";

/**
 * Tier 1 of the 2-tier header: a whisper-quiet utility strip carrying
 * only the D.C. sanctuary quick-contact (left) and Products / Cart /
 * Language (right) — Donate already lives in the main `Navbar` and the
 * Hero, so it isn't repeated here, and Contact/Search move to the main
 * nav rather than crowding this top sliver.
 */
export function TopUtilityBar({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname() ?? `/${locale}`;
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <div className="border-b border-blue-600/30 bg-navy-950 text-[11px] text-slate-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 sm:px-6 lg:px-8">
        <a
          href={`tel:${DC_PHONE}`}
          aria-label={dict.mobileNav.callDcAria}
          className="flex min-h-[28px] min-w-0 items-center gap-1.5 truncate hover:text-amber-400"
        >
          <Phone className="h-3 w-3 shrink-0 text-amber-500" aria-hidden="true" />
          <span className="truncate">
            {dict.topBar.sanctuaryLabel} • {DC_PHONE}
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-3">
          <Link href={`/${locale}/books`} className="hidden hover:text-amber-400 sm:inline">
            {dict.topBar.productsLabel}
          </Link>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label={dict.cart.openAria}
            className="relative flex touch-manipulation items-center hover:text-amber-400"
          >
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
            {totalItems > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-2 -top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-crimson-600 px-1 text-[9px] font-bold text-white"
              >
                {totalItems}
              </span>
            )}
          </button>

          <div
            className="flex items-center gap-0.5 rounded border border-navy-700 p-0.5"
            role="group"
            aria-label={dict.a11y.languageSwitcher}
          >
            <Link
              href={swapLocaleInPathname(pathname, "en")}
              aria-current={locale === "en" ? "true" : undefined}
              className={cn(
                "rounded px-1.5 py-0.5 font-semibold transition-colors",
                locale === "en" ? "bg-amber-600 text-navy-950" : "text-navy-300 hover:text-white"
              )}
            >
              EN
            </Link>
            <Link
              href={swapLocaleInPathname(pathname, "am")}
              aria-current={locale === "am" ? "true" : undefined}
              className={cn(
                "rounded px-1.5 py-0.5 font-semibold transition-colors",
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
