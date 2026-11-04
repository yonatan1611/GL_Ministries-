import { NextResponse } from "next/server";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { getSyncedYoutubeFeed } from "@/lib/youtube-sync";

/**
 * Exposes the live-synced YouTube channel feed so client components can
 * refresh or discover new uploads on demand, without waiting on a code
 * change to the curated `SERMONS` catalog.
 */
export async function GET(request: Request) {
  const limited = rateLimitGuard(request, "youtube-sync", RATE_LIMIT_PRESETS.youtubeSync);
  if (limited) return limited;

  try {
    const feed = await getSyncedYoutubeFeed();
    return NextResponse.json(
      {
        success: true,
        message: `${feed.newVideos.length} new video(s) found beyond the curated catalog.`,
        data: feed,
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
