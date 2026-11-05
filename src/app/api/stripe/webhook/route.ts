import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { constructWebhookEvent, isStripeLiveConfigured } from "@/lib/stripe";
import { updateDonation, updateBookOrder } from "@/lib/db";

/**
 * Stripe webhook receiver for the giving flow. Verifies the signature
 * with `STRIPE_WEBHOOK_SECRET` and marks the matching donation (by the
 * `referenceCode` metadata set in `createGivingCheckoutSession`) as
 * `completed` once Stripe confirms the Checkout Session actually paid.
 *
 * Runs on the default Node.js runtime (not Edge) — raw-body signature
 * verification needs Node's `crypto`, and Edge isn't required for this
 * either way.
 */
export async function POST(request: Request) {
  if (!isStripeLiveConfigured) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object as Stripe.Checkout.Session;
    const referenceCode = session.metadata?.referenceCode;
    const orderNumber = session.metadata?.orderNumber;

    if (referenceCode && session.payment_status === "paid") {
      await updateDonation(
        { referenceCode },
        {
          status: "completed",
          completedAt: new Date().toISOString(),
          stripeSessionId: session.id,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
        }
      );
    } else if (orderNumber && session.payment_status === "paid") {
      await updateBookOrder(
        { orderNumber },
        { paymentStatus: "completed", completedAt: new Date().toISOString(), stripeSessionId: session.id }
      );
    }
  }

  return NextResponse.json({ received: true });
}
