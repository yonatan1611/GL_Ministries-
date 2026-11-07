import { NextResponse } from "next/server";
import { donationSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { isSupportedLocale } from "@/lib/utils";
import { insertDonation, listBooks, updateDonation } from "@/lib/db";
import { createGivingCheckoutSession, isStripeLiveConfigured } from "@/lib/stripe";

/**
 * Giving checkout. Validates with `donationSchema`, persists a real
 * donation record (`src/lib/db.ts`), and routes by payment rail:
 *
 *  - `card` / `apple_pay` + a real `STRIPE_SECRET_KEY` configured:
 *    creates a real Stripe Checkout Session and returns its hosted URL.
 *  - `card` / `apple_pay` without a real key: the frontend has already
 *    run the donor through `InteractivePaymentGatewayModal`'s local
 *    test-mode card validation before calling this endpoint, so the
 *    gift is recorded as completed immediately.
 *  - `check`: recorded as a pending pledge (the office reconciles it
 *    against the mailed check).
 *  - `tithely`: handled entirely by the external Tithe.ly portal — not
 *    persisted here since we never observe whether it completed.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "give", RATE_LIMIT_PRESETS.givingCheckout);
  if (limited) return limited;

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
    const books = await listBooks();
    const monthlyOfferBook = books.find((book) => book.isMonthlySpecialOffer);
    const fulfillsMonthlyOffer = Boolean(donation.claimMonthlyBookOffer) && Boolean(monthlyOfferBook);
    const origin = new URL(request.url).origin;

    const baseResponseData = {
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
      ...(fulfillsMonthlyOffer && monthlyOfferBook
        ? {
            monthlyOfferBookTitleEn: monthlyOfferBook.titleEn,
            monthlyOfferBookTitleAm: monthlyOfferBook.titleAm,
          }
        : {}),
    };

    // Tithe.ly is an external hand-off — we never observe completion,
    // so there is nothing to persist.
    if (donation.paymentMethod === "tithely") {
      return NextResponse.json(
        {
          success: true,
          referenceId,
          message: "Redirecting you to the official Tithe.ly giving portal.",
          data: baseResponseData,
        },
        { status: 200 }
      );
    }

    const isCardRail = donation.paymentMethod === "card" || donation.paymentMethod === "apple_pay";

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

    if (isCardRail && isStripeLiveConfigured) {
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
        {
          success: true,
          referenceId,
          message: "Redirecting to secure Stripe Checkout...",
          data: { ...baseResponseData, redirectUrl: session.url },
        },
        { status: 200 }
      );
    }

    // Card/Apple Pay in local test mode: the client already validated
    // card details in InteractivePaymentGatewayModal before calling
    // here, so this is the completion of that simulated charge.
    // Check-by-mail: recorded as pending until the office receives it.
    const completedNow = isCardRail;
    if (completedNow) {
      await updateDonation(
        { referenceCode: referenceId },
        { status: "completed", completedAt: new Date().toISOString() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message: "Thank you for your gift to Gospel Light Ministries International.",
        data: { ...baseResponseData, redirectUrl: `/${locale}/give/success?ref=${referenceId}` },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
