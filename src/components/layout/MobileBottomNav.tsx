"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HandHeart, Home, MapPin, PlayCircle, Wallet } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { DC_PHONE } from "@/data/locations";
import { cn, type Locale } from "@/lib/utils";
import { usePrayerModal } from "@/components/providers/AppProviders";

/**
 * Native-app-style sticky bottom action bar, visible only below `lg` —
 * one thumb-reach away from the five things a one-handed mobile visitor
 * most often needs. Rendered once in `[locale]/layout.tsx`, same pattern
 * as the Cart Drawer and Global Prayer Modal.
 */
export function MobileBottomNav({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname() ?? `/${locale}`;
  const { openPrayerModal } = usePrayerModal();

  const isHome = pathname === `/${locale}`;
  const isWatch = pathname.startsWith(`/${locale}/sermons`);

  return (
    <nav
      aria-label={dict.mobileNav.home}
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-blue-500/30 bg-[#091528]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.35)] backdrop-blur-md lg:hidden"
    >
      <Link
        href={`/${locale}`}
        aria-current={isHome ? "page" : undefined}
        className={cn(
          "flex min-h-[48px] min-w-[44px] flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 py-1.5 font-nav text-[10px] font-bold uppercase tracking-wide transition-transform active:scale-[0.98]",
          isHome ? "text-blue-300" : "text-white/70"
        )}
      >
        <Home className="h-5 w-5" aria-hidden="true" />
        {dict.mobileNav.home}
      </Link>

      <Link
        href={`/${locale}/sermons`}
        aria-current={isWatch ? "page" : undefined}
        className={cn(
          "flex min-h-[48px] min-w-[44px] flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 py-1.5 font-nav text-[10px] font-bold uppercase tracking-wide transition-transform active:scale-[0.98]",
          isWatch ? "text-blue-300" : "text-white/70"
        )}
      >
        <span className="relative">
          <PlayCircle className="h-5 w-5" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse rounded-full bg-red-500"
          />
        </span>
        {dict.mobileNav.watch}
      </Link>

      <button
        type="button"
        onClick={openPrayerModal}
        className="flex min-h-[48px] min-w-[44px] flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 py-1.5 font-nav text-[10px] font-bold uppercase tracking-wide text-white/70 transition-transform active:scale-[0.98]"
      >
        <HandHeart className="h-5 w-5" aria-hidden="true" />
        {dict.mobileNav.prayer}
      </button>

      <Link
        href={`/${locale}#visit-dc`}
        className="flex min-h-[48px] min-w-[44px] flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 py-1.5 font-nav text-[10px] font-bold uppercase tracking-wide text-white/70 transition-transform active:scale-[0.98]"
      >
        <MapPin className="h-5 w-5" aria-hidden="true" />
        {dict.mobileNav.visit}
      </Link>

      <Link
        href={`/${locale}/give`}
        className="flex min-h-[48px] min-w-[44px] flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 bg-crimson-600 py-1.5 font-nav text-[10px] font-bold uppercase tracking-wide text-white transition-transform active:scale-[0.98]"
      >
        <Wallet className="h-5 w-5" aria-hidden="true" />
        {dict.mobileNav.give}
      </Link>
    </nav>
  );
}

/** Direct-dial link for the Washington, D.C. sanctuary, reused by the
 *  mobile drawer's "tap to call" card. */
export const DC_TEL_HREF = `tel:${DC_PHONE}`;
