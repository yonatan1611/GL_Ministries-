import { NextResponse } from "next/server";
import { donationSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { BOOKS } from "@/data/ministry-content";
import { isSupportedLocale } from "@/lib/utils";
import { insertDonation, updateDonation } from "@/lib/db";
import { createGivingCheckoutSession, isStripeLiveConfigured } from "@/lib/stripe";

const MONTHLY_OFFER_BOOK = BOOKS.find((book) => book.isMonthlySpecialOffer);

/**
 * Direct Stripe Checkout Session creation for USD giving — the same
 * logic `/api/give` runs for the `card`/`apple_pay` rails, exposed as
 * its own endpoint for callers that want a Checkout Session without
 * going through the full giving-portal form flow. Requires a real
 * `STRIPE_SECRET_KEY`; otherwise there is no real Stripe to redirect to.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "give", RATE_LIMIT_PRESETS.givingCheckout);
  if (limited) return limited;

  if (!isStripeLiveConfigured) {
    return NextResponse.json(
      {
        success: false,
        error: "Stripe is not configured yet. Use /api/give for the interactive test-mode checkout.",
      },
      { status: 503 }
    );
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const rawLocale =
    typeof parsed.body === "object" && parsed.body !== null && "locale" in parsed.body
      ? String((parsed.body as { locale?: unknown }).locale ?? "")
      : "";
  const locale = isSupportedLocale(rawLocale) ? rawLocale : "en";

  try {
    const validated = validateBody(donationSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const donation = validated.data;

    const referenceId = generateReferenceCode("GLM");
    const fulfillsMonthlyOffer = Boolean(donation.claimMonthlyBookOffer) && Boolean(MONTHLY_OFFER_BOOK);
    const origin = new URL(request.url).origin;

    await insertDonation({
      referenceCode: referenceId,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorPhone: donation.donorPhone,
      amountUsd: donation.amount,
      frequency: donation.frequency,
      fund: donation.fund,
      paymentMethod: donation.paymentMethod,
      status: "pending",
      claimedMonthlyOffer: fulfillsMonthlyOffer,
      prayerNote: donation.prayerNote,
    });

    const session = await createGivingCheckoutSession({
      referenceCode: referenceId,
      amountUsd: donation.amount,
      frequency: donation.frequency,
      fund: donation.fund,
      donorEmail: donation.donorEmail,
      donorName: donation.donorName,
      claimedMonthlyOffer: fulfillsMonthlyOffer,
      locale,
      origin,
    });
    await updateDonation({ referenceCode: referenceId }, { stripeSessionId: session.id ?? undefined });

    return NextResponse.json(
      { success: true, referenceId, message: "Stripe Checkout Session created.", data: { url: session.url } },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
