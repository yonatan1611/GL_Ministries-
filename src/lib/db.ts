import { randomUUID } from "node:crypto";
import { BOOKS, DAILY_DEVOTIONALS, NEWS_HIGHLIGHTS, SERMONS, UPCOMING_EVENTS_2026 } from "@/data/ministry-content";
import { IMPACT_STATS } from "@/data/social-media";
import { LOCATIONS } from "@/data/locations";
import { query, withTransaction } from "@/lib/neon";
import type {
  Book,
  BranchLocation,
  DailyDevotional,
  ImpactStat,
  MinistryEvent,
  NewsHighlight,
  Sermon,
  SiteSettings,
} from "@/types/ministry";
import type { DonationFund, DonationPaymentMethod } from "@/lib/validations";

/**
 * Real persistence, backed by Neon Postgres (provisioned via the
 * Vercel Marketplace — see `src/lib/neon.ts`), replacing the earlier
 * zero-config JSON-file store. Every collection is one table with a
 * `data JSONB` column holding the full record (so every exported
 * function here keeps the exact same return shape callers already
 * depend on) plus a handful of plain columns — promoted out of `data`
 * only for the fields a query actually filters or sorts by (an id, a
 * slug, a "featured" flag, `created_at`). This is a deliberate
 * middle ground: full relational normalization of 13 collections
 * would be a lot of schema for a content/admin site like this one to
 * earn, but a bare key-value store can't support "the book flagged
 * `isMonthlySpecialOffer`" or "devotionals, featured first" without
 * pulling every row into the app and sorting in memory.
 *
 * Schema is applied idempotently at runtime (`ensureReady`, below)
 * rather than through a separate migration tool — `CREATE TABLE IF
 * NOT EXISTS` on every cold start costs nothing once the tables
 * exist, and it keeps the project's original "it just works, zero
 * setup beyond an env var" posture intact. One-time seeding (from the
 * same static `src/data/*` files that used to seed the JSON file) is
 * gated on the `site_settings` singleton row existing — not on any
 * content table being empty, since an admin legitimately emptying a
 * table (e.g. deleting every book) must never look like "never
 * seeded" and silently resurrect deleted content on the next cold
 * start.
 */

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

// ---------------------------------------------------------------------------
// Schema + one-time seed
// ---------------------------------------------------------------------------

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  reference_code TEXT,
  stripe_session_id TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_donations_reference_code ON donations (reference_code);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_session_id ON donations (stripe_session_id);

CREATE TABLE IF NOT EXISTS book_orders (
  id TEXT PRIMARY KEY,
  order_number TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_book_orders_order_number ON book_orders (order_number);
CREATE INDEX IF NOT EXISTS idx_book_orders_stripe_session_id ON book_orders (stripe_session_id);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id TEXT PRIMARY KEY,
  is_confidential BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subscribers_phone ON subscribers (phone);

CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  event_id TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON rsvps (event_id);

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  is_monthly_special_offer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS sermons (
  id TEXT PRIMARY KEY,
  youtube_id TEXT UNIQUE,
  featured BOOLEAN NOT NULL DEFAULT false,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_devotionals (
  id TEXT PRIMARY KEY,
  is_featured_today BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS news_updates (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  is_pinned_lead_story BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS impact_stats (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);
`;

async function ensureSeeded(): Promise<void> {
  const bootstrapped = await query<{ id: string }>(`SELECT id FROM site_settings WHERE id = 'singleton'`);
  if (bootstrapped.length > 0) return;

  await withTransaction(async (client) => {
    for (const book of BOOKS) {
      await client.query(
        `INSERT INTO books (id, slug, is_monthly_special_offer, created_at, data)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
        [book.id, book.slug, Boolean(book.isMonthlySpecialOffer), book.createdAt ?? null, JSON.stringify(book)]
      );
    }
    for (const location of LOCATIONS) {
      await client.query(
        `INSERT INTO locations (id, slug, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [location.id, location.slug, JSON.stringify(location)]
      );
    }
    for (const sermon of SERMONS) {
      await client.query(
        `INSERT INTO sermons (id, youtube_id, featured, data) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [sermon.id, sermon.youtubeId, Boolean(sermon.featured), JSON.stringify(sermon)]
      );
    }
    for (const event of UPCOMING_EVENTS_2026) {
      await client.query(`INSERT INTO events (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [
        event.id,
        JSON.stringify(event),
      ]);
    }
    for (const devotional of DAILY_DEVOTIONALS) {
      await client.query(
        `INSERT INTO daily_devotionals (id, is_featured_today, updated_at, data)
         VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
        [devotional.id, devotional.isFeaturedToday, devotional.updatedAt, JSON.stringify(devotional)]
      );
    }
    for (const update of NEWS_HIGHLIGHTS) {
      await client.query(
        `INSERT INTO news_updates (id, slug, is_pinned_lead_story, created_at, data)
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
        [update.id, update.slug, update.isPinnedLeadStory, update.createdAt, JSON.stringify(update)]
      );
    }
    for (const stat of IMPACT_STATS) {
      await client.query(`INSERT INTO impact_stats (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [
        stat.id,
        JSON.stringify(stat),
      ]);
    }
    const defaultSettings: SiteSettings = {
      heroAnnouncementTitle: "",
      heroAnnouncementSubtitle: "",
      heroFeaturedVideoId: "",
      updatedAt: new Date(0).toISOString(),
    };
    // Inserted last, inside the same transaction, so a crash mid-seed
    // never commits this "bootstrap complete" marker without
    // everything else having committed too.
    await client.query(`INSERT INTO site_settings (id, data) VALUES ('singleton', $1) ON CONFLICT (id) DO NOTHING`, [
      JSON.stringify(defaultSettings),
    ]);
  });
}

