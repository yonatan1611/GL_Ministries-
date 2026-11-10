import { NextResponse } from "next/server";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { syncNewSermonsIntoCatalog } from "@/lib/youtube-sync";

/**
 * Admin Portal's one-click "Sync Latest Videos from Both Channels" —
 * the manually-triggered counterpart to the scheduled
 * `GET /api/cron/sync-youtube-videos`; both call the same
 * `syncNewSermonsIntoCatalog()` so staff can force an immediate sync
 * without waiting for the next cron tick.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  try {
    const { added, source } = await syncNewSermonsIntoCatalog();
    return NextResponse.json(
      {
        success: true,
        message: added.length > 0 ? `${added.length} new video(s) synced.` : "Already up to date.",
        data: { added, source },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
