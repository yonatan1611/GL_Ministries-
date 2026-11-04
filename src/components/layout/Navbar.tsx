"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Flame, Heart, Menu, X } from "lucide-react";
import { getDictionary } from "@/data/i18n";
import { cn, type Locale } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

/**
 * Tier 2 of the bennyhinn.org-style header: a crisp white classic bar
 * with a centered royal-navy/blue crest "GOSPEL LIGHT / MINISTRIES
 * INTERNATIONAL" lockup and a clean horizontal menu (Home, About ▾,
 * Events, Ministry & Teaching ▾, Global Prayer Army, Partnership,
 * Give). Dropdowns render as white cards with a solid royal-blue top
 * border, matching the Avada-style dropdowns on bennyhinn.org.
 */
export function Navbar({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const pathname = usePathname() ?? `/${locale}`;
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"about" | "ministry" | null>(null);
  const [mobileOpenGroup, setMobileOpenGroup] = useState<"about" | "ministry" | null>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const ministryRef = useRef<HTMLDivElement>(null);

  const aboutLinks: NavLink[] = [
    { href: `/${locale}/about#apostle-daniel`, label: dict.about.navApostle },
    { href: `/${locale}/about#pastor-aberham`, label: dict.about.navPastor },
    { href: `/${locale}/about#vision`, label: dict.about.navOverview },
    { href: `/${locale}/about#history`, label: dict.about.navHistory },
    { href: `/${locale}/sermons?topic=Holy+Spirit`, label: dict.about.navWorship },
    { href: `/${locale}/sermons?topic=Revival+%26+Repentance`, label: dict.about.navTestimonies },
    { href: `/${locale}/locations`, label: dict.nav.locations },
  ];

  const ministryLinks: NavLink[] = [
    { href: `/${locale}/sermons`, label: dict.nav.vodSermons },
    { href: `/${locale}#todays-scripture`, label: dict.nav.todaysScripture },
    { href: `/${locale}#salvation`, label: dict.nav.faithWalk },
  ];

  const primaryLinks: NavLink[] = [
    { href: `/${locale}#upcoming-events`, label: dict.nav.events },
    { href: `/${locale}#global-prayer-army`, label: dict.nav.prayerArmy },
    { href: `/${locale}/give#partnership`, label: dict.nav.partnership },
  ];

  function isActive(href: string) {
    const path = href.split("#")[0] || `/${locale}`;
    if (path === `/${locale}`) return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const isAboutActive = pathname === `/${locale}/about` || pathname.startsWith(`/${locale}/about/`);
  const isMinistryActive = pathname === `/${locale}/sermons` || pathname.startsWith(`/${locale}/sermons/`);

  useEffect(() => {
    setIsMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setIsMobileOpen(false);
      setOpenDropdown(null);
    }
    function onClickOutside(event: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(event.target as Node) && openDropdown === "about") {
        setOpenDropdown(null);
      }
      if (
        ministryRef.current &&
        !ministryRef.current.contains(event.target as Node) &&
        openDropdown === "ministry"
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClickOutside);
    };
  }, [openDropdown]);

  function NavDropdown({
    id,
    label,
    isGroupActive,
    links,
    containerRef,
  }: {
    id: "about" | "ministry";
    label: string;
    isGroupActive: boolean;
    links: NavLink[];
    containerRef: React.RefObject<HTMLDivElement | null>;
  }) {
    const isOpen = openDropdown === id;
    return (
      <div
        ref={containerRef}
        className="relative"
        onMouseEnter={() => setOpenDropdown(id)}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls={`${id}-dropdown-menu`}
          onClick={() => setOpenDropdown((current) => (current === id ? null : id))}
          className={cn(
            "flex items-center gap-1 border-b-[3px] border-transparent py-1 font-nav text-[13px] font-bold uppercase tracking-[0.1em] transition-colors",
            isGroupActive ? "border-amber-600 text-amber-700" : "text-[#222222] hover:border-amber-600 hover:text-amber-700"
          )}
        >
          {label}
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        {isOpen && (
          <div
            id={`${id}-dropdown-menu`}
            role="menu"
            aria-label={label}
            className="absolute left-0 top-full z-50 w-72 border-t-[3px] border-[#1E40AF] bg-white py-2 shadow-lg"
          >
            {links.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                role="menuitem"
                onClick={() => setOpenDropdown(null)}
                className={cn(
                  "block px-4 py-2.5 font-nav text-[13px] font-semibold text-[#222222] hover:bg-amber-50 hover:text-amber-700",
                  index > 0 && "border-t border-[#F0EAE1]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-t-2 border-amber-600 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1B365D] to-[#2563EB] text-white shadow-sm">
            <Flame className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate font-crest text-lg font-bold tracking-[0.15em] text-[#1E1E1E] sm:text-xl">
              {locale === "am" ? dict.brand.name : "GOSPEL LIGHT"}
            </span>
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-700">
              {locale === "am" ? dict.brand.tagline : "MINISTRIES INTERNATIONAL"}
            </span>
          </span>
        </Link>

        <nav aria-label={dict.a11y.primaryNav} className="hidden items-center gap-6 lg:flex">
          <Link
            href={`/${locale}`}
            aria-current={pathname === `/${locale}` ? "page" : undefined}
            className={cn(
              "border-b-[3px] border-transparent py-1 font-nav text-[13px] font-bold uppercase tracking-[0.1em] transition-colors",
              pathname === `/${locale}`
                ? "border-amber-600 text-amber-700"
                : "text-[#222222] hover:border-amber-600 hover:text-amber-700"
            )}
          >
            {dict.nav.home}
          </Link>

          <NavDropdown
            id="about"
            label={dict.nav.about}
            isGroupActive={isAboutActive}
            links={aboutLinks}
            containerRef={aboutRef}
          />

          <Link
            href={primaryLinks[0]!.href}
            aria-current={isActive(primaryLinks[0]!.href) ? "page" : undefined}
            className={cn(
              "border-b-[3px] border-transparent py-1 font-nav text-[13px] font-bold uppercase tracking-[0.1em] transition-colors",
              isActive(primaryLinks[0]!.href)
                ? "border-amber-600 text-amber-700"
                : "text-[#222222] hover:border-amber-600 hover:text-amber-700"
            )}
          >
            {primaryLinks[0]!.label}
          </Link>

          <NavDropdown
            id="ministry"
            label={dict.nav.ministryTeaching}
            isGroupActive={isMinistryActive}
            links={ministryLinks}
            containerRef={ministryRef}
          />

          {primaryLinks.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "border-b-[3px] border-transparent py-1 font-nav text-[13px] font-bold uppercase tracking-[0.1em] transition-colors",
                isActive(link.href)
                  ? "border-amber-600 text-amber-700"
                  : "text-[#222222] hover:border-amber-600 hover:text-amber-700"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={`/${locale}/give`}
            className="hidden items-center gap-1.5 rounded bg-bh-crimson-gradient px-5 py-2.5 font-nav text-xs font-bold uppercase tracking-[0.12em] text-white shadow-sm hover:brightness-110 sm:flex"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {dict.nav.give}
          </Link>

          <button
            type="button"
            aria-expanded={isMobileOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={isMobileOpen ? dict.a11y.closeMenu : dict.a11y.openMenu}
            onClick={() => setIsMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#222222] hover:bg-amber-50 lg:hidden"
          >
            {isMobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <nav
          id="mobile-navigation-menu"
          aria-label={dict.a11y.mobileNav}
          className="border-t border-[#F0EAE1] bg-white px-4 py-3 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href={`/${locale}`}
                className="block rounded-lg px-3 py-2 font-nav text-sm font-bold uppercase tracking-wide text-[#222222] hover:bg-amber-50"
              >
                {dict.nav.home}
              </Link>
            </li>
            <li>
              <button
                type="button"
                aria-expanded={mobileOpenGroup === "about"}
                onClick={() => setMobileOpenGroup((g) => (g === "about" ? null : "about"))}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 font-nav text-sm font-bold uppercase tracking-wide",
                  isAboutActive ? "bg-amber-50 text-amber-700" : "text-[#222222] hover:bg-amber-50"
                )}
              >
                {dict.nav.about}
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", mobileOpenGroup === "about" && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
              {mobileOpenGroup === "about" && (
                <ul className="ml-3 mt-1 flex flex-col gap-1 border-l border-[#F0EAE1] pl-3">
                  {aboutLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="block rounded-lg px-3 py-2 text-sm text-[#3A3A3A] hover:bg-amber-50">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <Link
                href={primaryLinks[0]!.href}
                className="block rounded-lg px-3 py-2 font-nav text-sm font-bold uppercase tracking-wide text-[#222222] hover:bg-amber-50"
              >
                {primaryLinks[0]!.label}
              </Link>
            </li>
            <li>
              <button
                type="button"
                aria-expanded={mobileOpenGroup === "ministry"}
                onClick={() => setMobileOpenGroup((g) => (g === "ministry" ? null : "ministry"))}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 font-nav text-sm font-bold uppercase tracking-wide",
                  isMinistryActive ? "bg-amber-50 text-amber-700" : "text-[#222222] hover:bg-amber-50"
                )}
              >
                {dict.nav.ministryTeaching}
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", mobileOpenGroup === "ministry" && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
              {mobileOpenGroup === "ministry" && (
                <ul className="ml-3 mt-1 flex flex-col gap-1 border-l border-[#F0EAE1] pl-3">
                  {ministryLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="block rounded-lg px-3 py-2 text-sm text-[#3A3A3A] hover:bg-amber-50">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            {primaryLinks.slice(1).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2 font-nav text-sm font-bold uppercase tracking-wide text-[#222222] hover:bg-amber-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <Link
                href={`/${locale}/give`}
                className="flex items-center justify-center gap-1.5 rounded bg-bh-crimson-gradient px-4 py-2.5 font-nav text-sm font-bold uppercase tracking-wide text-white"
              >
                <Heart className="h-4 w-4" aria-hidden="true" />
                {dict.nav.give}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
