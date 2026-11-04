import { NextResponse } from "next/server";
import { donationSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { BOOKS } from "@/data/ministry-content";

const MONTHLY_OFFER_BOOK = BOOKS.find((book) => book.isMonthlySpecialOffer);

/**
 * Giving checkout initiation (USD only). Validates with
 * `donationSchema` and returns a stewardship reference + structured
 * receipt metadata.
 *
 * This is the handoff point for a real Stripe `PaymentIntent` (card)
 * once live gateway keys are configured — see `src/lib/env.ts`.
 * Without them we still return a verifiable reference so the frontend
 * receipt flow works end-to-end in every environment.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "give", RATE_LIMIT_PRESETS.givingCheckout);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(donationSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const donation = validated.data;

    const referenceId = generateReferenceCode("GLM");

    // The Monthly Partner Book Offer is fulfilled only for a qualifying
    // Monthly/Annual gift that checked the offer box — `donationSchema`
    // already rejects the combination with a one-time gift.
    const fulfillsMonthlyOffer = Boolean(donation.claimMonthlyBookOffer) && Boolean(MONTHLY_OFFER_BOOK);

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message: "Thank you for your gift to Gospel Light Ministries International.",
        data: {
          referenceId,
          amount: donation.amount,
          currency: donation.currency,
          frequency: donation.frequency,
          fund: donation.fund,
          paymentMethod: donation.paymentMethod,
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          donorPhone: donation.donorPhone,
          submittedAt: new Date().toISOString(),
          ...(fulfillsMonthlyOffer && MONTHLY_OFFER_BOOK
            ? {
                monthlyOfferBookTitleEn: MONTHLY_OFFER_BOOK.titleEn,
                monthlyOfferBookTitleAm: MONTHLY_OFFER_BOOK.titleAm,
              }
            : {}),
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
