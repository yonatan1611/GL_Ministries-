import { SERMONS } from "@/data/ministry-content";
import { DC_YOUTUBE_CHANNEL, ETHIOPIA_YOUTUBE_CHANNEL } from "@/data/social-media";
import { findSermonByYoutubeId, insertSermon } from "@/lib/db";
import { env } from "@/lib/env.server";
import { slugify } from "@/lib/utils";
import { getYoutubeAutoplayEmbedUrl, getYoutubeThumbnailUrl, getYoutubeWatchUrl } from "@/lib/youtube";
import type { Sermon } from "@/types/ministry";

/**
 * Pulls new uploads from the ministry's two real YouTube channels so
 * the site can surface fresh content without a manual code edit for
 * every video:
 *  1. Gospel Light Church, DC (`@gospellightchurchdc6393`,
 *     `channelSource: "DC"`) — the primary North American channel.
 *  2. Aware Gospel Light Ethiopia (`@AwareGospelLightEthiopia`,
 *     `channelSource: "ETHIOPIA"`) — the secondary Addis Ababa HQ
 *     channel.
 *
 * Each channel is read via, in preference order:
 *  a. YouTube Data API v3 `playlistItems` against the channel's uploads
 *     playlist, when `YOUTUBE_API_KEY` is configured — full paginated
 *     history.
 *  b. The channel's public Atom/RSS feed (no key required) — the 15
 *     most recent uploads.
 *
 * Both channels' results are fetched in parallel, merged with DC first,
 * and deduplicated against the curated `SERMONS` catalog by
 * `youtubeId`, so already-reviewed bilingual entries are never
 * shadowed by a raw feed title.
 */

export interface YoutubeFeedEntry {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  description?: string;
  channelSource: Sermon["channelSource"];
}

const XML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

function decodeXmlEntities(text: string): string {
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (match) => XML_ENTITIES[match] ?? match);
}

interface SyncChannelConfig {
  id: string;
  rssFeedUrl: string;
  channelSource: Sermon["channelSource"];
}

/** Both official channels, DC first — the merge/dedupe order below
 *  preserves this so DC uploads are preferred when the same video id
 *  somehow appeared in both (it never should, but dedupe is id-based
 *  either way). */
const SYNC_CHANNELS: SyncChannelConfig[] = [
  { id: DC_YOUTUBE_CHANNEL.id, rssFeedUrl: DC_YOUTUBE_CHANNEL.rssFeedUrl, channelSource: "DC" },
  { id: ETHIOPIA_YOUTUBE_CHANNEL.id, rssFeedUrl: ETHIOPIA_YOUTUBE_CHANNEL.rssFeedUrl, channelSource: "ETHIOPIA" },
];

/** Minimal, purpose-built parser for YouTube's own Atom feed shape —
 *  not a general XML parser, just enough to read `<entry>` blocks. */
function parseAtomFeed(xml: string, channelSource: Sermon["channelSource"]): YoutubeFeedEntry[] {
  const entries: YoutubeFeedEntry[] = [];
  const blocks = xml.split("<entry>").slice(1);

  for (const block of blocks) {
    const videoId = block.match(/<yt:videoId>([^<]*)<\/yt:videoId>/)?.[1];
    const title = block.match(/<title>([^<]*)<\/title>/)?.[1];
    if (!videoId || !title) continue;

    const published = block.match(/<published>([^<]*)<\/published>/)?.[1];
    const thumbnailUrl = block.match(/<media:thumbnail url="([^"]*)"/)?.[1];
    const description = block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1];

    entries.push({
      videoId,
      title: decodeXmlEntities(title).trim(),
      publishedAt: published ?? new Date().toISOString(),
      thumbnailUrl: thumbnailUrl ?? getYoutubeThumbnailUrl(videoId),
      description: description ? decodeXmlEntities(description).trim() : undefined,
      channelSource,
    });
  }

  return entries;
}

/** Fetches one channel's public RSS feed — no API key needed, capped
 *  at the 15 most recent uploads (YouTube's own feed limit). */
