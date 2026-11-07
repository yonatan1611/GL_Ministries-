import { NextResponse } from "next/server";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { markPrayerProcessedByStaff } from "@/lib/db";

/** Marks a prayer request as "Prayed Over by Pastoral Team" from the
 *  Admin Portal's Prayer Wall tab. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const updated = await markPrayerProcessedByStaff(id);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Unknown prayer request." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Marked as prayed over.", data: updated }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
