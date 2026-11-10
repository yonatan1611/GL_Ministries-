import { NextResponse } from "next/server";
import { rateLimitGuard, readJsonBody, serverErrorResponse, validateBody } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { addBook, deleteBook, listBooks, updateBook } from "@/lib/db";
import { newBookSchema, updateBookFullSchema } from "@/lib/validations";

/**
 * Live book catalog — every price/description/cover-image/monthly-offer
 * edit made in the Admin Portal shows up here immediately. Public; the
 * book store page, homepage banners, and the giving portal's
 * partner-offer banner all read from it instead of the static `BOOKS`
 * import.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "books-read", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const books = await listBooks();
    return NextResponse.json({ success: true, message: "Book catalog.", data: { books } }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: adds a new book to the store. Checking "Feature this
 *  book as the Monthly Partner Special Offer" atomically unsets that
 *  flag on every other book first. */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(newBookSchema, parsed.body);
    if (!validated.ok) return validated.response;

    const data = validated.data;
    const book = await addBook({
      titleEn: data.titleEn,
      titleAm: data.titleAm || data.titleEn,
      authorEn: data.authorEn || "Apostle Daniel Makonnen",
      authorAm: data.authorAm || "ሐዋሪያው ዳንኤል መኮንን",
      coverImageUrl: data.coverImageUrl || undefined,
      priceUsdPrint: data.priceUsdPrint,
      priceUsdPdf: data.priceUsdPdf,
      pages: data.pages ?? 0,
      isbn: data.isbn ?? "",
      synopsisEn: data.synopsisEn,
      synopsisAm: data.synopsisAm || data.synopsisEn,
      topics: data.topics ?? [],
      isMonthlySpecialOffer: Boolean(data.isMonthlySpecialOffer),
      inStock: data.inStock ?? true,
    });
    return NextResponse.json({ success: true, message: "Book added.", data: book }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: updates an existing book's description, cover image,
 *  price, stock status, or Monthly Partner Offer flag. */
export async function PUT(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) return parsed.response;

  try {
    const validated = validateBody(updateBookFullSchema, parsed.body);
    if (!validated.ok) return validated.response;

    const { id, ...patch } = validated.data;
    const updated = await updateBook(id, patch);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Unknown book." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Book updated.", data: updated }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}

/** Admin-only: removes a book from the store catalog by `id` (query param). */
export async function DELETE(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing book id." }, { status: 400 });
  }

  try {
    const deleted = await deleteBook(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Unknown book." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Book deleted." }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
