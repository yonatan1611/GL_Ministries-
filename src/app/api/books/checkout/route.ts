import { NextResponse } from "next/server";
import { bookOrderSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { BOOKS } from "@/data/ministry-content";
import { isSupportedLocale } from "@/lib/utils";
import { insertBookOrder, updateBookOrder, type BookOrderItem } from "@/lib/db";
import { createBookCheckoutSession, isStripeLiveConfigured } from "@/lib/stripe";

function getUnitPriceUsd(book: (typeof BOOKS)[number], format: "Print" | "PDF"): number {
  return format === "Print" ? book.priceUsdPrint : book.priceUsdPdf;
}

/**
 * Book store checkout. Validates with `bookOrderSchema`, recalculates
 * every line-item total server-side from `BOOKS` (client-submitted
 * prices are never trusted), persists a real order (`src/lib/db.ts`),
 * then routes by rail the same way `/api/give` does:
 *
 *  - A real `STRIPE_SECRET_KEY` configured: creates a real Stripe
 *    Checkout Session and returns its hosted URL.
 *  - No real key: the frontend has already run the customer through
 *    `InteractivePaymentGatewayModal`'s local test-mode card
 *    validation before calling this endpoint, so the order is
 *    recorded as completed immediately — PDF lines get a real
 *    download token right away.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "books-checkout", RATE_LIMIT_PRESETS.booksCheckout);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  const rawLocale =
    typeof parsed.body === "object" && parsed.body !== null && "locale" in parsed.body
      ? String((parsed.body as { locale?: unknown }).locale ?? "")
      : "";
  const locale = isSupportedLocale(rawLocale) ? rawLocale : "en";

  try {
    const validated = validateBody(bookOrderSchema, parsed.body);
    if (!validated.ok) return validated.response;
    const order = validated.data;

    const unknownBookIds = order.items
      .map((item) => item.bookId)
      .filter((bookId) => !BOOKS.some((book) => book.id === bookId));
    if (unknownBookIds.length > 0) {
      return NextResponse.json(
        { success: false, error: `Unknown book reference(s): ${unknownBookIds.join(", ")}` },
        { status: 400 }
      );
    }

    let totalUsd = 0;
    let hasPrintItem = false;

    const orderItems: BookOrderItem[] = order.items.map((item) => {
      // Non-null: every bookId was already verified to exist above.
      const book = BOOKS.find((candidate) => candidate.id === item.bookId)!;
      const unitPriceUsd = getUnitPriceUsd(book, item.format);
      totalUsd += unitPriceUsd * item.quantity;
      if (item.format === "Print") hasPrintItem = true;

      return {
        bookId: book.id,
        titleEn: book.titleEn,
        titleAm: book.titleAm,
        format: item.format,
        quantity: item.quantity,
        unitPriceUsd,
        downloadToken: item.format === "PDF" ? generateReferenceCode("DL") : undefined,
      };
    });

    const orderNumber = generateReferenceCode("GLM-BK");
    const origin = new URL(request.url).origin;

    await insertBookOrder({
      orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      shippingCity: hasPrintItem ? order.shippingCity : undefined,
      shippingCountry: hasPrintItem ? order.shippingCountry : undefined,
      items: orderItems,
      totalUsd,
      paymentStatus: "pending",
    });

    if (isStripeLiveConfigured) {
      const session = await createBookCheckoutSession({
        orderNumber,
        items: orderItems.map((item) => ({
          titleEn: item.titleEn,
          format: item.format,
          quantity: item.quantity,
          unitPriceUsd: item.unitPriceUsd,
        })),
        customerEmail: order.customerEmail,
        locale,
        origin,
      });
      await updateBookOrder({ orderNumber }, { stripeSessionId: session.id ?? undefined });

      return NextResponse.json(
        {
          success: true,
          referenceId: orderNumber,
          message: "Redirecting to secure Stripe Checkout...",
          data: { redirectUrl: session.url },
        },
        { status: 200 }
      );
    }

    // Local test-mode: the client already validated card details in
    // InteractivePaymentGatewayModal before calling here.
    await updateBookOrder({ orderNumber }, { paymentStatus: "completed", completedAt: new Date().toISOString() });

    return NextResponse.json(
      {
        success: true,
        referenceId: orderNumber,
        message: hasPrintItem
          ? "Your order was received. Print titles ship from Alexandria, VA and Addis Ababa HQ."
          : "Your order was received. Digital titles are ready for instant download.",
        data: { redirectUrl: `/${locale}/books/order-success?ref=${orderNumber}` },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
