import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { BOOKS, DAILY_DEVOTIONALS, SERMONS, UPCOMING_EVENTS_2026 } from "@/data/ministry-content";
import { LOCATIONS } from "@/data/locations";
import type { Book, BranchLocation, DailyDevotional, MinistryEvent, Sermon } from "@/types/ministry";
import type { DonationFund, DonationPaymentMethod } from "@/lib/validations";

/**
 * Zero-config persistent database for everything the live site writes:
 * donations, book orders, prayer requests, subscribers, and RSVPs are
 * mutated at runtime; `books`/`locations` are seeded once from
 * `src/data/*` and then live in the same store so the Admin Portal
 * (later phase) can edit them without touching source files.
 *
 * Backed by a single JSON file (`data/glm-database.json`) rather than an
 * external database so the whole system works with zero setup. Writes
 * are serialized through `writeChain` and committed with a
 * write-temp-then-rename swap, so a crash mid-write can never leave the
 * file half-written.
 */

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "glm-database.json");

export interface DonationRecord {
  id: string;
  referenceCode: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  amountUsd: number;
  frequency: "one-time" | "monthly" | "annual";
  fund: DonationFund;
  paymentMethod: DonationPaymentMethod;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  status: "pending" | "completed";
  claimedMonthlyOffer: boolean;
  prayerNote?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BookOrderItem {
  bookId: string;
  titleEn: string;
  titleAm: string;
  format: "Print" | "PDF";
  quantity: number;
  unitPriceUsd: number;
  /** Capability token authorizing `/api/books/download/[bookId]` —
   *  present only on `PDF` lines. */
  downloadToken?: string;
}

export interface BookOrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingCity?: string;
  shippingCountry?: string;
  items: BookOrderItem[];
  totalUsd: number;
  paymentStatus: "pending" | "completed";
  /** Office-set packing/shipping status for print orders — a manual
   *  staff flag (no real carrier/tracking integration), distinct from
   *  `paymentStatus`. Absent/`"pending"` on digital-only (PDF) orders,
   *  which have nothing to ship. */
  fulfillmentStatus?: "pending" | "shipped" | "completed";
  stripeSessionId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PrayerRequestRecord {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  category: string;
  requestText: string;
  isConfidential: boolean;
  joinedPrayerArmy: boolean;
  /** Visitor-facing "🙏 I Prayed for This" tally — incremented by
   *  anyone viewing the public prayer wall, unrelated to staff review. */
  prayedCount: number;
  /** Set by the (future) Admin Portal when pastoral staff have
   *  personally interceded over this request. */
  prayedOverByStaff: boolean;
  createdAt: string;
}

export interface SubscriberRecord {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
  createdAt: string;
}

export interface RsvpRecord {
  id: string;
  kind: "event" | "salvation" | "ministry-action" | "plan-your-visit" | "contact-inquiry";
  eventId?: string;
  fullName: string;
  email: string;
  phone?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

interface Database {
  donations: DonationRecord[];
  bookOrders: BookOrderRecord[];
  prayerRequests: PrayerRequestRecord[];
  subscribers: SubscriberRecord[];
  rsvps: RsvpRecord[];
  books: Book[];
  locations: BranchLocation[];
  sermons: Sermon[];
  events: MinistryEvent[];
  dailyDevotionals: DailyDevotional[];
}

function seedDatabase(): Database {
  return {
    donations: [],
    bookOrders: [],
    prayerRequests: [],
    subscribers: [],
    rsvps: [],
    books: BOOKS,
    locations: LOCATIONS,
    sermons: SERMONS,
    events: UPCOMING_EVENTS_2026,
    dailyDevotionals: DAILY_DEVOTIONALS,
  };
}

let memoryCache: Database | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function persist(db: Database): Promise<void> {
  await fs.mkdir(DB_DIR, { recursive: true });
  const tmpFile = path.join(DB_DIR, `.glm-database.${process.pid}.${Date.now()}.tmp`);
  await fs.writeFile(tmpFile, JSON.stringify(db, null, 2), "utf-8");
  await fs.rename(tmpFile, DB_FILE);
}

/** Like `persist`, but never throws — callers that can proceed with an
 *  in-memory-only copy (every read path, and every write that already
 *  applied the mutation to `memoryCache`) use this instead of letting
 *  a filesystem failure become a 500. This matters specifically on
 *  Vercel: a deployed function's filesystem is read-only outside
 *  `/tmp`, so every write here fails every time in that environment —
 *  loud in the logs, but the site stays up on seeded/in-memory data
 *  rather than crashing on every single page load. */
async function persistBestEffort(db: Database): Promise<void> {
  try {
    await persist(db);
  } catch (error) {
    console.error(
      "[db] Failed to persist data/glm-database.json — continuing with in-memory data only.",
      error
    );
  }
}

async function loadFromDisk(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    // Merge over the seed so a database file written before a new
    // collection existed still comes back with that collection present.
    return { ...seedDatabase(), ...parsed };
  } catch {
    const seeded = seedDatabase();
    await persistBestEffort(seeded);
    return seeded;
  }
}

async function getDbUncached(): Promise<Database> {
  if (!memoryCache) {
    memoryCache = await loadFromDisk();
  }
  return memoryCache;
}

/** Serializes every read-modify-write through one promise chain so
 *  concurrent requests in this process never interleave writes. The
 *  mutation always applies to `memoryCache` even if the disk write
 *  fails (see `persistBestEffort`) — a form submission still succeeds
 *  for the visitor and is visible for the rest of this instance's
 *  life, it just isn't guaranteed to survive a cold start until this
 *  runs against a real database instead of a local JSON file. */
function mutate<T>(mutator: (db: Database) => T): Promise<T> {
  const resultPromise = writeChain.then(async () => {
    const db = await getDbUncached();
    const result = mutator(db);
    await persistBestEffort(db);
    return result;
  });
  // Keep the chain alive even if this particular write rejects, so a
  // single failed mutation doesn't wedge every write after it.
  writeChain = resultPromise.then(() => undefined, () => undefined);
  return resultPromise;
}

/** Read-only snapshot of the whole database. */
export async function getDb(): Promise<Readonly<Database>> {
  return getDbUncached();
}

// ---------------------------------------------------------------------------
// Donations
// ---------------------------------------------------------------------------

export async function insertDonation(
  record: Omit<DonationRecord, "id" | "createdAt">
): Promise<DonationRecord> {
  return mutate((db) => {
    const donation: DonationRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    db.donations.push(donation);
    return donation;
  });
}

export async function updateDonation(
  match: { id?: string; referenceCode?: string; stripeSessionId?: string },
  patch: Partial<DonationRecord>
): Promise<DonationRecord | null> {
  return mutate((db) => {
    const donation = db.donations.find(
      (d) =>
        (match.id && d.id === match.id) ||
        (match.referenceCode && d.referenceCode === match.referenceCode) ||
        (match.stripeSessionId && d.stripeSessionId === match.stripeSessionId)
    );
    if (!donation) return null;
    Object.assign(donation, patch);
    return donation;
  });
}

export async function findDonation(match: {
  referenceCode?: string;
  stripeSessionId?: string;
}): Promise<DonationRecord | null> {
  const db = await getDb();
  return (
    db.donations.find(
      (d) =>
        (match.referenceCode && d.referenceCode === match.referenceCode) ||
        (match.stripeSessionId && d.stripeSessionId === match.stripeSessionId)
    ) ?? null
  );
}

/** Admin Portal "+ Record Manual / Offline Check Gift" — logs a real
 *  Sunday-offering check or wire transfer the office received outside
 *  Stripe into the same unified ledger, pre-marked `completed` (staff
 *  are recording money already in hand, not awaiting a webhook). */
export async function insertManualDonation(
  record: Omit<DonationRecord, "id" | "createdAt" | "completedAt" | "status" | "claimedMonthlyOffer"> & {
    createdAt?: string;
  }
): Promise<DonationRecord> {
  return mutate((db) => {
    const now = new Date().toISOString();
    const donation: DonationRecord = {
      ...record,
      id: randomUUID(),
      status: "completed",
      claimedMonthlyOffer: false,
      createdAt: record.createdAt ?? now,
      completedAt: now,
    };
    db.donations.push(donation);
    return donation;
  });
}

// ---------------------------------------------------------------------------
// Book Orders
// ---------------------------------------------------------------------------

export async function insertBookOrder(
  record: Omit<BookOrderRecord, "id" | "createdAt">
): Promise<BookOrderRecord> {
  return mutate((db) => {
    const order: BookOrderRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    db.bookOrders.push(order);
    return order;
  });
}

export async function updateBookOrder(
  match: { id?: string; orderNumber?: string; stripeSessionId?: string },
  patch: Partial<BookOrderRecord>
): Promise<BookOrderRecord | null> {
  return mutate((db) => {
    const order = db.bookOrders.find(
      (o) =>
        (match.id && o.id === match.id) ||
        (match.orderNumber && o.orderNumber === match.orderNumber) ||
        (match.stripeSessionId && o.stripeSessionId === match.stripeSessionId)
    );
    if (!order) return null;
    Object.assign(order, patch);
    return order;
  });
}

export async function findBookOrder(match: {
  orderNumber?: string;
  stripeSessionId?: string;
}): Promise<BookOrderRecord | null> {
  const db = await getDb();
  return (
    db.bookOrders.find(
      (o) =>
        (match.orderNumber && o.orderNumber === match.orderNumber) ||
        (match.stripeSessionId && o.stripeSessionId === match.stripeSessionId)
    ) ?? null
  );
}

// ---------------------------------------------------------------------------
// Prayer Requests / Global Prayer Army
// ---------------------------------------------------------------------------

export async function insertPrayerRequest(
  record: Omit<PrayerRequestRecord, "id" | "createdAt" | "prayedCount" | "prayedOverByStaff">
): Promise<PrayerRequestRecord> {
  return mutate((db) => {
    const prayer: PrayerRequestRecord = {
      ...record,
      id: randomUUID(),
      prayedCount: 0,
      prayedOverByStaff: false,
      createdAt: new Date().toISOString(),
    };
    db.prayerRequests.push(prayer);
    return prayer;
  });
}

/** Increments the public "I Prayed for This" tally on one request. */
export async function incrementPrayerCount(id: string): Promise<PrayerRequestRecord | null> {
  return mutate((db) => {
    const prayer = db.prayerRequests.find((p) => p.id === id);
    if (!prayer) return null;
    prayer.prayedCount += 1;
    return prayer;
  });
}

export interface PrayerArmyStats {
  totalPrayerArmyMembers: number;
  totalPrayersOffered: number;
}

/** Live counters for the homepage Global Prayer Army panel. */
export async function getPrayerArmyStats(): Promise<PrayerArmyStats> {
  const db = await getDb();
  return {
    totalPrayerArmyMembers: db.prayerRequests.filter((p) => p.joinedPrayerArmy).length,
    totalPrayersOffered: db.prayerRequests.reduce((sum, p) => sum + p.prayedCount, 0),
  };
}

/** Most recent non-confidential requests for the public prayer wall —
 *  confidential submissions (the default) never appear here. */
export async function listPublicPrayerRequests(limit = 10): Promise<PrayerRequestRecord[]> {
  const db = await getDb();
  return db.prayerRequests
    .filter((p) => !p.isConfidential)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Subscribers ("Stay Connected to God's Grace")
// ---------------------------------------------------------------------------

/** Upserts by email or phone so re-subscribing updates preferences
 *  instead of creating duplicate records. */
export async function upsertSubscriber(
  record: Omit<SubscriberRecord, "id" | "createdAt">
): Promise<SubscriberRecord> {
  return mutate((db) => {
    const existing = db.subscribers.find(
      (s) =>
        (record.email && s.email === record.email) || (record.phone && s.phone === record.phone)
    );
    if (existing) {
      Object.assign(existing, record);
      return existing;
    }
    const subscriber: SubscriberRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    db.subscribers.push(subscriber);
    return subscriber;
  });
}

// ---------------------------------------------------------------------------
// RSVPs (Event RSVPs, Salvation decisions, Ministry Actions)
// ---------------------------------------------------------------------------

export async function insertRsvp(record: Omit<RsvpRecord, "id" | "createdAt">): Promise<RsvpRecord> {
  return mutate((db) => {
    const rsvp: RsvpRecord = {
      ...record,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    db.rsvps.push(rsvp);
    return rsvp;
  });
}

/** Live registered-count per event, for the "X registered" badge on
 *  the homepage Upcoming Events cards. */
export async function getEventRegisteredCounts(): Promise<Record<string, number>> {
  const db = await getDb();
  const counts: Record<string, number> = {};
  for (const rsvp of db.rsvps) {
    if (rsvp.kind !== "event" || !rsvp.eventId) continue;
    counts[rsvp.eventId] = (counts[rsvp.eventId] ?? 0) + 1;
  }
  return counts;
}

// ---------------------------------------------------------------------------
// Admin Portal actions
// ---------------------------------------------------------------------------

/** Marks a prayer request as personally interceded over by pastoral
 *  staff — distinct from the public `prayedCount` tally. */
export async function markPrayerProcessedByStaff(id: string): Promise<PrayerRequestRecord | null> {
  return mutate((db) => {
    const prayer = db.prayerRequests.find((p) => p.id === id);
    if (!prayer) return null;
    prayer.prayedOverByStaff = true;
    return prayer;
  });
}

/** Live event list — the source of truth `GET /api/events` and
 *  `/api/events/rsvp` read from, seeded once from
 *  `UPCOMING_EVENTS_2026` and then editable through the Admin Portal
 *  without touching source files. */
export async function listEvents(): Promise<MinistryEvent[]> {
  const db = await getDb();
  return db.events;
}

export async function insertEvent(record: Omit<MinistryEvent, "id"> & { id?: string }): Promise<MinistryEvent> {
  return mutate((db) => {
    const event: MinistryEvent = { ...record, id: record.id || randomUUID() };
    db.events.push(event);
    return event;
  });
}

// ---------------------------------------------------------------------------
// Sermons (curated catalog + Admin Portal YouTube sync/add)
// ---------------------------------------------------------------------------

/** Live sermon catalog — seeded once from the curated `SERMONS`, then
 *  editable through the Admin Portal (one-click YouTube sync, or
 *  manual add-by-URL) without touching source files. */
export async function listSermons(): Promise<Sermon[]> {
  const db = await getDb();
  return db.sermons;
}

export async function insertSermon(record: Omit<Sermon, "id"> & { id?: string }): Promise<Sermon> {
  return mutate((db) => {
    const sermon: Sermon = { ...record, id: record.id || randomUUID() };
    db.sermons.push(sermon);
    return sermon;
  });
}

export async function findSermonByYoutubeId(youtubeId: string): Promise<Sermon | null> {
  const db = await getDb();
  return db.sermons.find((sermon) => sermon.youtubeId === youtubeId) ?? null;
}

/** Admin-portal "Edit"/"Feature" on the sermon catalog table. */
export async function updateSermon(id: string, patch: Partial<Sermon>): Promise<Sermon | null> {
  return mutate((db) => {
    const sermon = db.sermons.find((s) => s.id === id);
    if (!sermon) return null;
    Object.assign(sermon, patch);
    return sermon;
  });
}

/** Admin-portal "Delete" on the sermon catalog table. */
export async function deleteSermon(id: string): Promise<boolean> {
  return mutate((db) => {
    const before = db.sermons.length;
    db.sermons = db.sermons.filter((s) => s.id !== id);
    return db.sermons.length < before;
  });
}

// ---------------------------------------------------------------------------
// Books (catalog — live-editable from the Admin Portal)
// ---------------------------------------------------------------------------

/** Live book catalog — the source of truth every giving/checkout/PDF
 *  route reads from, seeded once from `BOOKS` and then editable
 *  (price, monthly offer flag) through the Admin Portal. */
export async function listBooks(): Promise<Book[]> {
  const db = await getDb();
  return db.books;
}

/** Setting `isMonthlySpecialOffer: true` here atomically unsets it on
 *  every other book first — "at most one book should carry this at a
 *  time" (see the field's own doc comment on `Book`). */
export async function updateBook(id: string, patch: Partial<Book>): Promise<Book | null> {
  return mutate((db) => {
    const book = db.books.find((b) => b.id === id);
    if (!book) return null;
    if (patch.isMonthlySpecialOffer === true) {
      for (const other of db.books) other.isMonthlySpecialOffer = false;
    }
    Object.assign(book, patch);
    return book;
  });
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || randomUUID();
}

/** Admin-portal "+ Add Book to Store" — same `isMonthlySpecialOffer`
 *  exclusivity rule as `updateBook`. The slug is derived from the
 *  English title (de-duplicated with a numeric suffix if it collides)
 *  so every book gets a stable, readable URL without the office
 *  having to type one. */
export async function addBook(
  input: Omit<Book, "id" | "slug" | "createdAt"> & { slug?: string }
): Promise<Book> {
  return mutate((db) => {
    if (input.isMonthlySpecialOffer === true) {
      for (const other of db.books) other.isMonthlySpecialOffer = false;
    }
    const baseSlug = slugify(input.slug || input.titleEn);
    let slug = baseSlug;
    let suffix = 2;
    while (db.books.some((b) => b.slug === slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    const book: Book = {
      ...input,
      id: randomUUID(),
      slug,
      inStock: input.inStock ?? true,
      createdAt: new Date().toISOString(),
    };
    db.books.push(book);
    return book;
  });
}

/** Removes a book from the live catalog. Returns `false` if the id
 *  didn't match anything. */
export async function deleteBook(id: string): Promise<boolean> {
  return mutate((db) => {
    const before = db.books.length;
    db.books = db.books.filter((b) => b.id !== id);
    return db.books.length < before;
  });
}

// ---------------------------------------------------------------------------
// Daily Scripture Devotionals (live-editable from the Admin Portal)
// ---------------------------------------------------------------------------

/** Live devotional list — the source of truth the homepage "Today's
 *  Key Scripture" panel reads from, seeded once from `DAILY_DEVOTIONALS`
 *  and then fully editable through the Admin Portal. The devotional
 *  flagged `isFeaturedToday` is always sorted first. */
export async function listDevotionals(): Promise<DailyDevotional[]> {
  const db = await getDb();
  return [...db.dailyDevotionals].sort((a, b) => Number(b.isFeaturedToday) - Number(a.isFeaturedToday));
}

/** Admin-portal "Save & Publish Devotional" — same single-featured-item
 *  exclusivity rule as `updateBook`/`addBook`. */
export async function addDevotional(
  input: Omit<DailyDevotional, "id" | "updatedAt">
): Promise<DailyDevotional> {
  return mutate((db) => {
    if (input.isFeaturedToday === true) {
      for (const other of db.dailyDevotionals) other.isFeaturedToday = false;
    }
    const devotional: DailyDevotional = {
      ...input,
      id: randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    db.dailyDevotionals.push(devotional);
    return devotional;
  });
}

export async function updateDevotional(
  id: string,
  patch: Partial<Omit<DailyDevotional, "id">>
): Promise<DailyDevotional | null> {
  return mutate((db) => {
    const devotional = db.dailyDevotionals.find((d) => d.id === id);
    if (!devotional) return null;
    if (patch.isFeaturedToday === true) {
      for (const other of db.dailyDevotionals) other.isFeaturedToday = false;
    }
    Object.assign(devotional, patch, { updatedAt: new Date().toISOString() });
    return devotional;
  });
}

/** One-click "Set as Today's Active Scripture" — unsets every other
 *  devotional first, so exactly one is ever featured. */
export async function setFeaturedDevotional(id: string): Promise<DailyDevotional | null> {
  return mutate((db) => {
    const devotional = db.dailyDevotionals.find((d) => d.id === id);
    if (!devotional) return null;
    for (const other of db.dailyDevotionals) other.isFeaturedToday = false;
    devotional.isFeaturedToday = true;
    devotional.updatedAt = new Date().toISOString();
    return devotional;
  });
}

/** Deletes a devotional, refusing to remove the last remaining entry
 *  so the homepage always has at least one Scripture to show. If the
 *  deleted entry was the featured one, the next-most-recently-updated
 *  entry automatically becomes featured instead. */
export async function deleteDevotional(id: string): Promise<boolean> {
  return mutate((db) => {
    if (db.dailyDevotionals.length <= 1) return false;
    const target = db.dailyDevotionals.find((d) => d.id === id);
    if (!target) return false;
    db.dailyDevotionals = db.dailyDevotionals.filter((d) => d.id !== id);
    if (target.isFeaturedToday && !db.dailyDevotionals.some((d) => d.isFeaturedToday)) {
      const [mostRecent] = [...db.dailyDevotionals].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      if (mostRecent) mostRecent.isFeaturedToday = true;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Branch Locations (32+1 directory — live-editable from the Admin Portal)
// ---------------------------------------------------------------------------

/** Live branch directory — the source of truth `/[locale]/locations`
 *  reads from, seeded once from `LOCATIONS` and then fully editable
 *  (service times, contact info, or a brand-new branch) through the
 *  Admin Portal without touching source files. */
export async function listLocations(): Promise<BranchLocation[]> {
  const db = await getDb();
  return db.locations;
}

function slugifyLocation(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || randomUUID();
}

export async function addLocation(
  input: Omit<BranchLocation, "id" | "slug"> & { slug?: string }
): Promise<BranchLocation> {
  return mutate((db) => {
    const baseSlug = slugifyLocation(input.slug || input.nameEn);
    let slug = baseSlug;
    let suffix = 2;
    while (db.locations.some((l) => l.slug === slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    const location: BranchLocation = { ...input, id: randomUUID(), slug };
    db.locations.push(location);
    return location;
  });
}

export async function updateLocation(
  id: string,
  patch: Partial<Omit<BranchLocation, "id">>
): Promise<BranchLocation | null> {
  return mutate((db) => {
    const location = db.locations.find((l) => l.id === id);
    if (!location) return null;
    Object.assign(location, patch);
    return location;
  });
}

/** Removes a branch from the live directory. Returns `false` if the id
 *  didn't match anything. */
export async function deleteLocation(id: string): Promise<boolean> {
  return mutate((db) => {
    const before = db.locations.length;
    db.locations = db.locations.filter((l) => l.id !== id);
    return db.locations.length < before;
  });
}
