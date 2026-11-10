import { NextResponse } from "next/server";
import { serverErrorResponse } from "@/lib/api/guards";
import { verifyCronRequest } from "@/lib/cronAuth";
import { syncNewSermonsIntoCatalog } from "@/lib/youtube-sync";

/**
 * Scheduled counterpart to the Admin Portal's manual "Sync Latest
 * Videos" button — see `vercel.json`'s `crons` entry for the schedule.
 * Vercel Cron calls this on its own, authenticated by `CRON_SECRET`
 * (see `src/lib/cronAuth.ts`), so a new upload on either YouTube
 * channel reaches the public Sermons page without anyone having to
 * open the Admin Portal.
 *
 * No rate limiting here (unlike every other route) — the endpoint is
 * already closed to the public by `verifyCronRequest`, and a sliding
 * window keyed by client IP is the wrong model for a single trusted
 * caller hitting this on a fixed schedule.
 */
export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
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
