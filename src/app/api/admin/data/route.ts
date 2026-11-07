import { NextResponse } from "next/server";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { getDb } from "@/lib/db";

/**
 * Single aggregated read for the whole Admin Portal — donations, book
 * orders, prayer requests (including confidential ones staff need to
 * see), subscribers, RSVPs/ministry actions, and the current book
 * catalog. The dataset is small (a JSON-file DB), so one combined read
 * is simpler and cheaper than six separate round-trips for six tabs.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "admin-data", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  try {
    const db = await getDb();
    return NextResponse.json(
      {
        success: true,
        message: "Admin snapshot.",
        data: {
          donations: db.donations,
          bookOrders: db.bookOrders,
          prayerRequests: db.prayerRequests,
          subscribers: db.subscribers,
          rsvps: db.rsvps,
          books: db.books,
          events: db.events,
          sermons: db.sermons,
        },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
