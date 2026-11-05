import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { BOOKS } from "@/data/ministry-content";
import { LOCATIONS } from "@/data/locations";
import type { Book, BranchLocation } from "@/types/ministry";
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
  joinedPrayerArmy: boolean;
  isPrayedFor: boolean;
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
  kind: "event" | "salvation" | "ministry-action" | "plan-your-visit";
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
  sermons: unknown[];
  events: unknown[];
  dailyDevotionals: unknown[];
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
    sermons: [],
    events: [],
    dailyDevotionals: [],
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

async function loadFromDisk(): Promise<Database> {
  await fs.mkdir(DB_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    // Merge over the seed so a database file written before a new
    // collection existed still comes back with that collection present.
    return { ...seedDatabase(), ...parsed };
  } catch {
    const seeded = seedDatabase();
    await persist(seeded);
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
 *  concurrent requests in this process never interleave writes. */
function mutate<T>(mutator: (db: Database) => T): Promise<T> {
  const resultPromise = writeChain.then(async () => {
    const db = await getDbUncached();
    const result = mutator(db);
    await persist(db);
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
  match: { referenceCode?: string; stripeSessionId?: string },
  patch: Partial<DonationRecord>
): Promise<DonationRecord | null> {
  return mutate((db) => {
    const donation = db.donations.find(
      (d) =>
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
  match: { orderNumber?: string; stripeSessionId?: string },
  patch: Partial<BookOrderRecord>
): Promise<BookOrderRecord | null> {
  return mutate((db) => {
    const order = db.bookOrders.find(
      (o) =>
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
