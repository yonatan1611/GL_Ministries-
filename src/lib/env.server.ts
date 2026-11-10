import { z } from "zod";

/**
 * Server-only secrets, validated separately from `@/lib/env`.
 *
 * `@/lib/env` is imported by `@/data/*` files that client components pull
 * in (Footer, GivingPortalClient, etc.), so anything in that module ends
 * up evaluated in the browser bundle too. A real secret like
 * `STRIPE_SECRET_KEY` is never available there — only `NEXT_PUBLIC_*` vars
 * get inlined client-side — so validating it eagerly there crashed every
 * page with "STRIPE_SECRET_KEY: Required" the moment Next.js enforced
 * production mode. Keeping it in its own module, imported only by
 * `@/lib/stripe` (server-side API routes and server components), avoids
 * that.
 */

const isProd = process.env.NODE_ENV === "production";

function requiredInProd<T extends z.ZodTypeAny>(schema: T, devFallback: z.infer<T>) {
  return isProd
    ? schema
    : schema.optional().transform((val) => (val === undefined ? devFallback : val));
}

const serverEnvSchema = z.object({
  STRIPE_SECRET_KEY: requiredInProd(
    z.string().min(1, "STRIPE_SECRET_KEY is required in production"),
    "sk_test_dev_placeholder"
  ),
  // Only required once STRIPE_SECRET_KEY is a real key — verifies
  // `/api/stripe/webhook` signatures. Safe to leave blank until the
  // client connects a real Stripe account and configures the webhook.
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),

  // Ministry Admin Portal passcode (`/[locale]/admin`). Demo default
  // `2026` — override in production via `.env`. Never exposed to the
  // client: only used server-side to verify `/api/admin/login` and to
  // sign the admin session cookie.
  ADMIN_PASSCODE: z.string().min(1).default("2026"),

  // YouTube Data API v3 key — optional. Without it, `youtube-sync.ts`
  // falls back to each channel's free public RSS feed for new-upload
  // sync (15 most recent uploads, no live-status lookup) and the
  // "LIVE NOW" badge falls back to the fixed weekly clock schedule in
  // `broadcastSchedule.ts`. With it configured, new-upload sync reads
  // full paginated history via the Data API, and the real
  // `search.list?eventType=live` endpoint can confirm whether either
  // channel is actually broadcasting right now.
  YOUTUBE_API_KEY: z.string().optional().default(""),

  // Shared secret Vercel Cron attaches as `Authorization: Bearer
  // <value>` on scheduled invocations (see vercel.json's `crons` and
  // `src/lib/cronAuth.ts`). Left blank by default so the cron sync
  // endpoint refuses every request until this is deliberately set —
  // never defaults to "open".
  CRON_SECRET: z.string().optional().default(""),
});

function loadServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    ADMIN_PASSCODE: process.env.ADMIN_PASSCODE,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
  });

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `❌ Invalid environment configuration:\n${formatted}\n\nCheck your .env.local against .env.example.`
    );
  }

  return parsed.data;
}

export const env = loadServerEnv();
