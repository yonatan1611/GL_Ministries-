import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, Noto_Sans_Ethiopic, Noto_Serif, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { isSupportedLocale, type Locale } from "@/lib/utils";
import { AppProviders } from "@/components/providers/AppProviders";
import { TopUtilityBar } from "@/components/layout/TopUtilityBar";
import { Navbar } from "@/components/layout/Navbar";
import { CartDrawer } from "@/components/books/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { GlobalPrayerModal } from "@/components/prayer/GlobalPrayerModal";
import { JsonLdSchema } from "@/components/seo/JsonLdSchema";
import "../globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const fontSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const fontEthiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ethiopic",
  display: "swap",
});

// bennyhinn.org-style classical editorial display serif for section
// headlines and hero copy.
const fontPlayfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

// Small uppercase crest/wordmark lettering (the "GOSPEL LIGHT" logo
// lockup in the header and footer).
const fontCinzel = Cinzel({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

// Uppercase, wide-tracking navigation links and buttons. Self-hosted
// (rather than next/font/google) because the Google Fonts fetch during
// Vercel builds was intermittently failing and breaking production
// deploys.
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
    >
      <body className="bg-slate-50 font-sans text-slate-800 antialiased">
        <JsonLdSchema locale={locale} />
        <AppProviders>
          <TopUtilityBar locale={locale} />
          <Navbar locale={locale} />
          {children}
          <Footer locale={locale} />
          <CartDrawer />
          <GlobalPrayerModal />
        </AppProviders>
      </body>
    </html>
  );
}
