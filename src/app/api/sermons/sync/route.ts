import { NextResponse } from "next/server";
import { rateLimitGuard, serverErrorResponse } from "@/lib/api/guards";
import { RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { hasAdminSession } from "@/lib/adminAuth";
import { findSermonByYoutubeId, insertSermon } from "@/lib/db";
import { getSyncedYoutubeFeed } from "@/lib/youtube-sync";
import { YOUTUBE_CHANNEL } from "@/data/social-media";
import { slugify } from "@/lib/utils";

/**
 * Admin Portal's one-click "Sync Latest Videos from YouTube" — pulls
 * real uploads from the channel (via `getSyncedYoutubeFeed`, already
 * deduplicated against the curated `SERMONS` catalog) and inserts any
 * not already in the live catalog. New entries land under the "New
 * Upload" topic with the channel handle as speaker — honest defaults,
 * since the feed doesn't give per-video speaker/topic — and the
 * office can re-sync any time new videos go up.
 */
export async function POST(request: Request) {
  const limited = rateLimitGuard(request, "admin-action", RATE_LIMIT_PRESETS.adminAction);
  if (limited) return limited;

  if (!(await hasAdminSession())) {
    return NextResponse.json({ success: false, error: "Not signed in." }, { status: 401 });
  }

  try {
    const feed = await getSyncedYoutubeFeed();

    const added = [];
    for (const entry of feed.newVideos) {
      if (await findSermonByYoutubeId(entry.videoId)) continue;
      const sermon = await insertSermon({
        slug: slugify(entry.title),
        titleEn: entry.title,
        titleAm: entry.title,
        speakerEn: YOUTUBE_CHANNEL.handle,
        speakerAm: YOUTUBE_CHANNEL.handle,
        topic: "New Upload",
        yearLabel: String(new Date(entry.publishedAt).getFullYear()),
        youtubeId: entry.videoId,
        summaryEn: entry.description?.slice(0, 600) ?? "",
        summaryAm: "",
      });
      added.push(sermon);
    }

    return NextResponse.json(
      {
        success: true,
        message: added.length > 0 ? `${added.length} new video(s) synced.` : "Already up to date.",
        data: { added, source: feed.source },
      },
      { status: 200 }
    );
  } catch {
    return serverErrorResponse();
  }
}