async function fetchChannelFeedEntries(channel: SyncChannelConfig): Promise<YoutubeFeedEntry[]> {
  try {
    const response = await fetch(channel.rssFeedUrl, {
      next: { revalidate: 1800 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GLMinistriesSync/1.0)" },
    });
    if (!response.ok) return [];
    return parseAtomFeed(await response.text(), channel.channelSource);
  } catch {
    return [];
  }
}

interface YoutubePlaylistItemsResponse {
  items?: {
    snippet?: {
      resourceId?: { videoId?: string };
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: { high?: { url?: string }; default?: { url?: string } };
    };
  }[];
  nextPageToken?: string;
}

/** Full paginated upload history for one channel via the YouTube Data
 *  API v3 — only used when `YOUTUBE_API_KEY` is configured. The
 *  channel's uploads playlist id is its channel id with the `UC`
 *  prefix swapped for `UU` (a standard YouTube convention). */
async function fetchUploadsViaApi(apiKey: string, channel: SyncChannelConfig): Promise<YoutubeFeedEntry[]> {
  const uploadsPlaylistId = `UU${channel.id.slice(2)}`;
  const entries: YoutubeFeedEntry[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("playlistId", uploadsPlaylistId);
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("key", apiKey);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!response.ok) break;
    const data = (await response.json()) as YoutubePlaylistItemsResponse;

    for (const item of data.items ?? []) {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId || !item.snippet?.title) continue;
      entries.push({
        videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt ?? new Date().toISOString(),
        thumbnailUrl: item.snippet.thumbnails?.high?.url ?? getYoutubeThumbnailUrl(videoId),
        description: item.snippet.description,
        channelSource: channel.channelSource,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return entries;
}

export interface SyncedYoutubeFeed {
  /** Number of teachings already in the hand-curated, bilingual `SERMONS` catalog. */
  curatedCount: number;
  /** Real uploads from both channels not yet present in `SERMONS`, DC
   *  first, then newest first within each channel. */
  newVideos: YoutubeFeedEntry[];
  source: "api" | "rss";
  fetchedAt: string;
}

/** Merges live uploads from both official channels (DC primary,
 *  Ethiopia secondary — fetched in parallel) with the curated catalog,
 *  deduplicating by `youtubeId` — the point of contact for
 *  `GET /api/youtube`. */
export async function getSyncedYoutubeFeed(): Promise<SyncedYoutubeFeed> {
  const apiKey = env.YOUTUBE_API_KEY;
  const perChannelEntries = await Promise.all(
    SYNC_CHANNELS.map((channel) =>
      apiKey ? fetchUploadsViaApi(apiKey, channel) : fetchChannelFeedEntries(channel)
    )
  );
  const liveEntries = perChannelEntries.flat();

  const curatedIds = new Set(SERMONS.map((sermon) => sermon.youtubeId));
  const seenIds = new Set<string>();
  const newVideos = liveEntries.filter((entry) => {
    if (curatedIds.has(entry.videoId) || seenIds.has(entry.videoId)) return false;
    seenIds.add(entry.videoId);
    return true;
  });

  return {
    curatedCount: SERMONS.length,
    newVideos,
    source: apiKey ? "api" : "rss",
    fetchedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Auto-publish: persisting new uploads into the live `sermons` catalog
// ---------------------------------------------------------------------------

export interface SyncSermonsResult {
  added: Sermon[];
  source: "api" | "rss";
}

/** Fetches both channels' feeds and inserts any video not already in
 *  the live catalog — the one piece of work shared by the Admin
 *  Portal's manual "Sync Latest Videos" button (`POST /api/sermons/sync`)
 *  and the scheduled `GET /api/cron/sync-youtube-videos` cron job, so a
 *  new upload reaches the public Sermons page without anyone having to
 *  click anything. */
export async function syncNewSermonsIntoCatalog(): Promise<SyncSermonsResult> {
  const feed = await getSyncedYoutubeFeed();

  const added: Sermon[] = [];
  for (const entry of feed.newVideos) {
    if (await findSermonByYoutubeId(entry.videoId)) continue;
    const channelHandle =
      entry.channelSource === "DC" ? DC_YOUTUBE_CHANNEL.handle : ETHIOPIA_YOUTUBE_CHANNEL.handle;
    const sermon = await insertSermon({
      slug: slugify(entry.title),
      titleEn: entry.title,
      titleAm: entry.title,
      speakerEn: channelHandle,
      speakerAm: channelHandle,
      channelSource: entry.channelSource,
      topic: "New Upload",
      yearLabel: String(new Date(entry.publishedAt).getFullYear()),
      youtubeId: entry.videoId,
      summaryEn: entry.description?.slice(0, 600) ?? "",
      summaryAm: "",
    });
    added.push(sermon);
  }

  return { added, source: feed.source };
}

// ---------------------------------------------------------------------------
// Real live-stream detection
// ---------------------------------------------------------------------------

export interface LiveBroadcastStatus {
  isLiveNow: boolean;
  /** `"api"` means this is a real, authoritative answer from YouTube
   *  right now. `"schedule"` means no `YOUTUBE_API_KEY` is configured,
   *  so the caller should fall back to the fixed weekly clock schedule
   *  in `broadcastSchedule.ts` instead — this function deliberately
   *  never guesses when it can't actually check. */
  source: "api" | "schedule";
  channelSource?: Sermon["channelSource"];
  videoId?: string;
  title?: string;
  thumbnailUrl?: string;
  watchUrl?: string;
  embedUrl?: string;
}

interface YoutubeSearchResponse {
  items?: {
    id?: { videoId?: string };
    snippet?: { title?: string; thumbnails?: { high?: { url?: string } } };
  }[];
}

/** Asks the YouTube Data API whether this specific channel has a video
 *  live right now (`eventType=live`) — the only way to actually know,
 *  as opposed to assuming from a published schedule. Cached 60s so a
 *  client polling every 30-60s for the homepage/sermons "LIVE NOW"
 *  badge doesn't multiply API quota use per visitor. */
async function fetchChannelLiveVideo(apiKey: string, channel: SyncChannelConfig): Promise<YoutubeFeedEntry | null> {
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("channelId", channel.id);
    url.searchParams.set("eventType", "live");
    url.searchParams.set("type", "video");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!response.ok) return null;
    const data = (await response.json()) as YoutubeSearchResponse;
    const item = data.items?.[0];
    const videoId = item?.id?.videoId;
    if (!videoId || !item?.snippet?.title) return null;

    return {
      videoId,
      title: item.snippet.title,
      publishedAt: new Date().toISOString(),
      thumbnailUrl: item.snippet.thumbnails?.high?.url ?? getYoutubeThumbnailUrl(videoId),
      channelSource: channel.channelSource,
    };
  } catch {
    return null;
  }
}

/** Real-time "is either channel live right now" check — DC checked
 *  first, Ethiopia as a fallback, matching the same preference order
 *  as the upload sync. Requires `YOUTUBE_API_KEY`; without it, returns
 *  `{ isLiveNow: false, source: "schedule" }` so the caller (currently
 *  `GET /api/youtube/live`) knows to fall back to the clock-schedule
 *  heuristic instead of reporting a false negative. */
export async function getLiveBroadcastStatus(): Promise<LiveBroadcastStatus> {
  const apiKey = env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return { isLiveNow: false, source: "schedule" };
  }

  const [dcLive, ethiopiaLive] = await Promise.all(
    SYNC_CHANNELS.map((channel) => fetchChannelLiveVideo(apiKey, channel))
  );
  const live = dcLive ?? ethiopiaLive;

  if (!live) {
    return { isLiveNow: false, source: "api" };
  }

  return {
    isLiveNow: true,
    source: "api",
    channelSource: live.channelSource,
    videoId: live.videoId,
    title: live.title,
    thumbnailUrl: live.thumbnailUrl,
    watchUrl: getYoutubeWatchUrl(live.videoId),
    embedUrl: getYoutubeAutoplayEmbedUrl(live.videoId),
  };
}
