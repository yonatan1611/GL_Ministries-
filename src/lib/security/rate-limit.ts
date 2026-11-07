/**
 * In-memory sliding-window rate limiter.
 *
 * Protects public form endpoints (newsletter signup, event RSVP,
 * prayer/ministry contact, giving checkout initiation) from bot spam and
 * brute-force abuse without requiring an external store like Redis.
 *
 * Caveat: state is per server-process. On a multi-instance/serverless
 * deployment each instance has its own counters, so this is a
 * best-effort first line of defense, not a hard global guarantee. For
 * strict global limits, back this with Upstash Redis or Vercel KV later.
 */

interface WindowEntry {
  /** Timestamps (ms) of requests within the tracked window. */
  hits: number[];
}

const store = new Map<string, WindowEntry>();

/** Periodically sweep stale entries so the map doesn't grow unbounded. */
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
let lastSweep = Date.now();

function sweep(maxWindowMs: number) {
  const now = Date.now();
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of store) {
    entry.hits = entry.hits.filter((t) => now - t < maxWindowMs);
    if (entry.hits.length === 0) store.delete(key);
  }
}

export interface RateLimitOptions {
  /** Max requests allowed within the window. */
  limit: number;
  /** Sliding window size, in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  /** Requests remaining in the current window (0 if blocked). */
  remaining: number;
  /** Unix ms timestamp when the oldest hit in the window expires. */
  resetAt: number;
}

/**
 * Checks (and records) a single request against a sliding-window limit.
 *
 * @param key Unique identifier for the caller, e.g. `getClientIp(req)` or
 *   `${getClientIp(req)}:newsletter` to scope limits per-endpoint.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const { limit, windowMs } = options;
  sweep(windowMs);

  const now = Date.now();
  const entry = store.get(key) ?? { hits: [] };
  entry.hits = entry.hits.filter((t) => now - t < windowMs);

  if (entry.hits.length >= limit) {
    store.set(key, entry);
    return {
      success: false,
      remaining: 0,
      resetAt: (entry.hits[0] ?? now) + windowMs,
    };
  }

  entry.hits.push(now);
  store.set(key, entry);

  return {
    success: true,
    remaining: Math.max(0, limit - entry.hits.length),
    resetAt: now + windowMs,
  };
}

/** Preset limiter configs for known form endpoints. Tune as traffic data comes in. */
export const RATE_LIMIT_PRESETS = {
  /** Newsletter signup: generous, but still bot-resistant. */
  newsletter: { limit: 5, windowMs: 10 * 60 * 1000 } satisfies RateLimitOptions,
  /** Event RSVP. */
  eventRsvp: { limit: 5, windowMs: 10 * 60 * 1000 } satisfies RateLimitOptions,
  /** General ministry contact form (pastoral counseling, discipleship, teams). */
  contact: { limit: 5, windowMs: 15 * 60 * 1000 } satisfies RateLimitOptions,
  /** Global Prayer Army / Hero "Prayer Requests" submissions. */
  prayer: { limit: 8, windowMs: 15 * 60 * 1000 } satisfies RateLimitOptions,
  /** Volunteer / Outreach / Home Groups action-card submissions. */
  ministryAction: { limit: 8, windowMs: 15 * 60 * 1000 } satisfies RateLimitOptions,
  /** Giving checkout session creation (Stripe). */
  givingCheckout: { limit: 10, windowMs: 10 * 60 * 1000 } satisfies RateLimitOptions,
  /** Book store checkout. */
  booksCheckout: { limit: 10, windowMs: 10 * 60 * 1000 } satisfies RateLimitOptions,
  /** YouTube channel feed sync (read-only, but still worth a floor). */
  youtubeSync: { limit: 30, windowMs: 5 * 60 * 1000 } satisfies RateLimitOptions,
  /** PDF book/eBook download (token-gated, but still worth a floor
   *  against brute-forcing a token). */
  booksDownload: { limit: 20, windowMs: 10 * 60 * 1000 } satisfies RateLimitOptions,
  /** Public "🙏 I Prayed for This" tally click — generous, since it's a
   *  low-stakes one-click engagement, not a form submission. */
  prayerIncrement: { limit: 40, windowMs: 10 * 60 * 1000 } satisfies RateLimitOptions,
  /** Read-only live counters (prayer army stats, event registered
   *  counts) — generous, but still worth a floor. */
  liveCounters: { limit: 60, windowMs: 5 * 60 * 1000 } satisfies RateLimitOptions,
  /** Admin Portal passcode attempts — intentionally tight, since the
   *  passcode is a short shared PIN rather than a full password. */
  adminLogin: { limit: 8, windowMs: 15 * 60 * 1000 } satisfies RateLimitOptions,
  /** Admin Portal data reads/writes once authenticated. */
  adminAction: { limit: 60, windowMs: 5 * 60 * 1000 } satisfies RateLimitOptions,
} as const;

/**
 * Extracts the best-effort client IP from a request's headers.
 * `x-forwarded-for` may contain a comma-separated chain; the first entry
 * is the original client as set by the edge/proxy closest to them.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
