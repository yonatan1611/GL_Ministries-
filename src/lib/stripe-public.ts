/**
 * Client-safe counterpart to `isStripeLiveConfigured` in
 * `src/lib/stripe.ts` — reads the publishable key `NEXT_PUBLIC_*`
 * (inlined at build time), never the secret key. Shared by every
 * checkout UI (`GivingPortalClient`, `CartDrawer`) that needs to
 * decide between redirecting straight to real Stripe Checkout and
 * showing `InteractivePaymentGatewayModal`'s local test-mode flow.
 *
 * Matches on substance (`pk_...` and not a "placeholder" value) rather
 * than one exact fallback string, so it isn't fooled by whatever dev
 * placeholder spelling `.env.local` happens to ship.
 */
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export const STRIPE_IS_LIVE =
  STRIPE_PUBLISHABLE_KEY.startsWith("pk_") && !/placeholder/i.test(STRIPE_PUBLISHABLE_KEY);
