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
});

function loadServerEnv() {
  const parsed = serverEnvSchema.safeParse({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
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
