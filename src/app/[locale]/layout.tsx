import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import { AppProviders } from "@/components/providers/AppProviders";
import { TopUtilityBar } from "@/components/layout/TopUtilityBar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/books/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { GlobalPrayerModal } from "@/components/prayer/GlobalPrayerModal";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import { ClickSpark } from "@/components/react-bits/ClickSpark";
import "../globals.css";

// Every font below is self-hosted (`next/font/local`) rather than
// fetched live via `next/font/google`. The Montserrat fetch started
// intermittently failing Vercel builds first; Noto Serif then failed
// the same way on a later deploy. Rather than patch one font at a
// time as each one happens to flake, every Google font this layout
// uses is vendored into `src/assets/fonts/` (sourced from the
// `@fontsource/*` npm packages — the same real font files Google
// Fonts serves, just not fetched at build time) so none of them can
// break a production build on a bad network day.

const fontSans = localFont({
  src: [
    { path: "../../assets/fonts/Inter-400.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/Inter-500.woff2", weight: "500", style: "normal" },
    { path: "../../assets/fonts/Inter-600.woff2", weight: "600", style: "normal" },
    { path: "../../assets/fonts/Inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = localFont({
  src: [
    { path: "../../assets/fonts/NotoSerif-600.woff2", weight: "600", style: "normal" },
    { path: "../../assets/fonts/NotoSerif-600-Italic.woff2", weight: "600", style: "italic" },
    { path: "../../assets/fonts/NotoSerif-700.woff2", weight: "700", style: "normal" },
    { path: "../../assets/fonts/NotoSerif-700-Italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

const fontEthiopic = localFont({
  src: [
    { path: "../../assets/fonts/NotoSansEthiopic-400.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/NotoSansEthiopic-500.woff2", weight: "500", style: "normal" },
    { path: "../../assets/fonts/NotoSansEthiopic-600.woff2", weight: "600", style: "normal" },
    { path: "../../assets/fonts/NotoSansEthiopic-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ethiopic",
  display: "swap",
});

// bennyhinn.org-style classical editorial display serif for section
// headlines and hero copy.
const fontPlayfair = localFont({
  src: [
    { path: "../../assets/fonts/PlayfairDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../../assets/fonts/PlayfairDisplay-600-Italic.woff2", weight: "600", style: "italic" },
    { path: "../../assets/fonts/PlayfairDisplay-700.woff2", weight: "700", style: "normal" },
    { path: "../../assets/fonts/PlayfairDisplay-700-Italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
});

// Small uppercase crest/wordmark lettering (the "GOSPEL LIGHT" logo
// lockup in the header and footer).
const fontCinzel = localFont({
  src: [
    { path: "../../assets/fonts/Cinzel-600.woff2", weight: "600", style: "normal" },
    { path: "../../assets/fonts/Cinzel-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-cinzel",
  display: "swap",
});

// Uppercase, wide-tracking navigation links and buttons.
const fontMontserrat = localFont({
  src: [
    { path: "../../assets/fonts/Montserrat-600.woff2", weight: "600", style: "normal" },
    { path: "../../assets/fonts/Montserrat-700.woff2", weight: "700", style: "normal" },
    { path: "../../assets/fonts/Montserrat-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

const SITE_DESCRIPTIONS: Record<Locale, string> = {
  en:
    "Gospel Light Ministries International — serving 31+ congregations across Ethiopia and North America with the unchanging Gospel of Jesus Christ. Sermons, locations, book store, and online giving.",
  am:
    "የወንጌል ብርሃን አለማቀፍ አገልግሎት — በኢትዮጵያና በሰሜን አሜሪካ የሚገኙ ከ31 በላይ አጥቢያዎችን የምታገለግል። ስብከቶች፣ አጥቢያዎች፣ የመጻሕፍት መደብርና የመስመር ላይ መዋጮ።",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isSupportedLocale(rawLocale) ? rawLocale : "en";
  const description = SITE_DESCRIPTIONS[locale];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Gospel Light Ministries International",
      template: "%s | Gospel Light Ministries International",
    },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        am: "/am",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Gospel Light Ministries International",
      title: "Gospel Light Ministries International",
      description,
      url: `/${locale}`,
      locale: locale === "am" ? "am_ET" : "en_US",
      alternateLocale: locale === "am" ? "en_US" : "am_ET",
    },
    twitter: {
      card: "summary_large_image",
      title: "Gospel Light Ministries International",
      description,
    },
  };
}

// The legacy WordPress site shipped `user-scalable=no`, disabling
// pinch-to-zoom — a mobile accessibility defect. Explicitly re-enable it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "am" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      dir="ltr"
      className={`${fontSans.variable} ${fontSerif.variable} ${fontEthiopic.variable} ${fontPlayfair.variable} ${fontCinzel.variable} ${fontMontserrat.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-slate-50 font-sans text-slate-800 antialiased">
        <JsonLdSchema locale={locale} />
        <AppProviders>
          <ClickSpark sparkColor="#60A5FA" sparkSize={10} sparkRadius={20} sparkCount={8} duration={400}>
            <TopUtilityBar locale={locale} />
            <Navbar locale={locale} />
            {children}
            <Footer locale={locale} />
            <MobileBottomNav locale={locale} />
            <CartDrawer />
            <GlobalPrayerModal />
          </ClickSpark>
        </AppProviders>
      </body>
    </html>
  );
}
