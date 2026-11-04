/**
 * Core domain types for Gospel Light Ministries International's bilingual
 * (English/Amharic) content layer: branch/synod directory, sermons,
 * books, leadership profiles, and ministry events. These are the shapes
 * consumed by `src/data/locations.ts` and `src/data/ministry-content.ts`.
 */

export type Locale = "en" | "am";

/** The four synods making up the 32 Ethiopian branches/stations + 1 US
 *  branch directory. */
export type SynodRegion =
  | "Addis Ababa"
  | "East Showa"
  | "Eastern Ethiopia"
  | "USA";

export type BranchType =
  | "Headquarters Church"
  | "Synod Center"
  | "Branch Church"
  | "Outreach Station"
  | "Outreach Stations"
  | "North America Branch";

export interface BranchLocation {
  id: string;
  slug: string;
  synod: SynodRegion;
  nameAm: string;
  nameEn: string;
  city: string;
  type: BranchType;
  detailsEn: string;
  detailsAm: string;
  address: string;
  phone: string;
  email: string;
  serviceTimesEn: string;
  serviceTimesAm: string;
  coordinates?: { lat: number; lng: number };
}

export type SermonTopic =
  | "Christian Growth"
  | "Holy Spirit"
  | "Hearing God's Voice"
  | "Revival & Repentance"
  | "Prophetic Archive"
  | "Discipleship";

export interface Sermon {
  id: string;
  slug: string;
  titleAm: string;
  titleEn: string;
  speakerEn: string;
  speakerAm: string;
  /** Not every real video has a specific cited passage — omitted rather
   *  than guessed when the source doesn't name one. */
  scriptureAm?: string;
  scriptureEn?: string;
  topic: SermonTopic;
  yearLabel: string;
  /** Only set for titles with a verified runtime; no fabricated
   *  placeholder duration. */
  duration?: string;
  /** Source of truth for this video; `youtubeUrl`/`thumbnailUrl` are
   *  derived from it via `src/lib/youtube.ts` rather than duplicated here. */
  youtubeId: string;
  /** Set only when a real downloadable low-bandwidth MP3 exists for
   *  this teaching; omitted (not fabricated) otherwise — the player
   *  falls back to video-only when absent. */
  audioMp3Url?: string;
  audioSizeMb?: number;
  summaryEn: string;
  summaryAm: string;
  featured?: boolean;
}

export interface Book {
  id: string;
  slug: string;
  titleAm: string;
  titleEn: string;
  authorEn: string;
  authorAm: string;
  priceUsdPrint: number;
  priceUsdPdf: number;
  pages: number;
  isbn: string;
  synopsisEn: string;
  synopsisAm: string;
  topics: string[];
  /** Real scanned cover photo, when we have one; falls back to the
   *  typographic GLM Press cover in `BookCard` when absent. */
  coverImageUrl?: string;
  /** Highlighted as this month's Partner Resource Offer on `/give` and
   *  in the footer — at most one book should carry this at a time. */
  isMonthlySpecialOffer?: boolean;
}

/** A single day's reading in the Benny Hinn-style Daily Scripture module. */
export interface DailyDevotional {
  id: string;
  /** ISO date (`YYYY-MM-DD`) this devotional is scheduled for. */
  date: string;
  titleEn: string;
  titleAm: string;
  scriptureRefEn: string;
  scriptureRefAm: string;
  verseTextEn: string;
  verseTextAm: string;
  reflectionEn: string;
  reflectionAm: string;
  prayerDeclarationEn: string;
  prayerDeclarationAm: string;
  authorEn: string;
  authorAm: string;
}

/** A single "Storytelling by the Numbers" impact metric. */
export interface ImpactStat {
  id: string;
  /** The headline figure as displayed, e.g. "32", "1", "1,000+". */
  value: string;
  labelEn: string;
  labelAm: string;
  detailEn: string;
  detailAm: string;
}

export interface LeaderProfile {
  id: string;
  slug: string;
  nameEn: string;
  nameAm: string;
  roleEn: string;
  roleAm: string;
  locationBadge: string;
  email: string;
  phone: string;
  bioParagraphsEn: string[];
  bioParagraphsAm: string[];
  highlightsEn: string[];
  highlightsAm: string[];
  /** Real photo, when we have one; `LeaderSection` falls back to an
   *  initials badge when absent. */
  portraitUrl?: string;
}

export interface MinistryEvent {
  id: string;
  titleEn: string;
  titleAm: string;
  dateRangeEn: string;
  dateRangeAm: string;
  locationEn: string;
  locationAm: string;
  category: "Conference" | "Revival" | "Leadership" | "Youth & Worship";
  descriptionEn: string;
  descriptionAm: string;
  isLiveStreamed: boolean;
}

export interface LocalePageProps {
  params: Promise<{ locale: Locale }>;
}
