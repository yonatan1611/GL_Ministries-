import { NextResponse } from "next/server";
import { bookOrderSchema } from "@/lib/validations";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { generateReferenceCode } from "@/lib/referenceCode";
import { BOOKS } from "@/data/ministry-content";

function getUnitPriceUsd(book: (typeof BOOKS)[number], format: "Print" | "PDF"): number {
  return format === "Print" ? book.priceUsdPrint : book.priceUsdPdf;
}

/**
 * Book store checkout. Validates with `bookOrderSchema`, then
 * recalculates every line-item total server-side from `BOOKS` — the
 * client's submitted prices (if any) are never trusted. Returns a
 * digital download token for each PDF line and shipping-dispatch
 * details for any print line.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "books-checkout", RATE_LIMIT_PRESETS.booksCheckout);
  if (limited) return limited;

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

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
    const digitalDownloads: { bookId: string; titleEn: string; downloadToken: string }[] = [];
    let hasPrintItem = false;

    const lineItems = order.items.map((item) => {
      // Non-null: every bookId was already verified to exist above.
      const book = BOOKS.find((candidate) => candidate.id === item.bookId)!;
      const unitPriceUsd = getUnitPriceUsd(book, item.format);
      const lineUsd = unitPriceUsd * item.quantity;
      totalUsd += lineUsd;

      if (item.format === "PDF") {
        digitalDownloads.push({
          bookId: book.id,
          titleEn: book.titleEn,
          downloadToken: generateReferenceCode("DL"),
        });
      } else {
        hasPrintItem = true;
      }

      return {
        bookId: book.id,
        titleEn: book.titleEn,
        titleAm: book.titleAm,
        format: item.format,
        quantity: item.quantity,
        unitPriceUsd,
        lineTotalUsd: lineUsd,
      };
    });

    const referenceId = generateReferenceCode("GLM-BK");

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message: hasPrintItem
          ? "Your order was received. Print titles ship from Alexandria, VA and Addis Ababa HQ."
          : "Your order was received. Digital titles are ready for instant download.",
        data: {
          referenceId,
          lineItems,
          totalUsd,
          digitalDownloads,
          shipping: hasPrintItem
            ? { city: order.shippingCity, country: order.shippingCountry, dispatchFrom: "Alexandria, VA / Addis Ababa HQ" }
            : null,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          submittedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
