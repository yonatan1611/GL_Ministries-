import { BOOKS } from "@/data/ministry-content";
import { LOCATIONS } from "@/data/locations";
import type { Locale } from "@/lib/utils";

/**
 * Resolves the Top Utility Bar search box to a real destination: a
 * direct book-title match goes to the Book Store, a direct branch/city
 * match goes to the Locations directory (pre-filtered by `?q=`), and
 * everything else falls through to the Sermons archive search
 * (`?q=`), which covers the common case of searching a speaker, topic,
 * or sermon title.
 */
export function resolveSiteSearchHref(locale: Locale, query: string): string {
  const q = query.trim().toLowerCase();
  if (!q) return `/${locale}/sermons`;

  const matchedBook = BOOKS.find(
    (book) => book.titleEn.toLowerCase().includes(q) || book.titleAm.toLowerCase().includes(q)
  );
  if (matchedBook) return `/${locale}/books`;

  const matchedLocation = LOCATIONS.find(
    (location) =>
      location.nameEn.toLowerCase().includes(q) ||
      location.nameAm.toLowerCase().includes(q) ||
      location.city.toLowerCase().includes(q)
  );
  if (matchedLocation) return `/${locale}/locations?q=${encodeURIComponent(query.trim())}`;

  return `/${locale}/sermons?q=${encodeURIComponent(query.trim())}`;
}
