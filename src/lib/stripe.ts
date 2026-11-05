import Stripe from "stripe";
import { env } from "@/lib/env.server";
import type { DonationFund } from "@/lib/validations";

/** `true` once the client has configured a real Stripe secret key — the
 *  giving flow switches from the interactive local test-mode checkout
 *  over to real `stripe.checkout.sessions.create` calls the moment this
 *  flips, no code change required. Matches on substance (`sk_...` and
 *  not a "placeholder" value) rather than one exact fallback string, so
 *  it isn't fooled by `.env.local` shipping its own dev placeholder
 *  spelling (e.g. `sk_test_placeholder` vs. this module's own default
 *  of `sk_test_dev_placeholder`). */
export const isStripeLiveConfigured =
  Boolean(env.STRIPE_SECRET_KEY) &&
  env.STRIPE_SECRET_KEY.startsWith("sk_") &&
  !/placeholder/i.test(env.STRIPE_SECRET_KEY);

let client: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!isStripeLiveConfigured) {
    throw new Error("Stripe is not configured — set a real STRIPE_SECRET_KEY first.");
  }
  if (!client) {
    client = new Stripe(env.STRIPE_SECRET_KEY);
  }
  return client;
}

export interface CreateGivingCheckoutSessionParams {
  referenceCode: string;
  amountUsd: number;
  frequency: "one-time" | "monthly" | "annual";
  fund: DonationFund;
  donorEmail: string;
  donorName: string;
  claimedMonthlyOffer: boolean;
  locale: string;
  origin: string;
}

/**
 * Creates a real Stripe Checkout Session for a one-time gift (`mode:
 * "payment"`) or a Monthly/Annual Covenant Partnership (`mode:
 * "subscription"`). `payment_method_types: ["card"]` is all that's
 * needed for Apple Pay / Google Pay too — Stripe Checkout surfaces both
 * automatically on supporting devices/browsers once a card payment
 * method is enabled.
 */
export async function createGivingCheckoutSession(
  params: CreateGivingCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  const unitAmount = Math.round(params.amountUsd * 100);
  const productName = `Gift to Gospel Light Ministries International — ${params.fund}`;
  const successUrl = `${params.origin}/${params.locale}/give/success?session_id={CHECKOUT_SESSION_ID}&ref=${encodeURIComponent(params.referenceCode)}`;
  const cancelUrl = `${params.origin}/${params.locale}/give`;

  const metadata: Record<string, string> = {
    referenceCode: params.referenceCode,
    fund: params.fund,
    claimedMonthlyOffer: String(params.claimedMonthlyOffer),
  };

  if (params.frequency === "one-time") {
    return stripe.checkout.sessions.create({
      mode: "payment",
      // No `payment_method_types` — Stripe Checkout dynamically offers
      // every eligible method (card, Apple Pay, Google Pay, etc.) for
      // the merchant's country/currency automatically.
      customer_email: params.donorEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: { name: productName },
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: params.donorEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          recurring: { interval: params.frequency === "monthly" ? "month" : "year" },
          product_data: { name: productName },
        },
        quantity: 1,
      },
    ],
    subscription_data: { metadata },
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

export interface CreateBookCheckoutSessionParams {
  orderNumber: string;
  items: { titleEn: string; format: "Print" | "PDF"; quantity: number; unitPriceUsd: number }[];
  customerEmail: string;
  locale: string;
  origin: string;
}

/** Creates a real Stripe Checkout Session for a book store order — one
 *  line item per cart line, prices taken from the server-recomputed
 *  totals (never trusting client-submitted prices). */
export async function createBookCheckoutSession(
  params: CreateBookCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();
  const successUrl = `${params.origin}/${params.locale}/books/order-success?session_id={CHECKOUT_SESSION_ID}&ref=${encodeURIComponent(params.orderNumber)}`;
  const cancelUrl = `${params.origin}/${params.locale}/books`;

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: params.items.map((item) => ({
      price_data: {
        currency: "usd",
        unit_amount: Math.round(item.unitPriceUsd * 100),
        product_data: { name: `${item.titleEn} (${item.format})` },
      },
      quantity: item.quantity,
    })),
    metadata: { orderNumber: params.orderNumber },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
}

/** Verifies and parses an incoming Stripe webhook request body. Throws
 *  on a bad/missing signature — callers should turn that into a 400. */
export function constructWebhookEvent(rawBody: string, signature: string): Stripe.Event {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  }
  return getStripeClient().webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}

/** Retrieves a Checkout Session directly — used as a synchronous
 *  fallback on the `/give/success` page so the receipt still shows as
 *  completed even in local dev where the webhook may not be wired up
 *  (`stripe listen` not running). */
export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  return getStripeClient().checkout.sessions.retrieve(sessionId);
}
