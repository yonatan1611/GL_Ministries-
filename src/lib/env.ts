import { z } from "zod";

/**
 * Centralized, Zod-validated environment configuration.
 *
 * Design goals:
 *  - The app must run out-of-the-box in local development with zero
 *    `.env.local` setup (safe fallbacks for every optional integration).
 *  - In production (`NODE_ENV === "production"`), secrets that gate real
 *    money movement (Stripe) or real public URLs must be present and
 *    well-formed, or the app should fail fast at boot rather than
 *    silently misbehave at request time.
 *
 * Import `env` anywhere server-side config is needed instead of reading
 * `process.env` directly, so every access is typed and validated once.
 */

const isProd = process.env.NODE_ENV === "production";

/** Wraps a Zod type so it's required in production but optional (and
 *  falls back to `devFallback`) outside of it. */
function requiredInProd<T extends z.ZodTypeAny>(schema: T, devFallback: z.infer<T>) {
  return isProd
    ? schema
    : schema.optional().transform((val) => (val === undefined ? devFallback : val));
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  // Public site URL — used for canonical/OG tags, absolute redirect targets,
  // and the middleware CSP connect-src allowlist.
  NEXT_PUBLIC_SITE_URL: requiredInProd(
    z.string().url(),
    "http://localhost:3000"
  ),

  // NOTE: Stripe secrets (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET) live in
  // `@/lib/env.server`, not here. This module is imported by `@/data/*`
  // files that client components pull in (Footer, GivingPortalClient,
  // etc.), so anything requiring a real secret in production would crash
  // in the browser — secrets are never available in the client bundle.

  // Tithe.ly (hosted giving page, primary USD/general giving CTA target)
  NEXT_PUBLIC_TITHELY_URL: z
    .string()
    .url()
    .default("https://tithe.ly/give?c=2282350"),

  // YouTube (sermon archive + live stream detection). Defaults to the
  // ministry's own verified, public channel ID — not a secret, so it's
  // safe to ship as a real default rather than a placeholder.
  YOUTUBE_CHANNEL_ID: z
    .string()
    .min(1)
    .default("UCbvgk_wBqP2XgyE40xgHOjA"),

  // Official ministry contact emails. Note: the legacy WordPress site
  // shipped a typo'd US contact address (`dc@glmministries.org`, double
  // "m") — the correct domain is `glministries.org`, enforced here so it
  // can never silently regress.
  GLM_ADDIS_EMAIL: z
    .string()
    .email()
    .default("addis@glministries.org"),
  GLM_DC_EMAIL: z
    .string()
    .email()
    .refine(
      (email) => email.endsWith("@glministries.org"),
      "DC office email must use the glministries.org domain (not the legacy glmministries.org typo)"
    )
    .default("dc@glministries.org"),

  // Official ministry contact phone numbers (Ethiopia HQ + US/DC office).
  GLM_ADDIS_PHONE: z.string().min(1).default("+251-113-718847"),
  GLM_DC_PHONE: z.string().min(1).default("+1-202-466-4642"),

  // Official social/media presence — public URLs, not secrets.
  // NOTE: `web.facebook.com/EGLIC` is the URL named in the client brief,
  // but it does not resolve to a live page as of this rebuild — see the
  // verified alternates (gospellightchurchdc / numeric Aware page id) in
  // `src/data/social-media.ts`. Kept as the literal brief value here
  // pending client confirmation; swap via env without a code change once
  // confirmed.
  NEXT_PUBLIC_FACEBOOK_URL: z
    .string()
    .url()
    .default("https://web.facebook.com/EGLIC"),
  NEXT_PUBLIC_TELEGRAM_URL: z.string().url().default("https://t.me/EGLIC"),
  NEXT_PUBLIC_INSTAGRAM_URL: z
    .string()
    .url()
    .default("https://www.instagram.com/glic_aware"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_TITHELY_URL: process.env.NEXT_PUBLIC_TITHELY_URL,
    YOUTUBE_CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID,
    GLM_ADDIS_EMAIL: process.env.GLM_ADDIS_EMAIL,
    GLM_DC_EMAIL: process.env.GLM_DC_EMAIL,
    GLM_ADDIS_PHONE: process.env.GLM_ADDIS_PHONE,
    GLM_DC_PHONE: process.env.GLM_DC_PHONE,
    NEXT_PUBLIC_FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL,
    NEXT_PUBLIC_TELEGRAM_URL: process.env.NEXT_PUBLIC_TELEGRAM_URL,
    NEXT_PUBLIC_INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
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

export const env = loadEnv();

/** Official ministry contact emails, re-exported for convenience. */
export const CONTACT_EMAILS = {
  addis: env.GLM_ADDIS_EMAIL,
  dc: env.GLM_DC_EMAIL,
} as const;

/** Official ministry contact phone numbers, re-exported for convenience. */
export const CONTACT_PHONES = {
  addis: env.GLM_ADDIS_PHONE,
  dc: env.GLM_DC_PHONE,
} as const;

/** Official social/media links, re-exported for convenience. */
export const SOCIAL_LINKS = {
  facebook: env.NEXT_PUBLIC_FACEBOOK_URL,
  telegram: env.NEXT_PUBLIC_TELEGRAM_URL,
  instagram: env.NEXT_PUBLIC_INSTAGRAM_URL,
  youtubeChannelId: env.YOUTUBE_CHANNEL_ID,
} as const;

/** Tithe.ly hosted giving page, re-exported for convenience. */
export const TITHELY_URL = env.NEXT_PUBLIC_TITHELY_URL;
