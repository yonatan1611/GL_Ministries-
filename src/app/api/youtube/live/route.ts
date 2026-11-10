import { NextResponse } from "next/server";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { getLiveBroadcastStatus } from "@/lib/youtube-sync";

/**
 * Real "is either YouTube channel live right now" check, for the
 * Sermons page's Live Broadcast tab to poll. Public, read-only.
 *
 * Returns `source: "api"` with an authoritative `isLiveNow` (plus a
 * playable `embedUrl` when something is actually live) once
 * `YOUTUBE_API_KEY` is configured; returns `source: "schedule"` when
 * it isn't, so the client falls back to the existing fixed weekly
 * broadcast schedule instead of a false negative.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "youtube-live", RATE_LIMIT_PRESETS.liveCounters);
  if (limited) return limited;

  try {
    const status = await getLiveBroadcastStatus();
    return NextResponse.json({ success: true, data: status }, { status: 200 });
  } catch {
    return serverErrorResponse();
  }
}
