import { NextResponse } from "next/server";
import { BOOKS } from "@/data/ministry-content";
import { findBookOrder, findDonation } from "@/lib/db";
import { generateBookCertificatePdf } from "@/lib/pdfGenerator";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

/**
 * Serves a real, dynamically generated PDF for a purchased eBook.
 * Authorized one of two ways:
 *
 *  - `?order=<orderNumber>&token=<downloadToken>` — a completed book
 *    store order with a matching PDF line item (`/api/books/checkout`
 *    mints one `downloadToken` per PDF line).
 *  - `?donation=<referenceCode>` — a completed donation that claimed
 *    the current Monthly Partner Book Offer, for this same book.
 *
 * Anything else is rejected — this never serves a file to a request
 * that can't prove it paid for it.
 */
export async function GET(request: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const limited = rateLimitGuard(request, "books-download", RATE_LIMIT_PRESETS.booksDownload);
  if (limited) return limited;

  const { bookId } = await params;
  const book = BOOKS.find((candidate) => candidate.id === bookId);
  if (!book) {
    return NextResponse.json({ success: false, error: "Unknown book." }, { status: 404 });
  }

  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("order");
  const token = url.searchParams.get("token");
  const donationRef = url.searchParams.get("donation");

  let purchaserName = "Valued Partner";
  let orderNumberForCert = "N/A";
  let purchasedAt = new Date().toISOString();
  let quantity = 1;
  let authorized = false;

  try {
    if (orderNumber && token) {
      const order = await findBookOrder({ orderNumber });
      const item = order?.items.find(
        (candidate) => candidate.bookId === bookId && candidate.format === "PDF" && candidate.downloadToken === token
      );
      if (order && order.paymentStatus === "completed" && item) {
        authorized = true;
        purchaserName = order.customerName;
        orderNumberForCert = order.orderNumber;
        purchasedAt = order.completedAt ?? order.createdAt;
        quantity = item.quantity;
      }
    } else if (donationRef) {
      const donation = await findDonation({ referenceCode: donationRef });
      if (
        donation &&
        donation.status === "completed" &&
        donation.claimedMonthlyOffer &&
        book.isMonthlySpecialOffer
      ) {
        authorized = true;
        purchaserName = donation.donorName;
        orderNumberForCert = donation.referenceCode;
        purchasedAt = donation.completedAt ?? donation.createdAt;
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { success: false, error: "This download link is invalid, unpaid, or has expired." },
        { status: 403 }
      );
    }

    const pdfBytes = await generateBookCertificatePdf({
      book,
      item: { quantity, format: "PDF" },
      orderNumber: orderNumberForCert,
      purchaserName,
      purchasedAt,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${book.slug}.pdf"`,
        "Content-Length": String(pdfBytes.byteLength),
      },
    });
  } catch {
    return serverErrorResponse();
  }
}
