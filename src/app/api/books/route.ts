import { NextResponse } from "next/server";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { listBooks } from "@/lib/db";

/**
 * Live book catalog — every price/monthly-offer-flag edit made in the
 * Admin Portal shows up here immediately. Public; the book store page
 * and the giving portal's partner-offer banner both read from it
 * instead of the static `BOOKS` import.
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