let readyPromise: Promise<void> | null = null;

/** Applies the schema (idempotent) and seeds once, memoized for the
 *  life of this warm instance — every exported function below awaits
 *  this first. */
function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = query(SCHEMA_SQL).then(() => ensureSeeded());
    // Don't poison the memoized promise on failure — a transient
    // connection error shouldn't permanently wedge every future call
    // in this instance into failing without retrying.
    readyPromise.catch(() => {
      readyPromise = null;
    });
  }
  return readyPromise;
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || randomUUID();
}

/** Finds a free slug for `table`, starting from `slugify(seed)` and
 *  appending `-2`, `-3`, ... on collision. */
async function uniqueSlug(table: "books" | "locations" | "news_updates", seed: string): Promise<string> {
  const baseSlug = slugify(seed);
  let slug = baseSlug;
  let suffix = 2;
  for (;;) {
    const existing = await query(`SELECT 1 FROM ${table} WHERE slug = $1`, [slug]);
    if (existing.length === 0) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

// ---------------------------------------------------------------------------
// Admin Portal aggregated snapshot
// ---------------------------------------------------------------------------

export interface AdminDataSnapshot {
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
  newsUpdates: NewsHighlight[];
}

/** One combined read for the whole Admin Portal dashboard — every
 *  collection it needs, fetched in parallel. */
export async function getDb(): Promise<AdminDataSnapshot> {
  await ensureReady();
  const [
    donations,
    bookOrders,
    prayerRequests,
    subscribers,
    rsvps,
    books,
    locations,
    sermons,
    events,
    dailyDevotionals,
    newsUpdates,
  ] = await Promise.all([
    query<{ data: DonationRecord }>(`SELECT data FROM donations ORDER BY created_at DESC`),
    query<{ data: BookOrderRecord }>(`SELECT data FROM book_orders ORDER BY created_at DESC`),
    query<{ data: PrayerRequestRecord }>(`SELECT data FROM prayer_requests ORDER BY created_at DESC`),
    query<{ data: SubscriberRecord }>(`SELECT data FROM subscribers ORDER BY created_at DESC`),
    query<{ data: RsvpRecord }>(`SELECT data FROM rsvps ORDER BY created_at DESC`),
    query<{ data: Book }>(`SELECT data FROM books`),
    query<{ data: BranchLocation }>(`SELECT data FROM locations`),
    query<{ data: Sermon }>(`SELECT data FROM sermons`),
    query<{ data: MinistryEvent }>(`SELECT data FROM events`),
    query<{ data: DailyDevotional }>(`SELECT data FROM daily_devotionals ORDER BY is_featured_today DESC`),
    query<{ data: NewsHighlight }>(
      `SELECT data FROM news_updates ORDER BY is_pinned_lead_story DESC, created_at DESC`
    ),
  ]);

  return {
    donations: donations.map((r) => r.data),
    bookOrders: bookOrders.map((r) => r.data),
    prayerRequests: prayerRequests.map((r) => r.data),
    subscribers: subscribers.map((r) => r.data),
    rsvps: rsvps.map((r) => r.data),
    books: books.map((r) => r.data),
    locations: locations.map((r) => r.data),
    sermons: sermons.map((r) => r.data),
    events: events.map((r) => r.data),
    dailyDevotionals: dailyDevotionals.map((r) => r.data),
    newsUpdates: newsUpdates.map((r) => r.data),
  };
}

// ---------------------------------------------------------------------------
// Donations
// ---------------------------------------------------------------------------

export async function insertDonation(record: Omit<DonationRecord, "id" | "createdAt">): Promise<DonationRecord> {
  await ensureReady();
  const donation: DonationRecord = { ...record, id: randomUUID(), createdAt: new Date().toISOString() };
  await query(
    `INSERT INTO donations (id, reference_code, stripe_session_id, status, created_at, data)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      donation.id,
      donation.referenceCode,
      donation.stripeSessionId ?? null,
      donation.status,
      donation.createdAt,
      JSON.stringify(donation),
    ]
  );
  return donation;
}

export async function updateDonation(
  match: { id?: string; referenceCode?: string; stripeSessionId?: string },
  patch: Partial<DonationRecord>
): Promise<DonationRecord | null> {
  await ensureReady();
  const rows = await query<{ data: DonationRecord }>(
    `SELECT data FROM donations
     WHERE ($1::text IS NOT NULL AND id = $1)
        OR ($2::text IS NOT NULL AND reference_code = $2)
        OR ($3::text IS NOT NULL AND stripe_session_id = $3)
     LIMIT 1`,
    [match.id ?? null, match.referenceCode ?? null, match.stripeSessionId ?? null]
  );
  if (rows.length === 0) return null;
  const updated: DonationRecord = { ...rows[0]!.data, ...patch };
  await query(
    `UPDATE donations SET data = $2, reference_code = $3, stripe_session_id = $4, status = $5 WHERE id = $1`,
    [updated.id, JSON.stringify(updated), updated.referenceCode, updated.stripeSessionId ?? null, updated.status]
  );
  return updated;
}

export async function findDonation(match: {
  referenceCode?: string;
  stripeSessionId?: string;
}): Promise<DonationRecord | null> {
  await ensureReady();
  const rows = await query<{ data: DonationRecord }>(
    `SELECT data FROM donations
     WHERE ($1::text IS NOT NULL AND reference_code = $1)
        OR ($2::text IS NOT NULL AND stripe_session_id = $2)
     LIMIT 1`,
    [match.referenceCode ?? null, match.stripeSessionId ?? null]
  );
  return rows[0]?.data ?? null;
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
  await ensureReady();
  const now = new Date().toISOString();
  const donation: DonationRecord = {
    ...record,
    id: randomUUID(),
    status: "completed",
    claimedMonthlyOffer: false,
    createdAt: record.createdAt ?? now,
    completedAt: now,
  };
  await query(
    `INSERT INTO donations (id, reference_code, stripe_session_id, status, created_at, data)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      donation.id,
      donation.referenceCode,
      donation.stripeSessionId ?? null,
      donation.status,
      donation.createdAt,
      JSON.stringify(donation),
    ]
  );
  return donation;
}

// ---------------------------------------------------------------------------
// Book Orders
// ---------------------------------------------------------------------------

export async function insertBookOrder(record: Omit<BookOrderRecord, "id" | "createdAt">): Promise<BookOrderRecord> {
  await ensureReady();
  const order: BookOrderRecord = { ...record, id: randomUUID(), createdAt: new Date().toISOString() };
  await query(
    `INSERT INTO book_orders (id, order_number, stripe_session_id, created_at, data)
     VALUES ($1, $2, $3, $4, $5)`,
    [order.id, order.orderNumber, order.stripeSessionId ?? null, order.createdAt, JSON.stringify(order)]
  );
  return order;
}

export async function updateBookOrder(
  match: { id?: string; orderNumber?: string; stripeSessionId?: string },
  patch: Partial<BookOrderRecord>
): Promise<BookOrderRecord | null> {
  await ensureReady();
  const rows = await query<{ data: BookOrderRecord }>(
    `SELECT data FROM book_orders
     WHERE ($1::text IS NOT NULL AND id = $1)
        OR ($2::text IS NOT NULL AND order_number = $2)
        OR ($3::text IS NOT NULL AND stripe_session_id = $3)
     LIMIT 1`,
    [match.id ?? null, match.orderNumber ?? null, match.stripeSessionId ?? null]
  );
  if (rows.length === 0) return null;
  const updated: BookOrderRecord = { ...rows[0]!.data, ...patch };
  await query(`UPDATE book_orders SET data = $2, order_number = $3, stripe_session_id = $4 WHERE id = $1`, [
    updated.id,
    JSON.stringify(updated),
    updated.orderNumber,
    updated.stripeSessionId ?? null,
  ]);
  return updated;
}

export async function findBookOrder(match: {
  orderNumber?: string;
  stripeSessionId?: string;
}): Promise<BookOrderRecord | null> {
  await ensureReady();
  const rows = await query<{ data: BookOrderRecord }>(
    `SELECT data FROM book_orders
     WHERE ($1::text IS NOT NULL AND order_number = $1)
        OR ($2::text IS NOT NULL AND stripe_session_id = $2)
     LIMIT 1`,
    [match.orderNumber ?? null, match.stripeSessionId ?? null]
  );
  return rows[0]?.data ?? null;
}

// ---------------------------------------------------------------------------
// Prayer Requests / Global Prayer Army
// ---------------------------------------------------------------------------

export async function insertPrayerRequest(
  record: Omit<PrayerRequestRecord, "id" | "createdAt" | "prayedCount" | "prayedOverByStaff">
): Promise<PrayerRequestRecord> {
  await ensureReady();
  const prayer: PrayerRequestRecord = {
    ...record,
    id: randomUUID(),
    prayedCount: 0,
    prayedOverByStaff: false,
    createdAt: new Date().toISOString(),
  };
  await query(`INSERT INTO prayer_requests (id, is_confidential, created_at, data) VALUES ($1, $2, $3, $4)`, [
    prayer.id,
    prayer.isConfidential,
    prayer.createdAt,
    JSON.stringify(prayer),
  ]);
  return prayer;
}

/** Increments the public "I Prayed for This" tally on one request. */
export async function incrementPrayerCount(id: string): Promise<PrayerRequestRecord | null> {
  await ensureReady();
  const rows = await query<{ data: PrayerRequestRecord }>(
    `UPDATE prayer_requests
     SET data = jsonb_set(data, '{prayedCount}', to_jsonb(COALESCE((data->>'prayedCount')::int, 0) + 1))
     WHERE id = $1
     RETURNING data`,
    [id]
  );
  return rows[0]?.data ?? null;
}

export interface PrayerArmyStats {
  totalPrayerArmyMembers: number;
  totalPrayersOffered: number;
}

/** Live counters for the homepage Global Prayer Army panel. */
export async function getPrayerArmyStats(): Promise<PrayerArmyStats> {
  await ensureReady();
  const rows = await query<{ total_members: number; total_prayers: number }>(
    `SELECT
       COUNT(*) FILTER (WHERE (data->>'joinedPrayerArmy')::boolean) AS total_members,
       COALESCE(SUM((data->>'prayedCount')::int), 0) AS total_prayers
     FROM prayer_requests`
  );
  return {
    totalPrayerArmyMembers: Number(rows[0]?.total_members ?? 0),
    totalPrayersOffered: Number(rows[0]?.total_prayers ?? 0),
  };
}

/** Most recent non-confidential requests for the public prayer wall —
 *  confidential submissions (the default) never appear here. */
export async function listPublicPrayerRequests(limit = 10): Promise<PrayerRequestRecord[]> {
  await ensureReady();
  const rows = await query<{ data: PrayerRequestRecord }>(
    `SELECT data FROM prayer_requests WHERE is_confidential = false ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map((r) => r.data);
}

// ---------------------------------------------------------------------------
// Subscribers ("Stay Connected to God's Grace")
// ---------------------------------------------------------------------------

/** Upserts by email or phone so re-subscribing updates preferences
 *  instead of creating duplicate records. */
export async function upsertSubscriber(
  record: Omit<SubscriberRecord, "id" | "createdAt">
): Promise<SubscriberRecord> {
  await ensureReady();
  const existingRows = await query<{ data: SubscriberRecord }>(
    `SELECT data FROM subscribers
     WHERE ($1::text IS NOT NULL AND email = $1) OR ($2::text IS NOT NULL AND phone = $2)
     LIMIT 1`,
    [record.email ?? null, record.phone ?? null]
  );
  if (existingRows.length > 0) {
    const updated: SubscriberRecord = { ...existingRows[0]!.data, ...record };
    await query(`UPDATE subscribers SET data = $2, email = $3, phone = $4 WHERE id = $1`, [
      updated.id,
      JSON.stringify(updated),
      updated.email ?? null,
      updated.phone ?? null,
    ]);
    return updated;
  }
  const subscriber: SubscriberRecord = { ...record, id: randomUUID(), createdAt: new Date().toISOString() };
  await query(`INSERT INTO subscribers (id, email, phone, created_at, data) VALUES ($1, $2, $3, $4, $5)`, [
    subscriber.id,
    subscriber.email ?? null,
    subscriber.phone ?? null,
    subscriber.createdAt,
    JSON.stringify(subscriber),
  ]);
  return subscriber;
}

// ---------------------------------------------------------------------------
// RSVPs (Event RSVPs, Salvation decisions, Ministry Actions)
// ---------------------------------------------------------------------------

export async function insertRsvp(record: Omit<RsvpRecord, "id" | "createdAt">): Promise<RsvpRecord> {
  await ensureReady();
  const rsvp: RsvpRecord = { ...record, id: randomUUID(), createdAt: new Date().toISOString() };
  await query(`INSERT INTO rsvps (id, kind, event_id, created_at, data) VALUES ($1, $2, $3, $4, $5)`, [
    rsvp.id,
    rsvp.kind,
    rsvp.eventId ?? null,
    rsvp.createdAt,
    JSON.stringify(rsvp),
  ]);
  return rsvp;
}

/** Live registered-count per event, for the "X registered" badge on
 *  the homepage Upcoming Events cards. */
export async function getEventRegisteredCounts(): Promise<Record<string, number>> {
  await ensureReady();
  const rows = await query<{ event_id: string; count: number }>(
    `SELECT event_id, COUNT(*) AS count FROM rsvps WHERE kind = 'event' AND event_id IS NOT NULL GROUP BY event_id`
  );
  const counts: Record<string, number> = {};
  for (const row of rows) counts[row.event_id] = Number(row.count);
  return counts;
}

// ---------------------------------------------------------------------------
// Admin Portal actions
// ---------------------------------------------------------------------------

/** Marks a prayer request as personally interceded over by pastoral
 *  staff — distinct from the public `prayedCount` tally. */
export async function markPrayerProcessedByStaff(id: string): Promise<PrayerRequestRecord | null> {
  await ensureReady();
  const rows = await query<{ data: PrayerRequestRecord }>(
    `UPDATE prayer_requests SET data = jsonb_set(data, '{prayedOverByStaff}', 'true') WHERE id = $1 RETURNING data`,
    [id]
  );
  return rows[0]?.data ?? null;
}

// ---------------------------------------------------------------------------
// Events (seeded once from `UPCOMING_EVENTS_2026`, editable from the
// Admin Portal)
// ---------------------------------------------------------------------------

export async function listEvents(): Promise<MinistryEvent[]> {
  await ensureReady();
  const rows = await query<{ data: MinistryEvent }>(`SELECT data FROM events`);
  return rows.map((r) => r.data);
}

export async function insertEvent(record: Omit<MinistryEvent, "id"> & { id?: string }): Promise<MinistryEvent> {
  await ensureReady();
  const event: MinistryEvent = { ...record, id: record.id || randomUUID() };
  await query(`INSERT INTO events (id, data) VALUES ($1, $2)`, [event.id, JSON.stringify(event)]);
  return event;
}

// ---------------------------------------------------------------------------
// Sermons (curated catalog + Admin Portal YouTube sync/add)
// ---------------------------------------------------------------------------

/** Live sermon catalog — seeded once from the curated `SERMONS`, then
 *  editable through the Admin Portal (one-click YouTube sync, or
 *  manual add-by-URL) without touching source files. */
export async function listSermons(): Promise<Sermon[]> {
  await ensureReady();
  const rows = await query<{ data: Sermon }>(`SELECT data FROM sermons`);
  return rows.map((r) => r.data);
}

export async function insertSermon(record: Omit<Sermon, "id"> & { id?: string }): Promise<Sermon> {
  await ensureReady();
  const sermon: Sermon = { ...record, id: record.id || randomUUID() };
  await query(`INSERT INTO sermons (id, youtube_id, featured, data) VALUES ($1, $2, $3, $4)`, [
    sermon.id,
    sermon.youtubeId,
    Boolean(sermon.featured),
    JSON.stringify(sermon),
  ]);
  return sermon;
}

export async function findSermonByYoutubeId(youtubeId: string): Promise<Sermon | null> {
  await ensureReady();
  const rows = await query<{ data: Sermon }>(`SELECT data FROM sermons WHERE youtube_id = $1 LIMIT 1`, [youtubeId]);
  return rows[0]?.data ?? null;
}

/** Admin-portal "Edit"/"Feature" on the sermon catalog table. */
export async function updateSermon(id: string, patch: Partial<Sermon>): Promise<Sermon | null> {
  await ensureReady();
  const existing = await query<{ data: Sermon }>(`SELECT data FROM sermons WHERE id = $1`, [id]);
  if (existing.length === 0) return null;
  const updated: Sermon = { ...existing[0]!.data, ...patch };
  await query(`UPDATE sermons SET data = $2, youtube_id = $3, featured = $4 WHERE id = $1`, [
    updated.id,
    JSON.stringify(updated),
    updated.youtubeId,
    Boolean(updated.featured),
  ]);
  return updated;
}

/** Admin-portal "Delete" on the sermon catalog table. */
export async function deleteSermon(id: string): Promise<boolean> {
  await ensureReady();
  const rows = await query(`DELETE FROM sermons WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Books (catalog — live-editable from the Admin Portal)
// ---------------------------------------------------------------------------

/** Live book catalog — the source of truth every giving/checkout/PDF
 *  route reads from, seeded once from `BOOKS` and then editable
 *  (price, monthly offer flag) through the Admin Portal. */
export async function listBooks(): Promise<Book[]> {
  await ensureReady();
  const rows = await query<{ data: Book }>(`SELECT data FROM books`);
  return rows.map((r) => r.data);
}

/** Setting `isMonthlySpecialOffer: true` here atomically unsets it on
 *  every other book first — "at most one book should carry this at a
 *  time" (see the field's own doc comment on `Book`) — inside one
 *  transaction so a concurrent request can never observe two books
 *  flagged at once. */
export async function updateBook(id: string, patch: Partial<Book>): Promise<Book | null> {
  await ensureReady();
  return withTransaction(async (client) => {
    const existing = await client.query<{ data: Book }>(`SELECT data FROM books WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return null;
    const updated: Book = { ...existing.rows[0]!.data, ...patch };
    if (patch.isMonthlySpecialOffer === true) {
      await client.query(
        `UPDATE books SET is_monthly_special_offer = false, data = jsonb_set(data, '{isMonthlySpecialOffer}', 'false')
         WHERE is_monthly_special_offer = true AND id != $1`,
        [id]
      );
    }
    await client.query(`UPDATE books SET data = $2, is_monthly_special_offer = $3 WHERE id = $1`, [
      updated.id,
      JSON.stringify(updated),
      Boolean(updated.isMonthlySpecialOffer),
    ]);
    return updated;
  });
}

/** Admin-portal "+ Add Book to Store" — same `isMonthlySpecialOffer`
 *  exclusivity rule as `updateBook`. The slug is derived from the
 *  English title (de-duplicated with a numeric suffix if it collides)
 *  so every book gets a stable, readable URL without the office
 *  having to type one. */
export async function addBook(
  input: Omit<Book, "id" | "slug" | "createdAt"> & { slug?: string }
): Promise<Book> {
  await ensureReady();
  const slug = await uniqueSlug("books", input.slug || input.titleEn);
  return withTransaction(async (client) => {
    if (input.isMonthlySpecialOffer === true) {
      await client.query(
        `UPDATE books SET is_monthly_special_offer = false, data = jsonb_set(data, '{isMonthlySpecialOffer}', 'false')
         WHERE is_monthly_special_offer = true`
      );
    }
    const book: Book = {
      ...input,
      id: randomUUID(),
      slug,
      inStock: input.inStock ?? true,
      createdAt: new Date().toISOString(),
    };
    await client.query(
      `INSERT INTO books (id, slug, is_monthly_special_offer, created_at, data) VALUES ($1, $2, $3, $4, $5)`,
      [book.id, book.slug, Boolean(book.isMonthlySpecialOffer), book.createdAt, JSON.stringify(book)]
    );
    return book;
  });
}

/** Removes a book from the live catalog. Returns `false` if the id
 *  didn't match anything. */
export async function deleteBook(id: string): Promise<boolean> {
  await ensureReady();
  const rows = await query(`DELETE FROM books WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Daily Scripture Devotionals (live-editable from the Admin Portal)
// ---------------------------------------------------------------------------

/** Live devotional list — the source of truth the homepage "Today's
 *  Key Scripture" panel reads from, seeded once from `DAILY_DEVOTIONALS`
 *  and then fully editable through the Admin Portal. The devotional
 *  flagged `isFeaturedToday` is always sorted first. */
export async function listDevotionals(): Promise<DailyDevotional[]> {
  await ensureReady();
  const rows = await query<{ data: DailyDevotional }>(
    `SELECT data FROM daily_devotionals ORDER BY is_featured_today DESC`
  );
  return rows.map((r) => r.data);
}

/** Admin-portal "Save & Publish Devotional" — same single-featured-item
 *  exclusivity rule as `updateBook`/`addBook`. */
export async function addDevotional(
  input: Omit<DailyDevotional, "id" | "updatedAt">
): Promise<DailyDevotional> {
  await ensureReady();
  return withTransaction(async (client) => {
    if (input.isFeaturedToday === true) {
      await client.query(
        `UPDATE daily_devotionals SET is_featured_today = false, data = jsonb_set(data, '{isFeaturedToday}', 'false')
         WHERE is_featured_today = true`
      );
    }
    const devotional: DailyDevotional = { ...input, id: randomUUID(), updatedAt: new Date().toISOString() };
    await client.query(
      `INSERT INTO daily_devotionals (id, is_featured_today, updated_at, data) VALUES ($1, $2, $3, $4)`,
      [devotional.id, devotional.isFeaturedToday, devotional.updatedAt, JSON.stringify(devotional)]
    );
    return devotional;
  });
}

export async function updateDevotional(
  id: string,
  patch: Partial<Omit<DailyDevotional, "id">>
): Promise<DailyDevotional | null> {
  await ensureReady();
  return withTransaction(async (client) => {
    const existing = await client.query<{ data: DailyDevotional }>(`SELECT data FROM daily_devotionals WHERE id = $1`, [
      id,
    ]);
    if (existing.rows.length === 0) return null;
    if (patch.isFeaturedToday === true) {
      await client.query(
        `UPDATE daily_devotionals SET is_featured_today = false, data = jsonb_set(data, '{isFeaturedToday}', 'false')
         WHERE is_featured_today = true AND id != $1`,
        [id]
      );
    }
    const updated: DailyDevotional = { ...existing.rows[0]!.data, ...patch, updatedAt: new Date().toISOString() };
    await client.query(
      `UPDATE daily_devotionals SET data = $2, is_featured_today = $3, updated_at = $4 WHERE id = $1`,
      [updated.id, JSON.stringify(updated), updated.isFeaturedToday, updated.updatedAt]
    );
    return updated;
  });
}

/** One-click "Set as Today's Active Scripture" — unsets every other
 *  devotional first, so exactly one is ever featured. */
export async function setFeaturedDevotional(id: string): Promise<DailyDevotional | null> {
  await ensureReady();
  return withTransaction(async (client) => {
    const existing = await client.query<{ data: DailyDevotional }>(`SELECT data FROM daily_devotionals WHERE id = $1`, [
      id,
    ]);
    if (existing.rows.length === 0) return null;
    await client.query(
      `UPDATE daily_devotionals SET is_featured_today = false, data = jsonb_set(data, '{isFeaturedToday}', 'false')
       WHERE is_featured_today = true`
    );
    const updated: DailyDevotional = {
      ...existing.rows[0]!.data,
      isFeaturedToday: true,
      updatedAt: new Date().toISOString(),
    };
    await client.query(`UPDATE daily_devotionals SET data = $2, is_featured_today = true, updated_at = $3 WHERE id = $1`, [
      updated.id,
      JSON.stringify(updated),
      updated.updatedAt,
    ]);
    return updated;
  });
}

/** Deletes a devotional, refusing to remove the last remaining entry
 *  so the homepage always has at least one Scripture to show. If the
 *  deleted entry was the featured one, the next-most-recently-updated
 *  entry automatically becomes featured instead. */
export async function deleteDevotional(id: string): Promise<boolean> {
  await ensureReady();
  return withTransaction(async (client) => {
    const countRows = await client.query<{ count: string }>(`SELECT COUNT(*) AS count FROM daily_devotionals`);
    if (Number(countRows.rows[0]!.count) <= 1) return false;

    const target = await client.query<{ data: DailyDevotional }>(`SELECT data FROM daily_devotionals WHERE id = $1`, [
      id,
    ]);
    if (target.rows.length === 0) return false;

    await client.query(`DELETE FROM daily_devotionals WHERE id = $1`, [id]);

    if (target.rows[0]!.data.isFeaturedToday) {
      const stillFeatured = await client.query(`SELECT 1 FROM daily_devotionals WHERE is_featured_today = true`);
      if (stillFeatured.rows.length === 0) {
        const mostRecent = await client.query<{ data: DailyDevotional }>(
          `SELECT data FROM daily_devotionals ORDER BY updated_at DESC LIMIT 1`
        );
        if (mostRecent.rows.length > 0) {
          const next = mostRecent.rows[0]!.data;
          await client.query(
            `UPDATE daily_devotionals SET is_featured_today = true, data = jsonb_set(data, '{isFeaturedToday}', 'true')
             WHERE id = $1`,
            [next.id]
          );
        }
      }
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
  await ensureReady();
  const rows = await query<{ data: BranchLocation }>(`SELECT data FROM locations`);
  return rows.map((r) => r.data);
}

export async function addLocation(
  input: Omit<BranchLocation, "id" | "slug"> & { slug?: string }
): Promise<BranchLocation> {
  await ensureReady();
  const slug = await uniqueSlug("locations", input.slug || input.nameEn);
  const location: BranchLocation = { ...input, id: randomUUID(), slug };
  await query(`INSERT INTO locations (id, slug, data) VALUES ($1, $2, $3)`, [
    location.id,
    location.slug,
    JSON.stringify(location),
  ]);
  return location;
}

export async function updateLocation(
  id: string,
  patch: Partial<Omit<BranchLocation, "id">>
): Promise<BranchLocation | null> {
  await ensureReady();
  const existing = await query<{ data: BranchLocation }>(`SELECT data FROM locations WHERE id = $1`, [id]);
  if (existing.length === 0) return null;
  const updated: BranchLocation = { ...existing[0]!.data, ...patch };
  await query(`UPDATE locations SET data = $2, slug = $3 WHERE id = $1`, [
    updated.id,
    JSON.stringify(updated),
    updated.slug,
  ]);
  return updated;
}

/** Removes a branch from the live directory. Returns `false` if the id
 *  didn't match anything. */
export async function deleteLocation(id: string): Promise<boolean> {
  await ensureReady();
  const rows = await query(`DELETE FROM locations WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// News Updates & Highlights (homepage Section 3 — live-editable from the
// Admin Portal)
// ---------------------------------------------------------------------------

/** Live news/highlight list — the source of truth the homepage's
 *  "Recent Updates & Highlights" section reads from, seeded once from
 *  `NEWS_HIGHLIGHTS` and then fully editable through the Admin Portal.
 *  The update flagged `isPinnedLeadStory` is always sorted first, then
 *  the rest newest-first by `createdAt`. */
export async function listNewsUpdates(): Promise<NewsHighlight[]> {
  await ensureReady();
  const rows = await query<{ data: NewsHighlight }>(
    `SELECT data FROM news_updates ORDER BY is_pinned_lead_story DESC, created_at DESC`
  );
  return rows.map((r) => r.data);
}

/** Admin-portal "Publish Church Update" — same single-pinned-lead-story
 *  exclusivity rule as `addBook`/`addDevotional`. */
export async function addNewsUpdate(
  input: Omit<NewsHighlight, "id" | "slug" | "createdAt"> & { slug?: string }
): Promise<NewsHighlight> {
  await ensureReady();
  const slug = await uniqueSlug("news_updates", input.slug || input.titleEn);
  return withTransaction(async (client) => {
    if (input.isPinnedLeadStory === true) {
      await client.query(
        `UPDATE news_updates SET is_pinned_lead_story = false, data = jsonb_set(data, '{isPinnedLeadStory}', 'false')
         WHERE is_pinned_lead_story = true`
      );
    }
    const update: NewsHighlight = { ...input, id: randomUUID(), slug, createdAt: new Date().toISOString() };
    await client.query(
      `INSERT INTO news_updates (id, slug, is_pinned_lead_story, created_at, data) VALUES ($1, $2, $3, $4, $5)`,
      [update.id, update.slug, update.isPinnedLeadStory, update.createdAt, JSON.stringify(update)]
    );
    return update;
  });
}

export async function updateNewsUpdate(
  id: string,
  patch: Partial<Omit<NewsHighlight, "id">>
): Promise<NewsHighlight | null> {
  await ensureReady();
  return withTransaction(async (client) => {
    const existing = await client.query<{ data: NewsHighlight }>(`SELECT data FROM news_updates WHERE id = $1`, [id]);
    if (existing.rows.length === 0) return null;
    if (patch.isPinnedLeadStory === true) {
      await client.query(
        `UPDATE news_updates SET is_pinned_lead_story = false, data = jsonb_set(data, '{isPinnedLeadStory}', 'false')
         WHERE is_pinned_lead_story = true AND id != $1`,
        [id]
      );
    }
    const updated: NewsHighlight = { ...existing.rows[0]!.data, ...patch };
    await client.query(`UPDATE news_updates SET data = $2, is_pinned_lead_story = $3 WHERE id = $1`, [
      updated.id,
      JSON.stringify(updated),
      updated.isPinnedLeadStory,
    ]);
    return updated;
  });
}

/** Removes a church update. Returns `false` if the id didn't match
 *  anything. */
export async function deleteNewsUpdate(id: string): Promise<boolean> {
  await ensureReady();
  const rows = await query(`DELETE FROM news_updates WHERE id = $1 RETURNING id`, [id]);
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// Site Settings & Impact Stats (Hero banner + "Storytelling by the
// Numbers" — live-editable from the Admin Portal)
// ---------------------------------------------------------------------------

/** Hero announcement banner settings. Every field defaults to `""`,
 *  meaning "not overridden" — callers fall back to the static i18n copy
 *  in that case rather than rendering blank text. */
export async function getSiteSettings(): Promise<SiteSettings> {
  await ensureReady();
  const rows = await query<{ data: SiteSettings }>(`SELECT data FROM site_settings WHERE id = 'singleton'`);
  return (
    rows[0]?.data ?? {
      heroAnnouncementTitle: "",
      heroAnnouncementSubtitle: "",
      heroFeaturedVideoId: "",
      updatedAt: new Date(0).toISOString(),
    }
  );
}

export async function updateSiteSettings(patch: Partial<Omit<SiteSettings, "updatedAt">>): Promise<SiteSettings> {
  await ensureReady();
  const current = await getSiteSettings();
  const updated: SiteSettings = { ...current, ...patch, updatedAt: new Date().toISOString() };
  await query(
    `INSERT INTO site_settings (id, data) VALUES ('singleton', $1)
     ON CONFLICT (id) DO UPDATE SET data = $1`,
    [JSON.stringify(updated)]
  );
  return updated;
}

/** Live "Storytelling by the Numbers" figures — seeded once from
 *  `IMPACT_STATS` and then editable through the Admin Portal. */
export async function listImpactStats(): Promise<ImpactStat[]> {
  await ensureReady();
  const rows = await query<{ data: ImpactStat }>(`SELECT data FROM impact_stats`);
  return rows.map((r) => r.data);
}

export async function updateImpactStat(id: string, patch: Partial<Omit<ImpactStat, "id">>): Promise<ImpactStat | null> {
  await ensureReady();
  const existing = await query<{ data: ImpactStat }>(`SELECT data FROM impact_stats WHERE id = $1`, [id]);
  if (existing.length === 0) return null;
  const updated: ImpactStat = { ...existing[0]!.data, ...patch };
  await query(`UPDATE impact_stats SET data = $2 WHERE id = $1`, [updated.id, JSON.stringify(updated)]);
  return updated;
}
