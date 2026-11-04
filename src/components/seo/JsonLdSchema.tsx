import { HQ_EMAIL, HQ_PHONE, DC_EMAIL, DC_PHONE } from "@/data/locations";
import { SOCIAL_LINKS } from "@/data/social-media";
import type { Locale } from "@/lib/utils";

const ENGLISH_NAME = "Gospel Light Ministries International";
const AMHARIC_NAME = "የወንጌል ብርሃን አለማቀፍ አገልግሎት";

/**
 * Schema.org `Church`/`ReligiousOrganization` JSON-LD, injected into
 * `src/app/[locale]/layout.tsx`. Carries the ministry's official
 * bilingual name, founder, senior pastor, both headquarters addresses,
 * verified phone numbers, and the corrected `dc@glministries.org`
 * domain (never the legacy `dc@glmministries.org` typo).
 */
export function JsonLdSchema({ locale }: { locale: Locale }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const primaryName = locale === "am" ? AMHARIC_NAME : ENGLISH_NAME;
  const alternateName = locale === "am" ? ENGLISH_NAME : AMHARIC_NAME;

  const data = {
    "@context": "https://schema.org",
    "@type": ["Church", "ReligiousOrganization"],
    name: primaryName,
    alternateName,
    url: `${siteUrl}/${locale}`,
    logo: `${siteUrl}/brand/glm-logo.jpg`,
    sameAs: [
      SOCIAL_LINKS.youtubeChannelUrl,
      "https://www.facebook.com/gospellightchurchdc/",
      SOCIAL_LINKS.telegramUrl,
      SOCIAL_LINKS.instagramUrl,
      SOCIAL_LINKS.tiktokUrl,
      SOCIAL_LINKS.xTwitterUrl,
    ],
    founder: {
      "@type": "Person",
      name: "Apostle Daniel Makonnen",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Aware, Kirkos Sub-City, P.O. Box 12992",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    telephone: HQ_PHONE,
    email: HQ_EMAIL,
    department: [
      {
        "@type": ["Church", "ReligiousOrganization"],
        name: `${ENGLISH_NAME} — Washington, D.C.`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "2401 Virginia Ave NW",
          addressLocality: "Washington",
          addressRegion: "DC",
          postalCode: "20037",
          addressCountry: "US",
        },
        telephone: DC_PHONE,
        email: DC_EMAIL,
        employee: {
          "@type": "Person",
          name: "Pastor Aberham Bedasso",
          jobTitle: "Senior Pastor",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Static, server-generated data only — never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
