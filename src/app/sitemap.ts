import type { MetadataRoute } from "next";
import { SUPPORTED_LOCALES } from "@/lib/utils";

const ROUTES = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/sermons", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/locations", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/books", changeFrequency: "monthly" as const, priority: 0.6 },
  { path: "/give", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/legal/privacy", changeFrequency: "yearly" as const, priority: 0.2 },
  { path: "/legal/terms", changeFrequency: "yearly" as const, priority: 0.2 },
];

/** Generates sitemap entries for every route in both locales. */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const lastModified = new Date();

  return SUPPORTED_LOCALES.flatMap((locale) =>
    ROUTES.map((route) => ({
      url: `${siteUrl}/${locale}${route.path}`,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }))
  );
}
