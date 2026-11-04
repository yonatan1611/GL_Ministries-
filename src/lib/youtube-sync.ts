import { SERMONS } from "@/data/ministry-content";
import { YOUTUBE_CHANNEL } from "@/data/social-media";
import { getYoutubeThumbnailUrl } from "@/lib/youtube";

/**
 * Pulls new uploads from the real `@AwareGospelLightEthiopia` YouTube
 * channel so the site can surface fresh content without a manual code
 * edit for every video. Two sources, in preference order:
 *  1. YouTube Data API v3 `playlistItems` against the channel's uploads
 *     playlist, when `YOUTUBE_API_KEY` is configured — full paginated
 *     history.
 *  2. The channel's public Atom/RSS feed (no key required) — the 15
 *     most recent uploads.
 *
 * Either way, results are deduplicated against the curated `SERMONS`
 * catalog by `youtubeId`, so already-reviewed bilingual entries are
 * never shadowed by a raw feed title.
 */

export interface YoutubeFeedEntry {
  videoId: string;
  title: string;
  publishedAt: string;
  thumbnailUrl: string;
  description?: string;
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

/** Minimal, purpose-built parser for YouTube's own Atom feed shape —
 *  not a general XML parser, just enough to read `<entry>` blocks. */
function parseAtomFeed(xml: string): YoutubeFeedEntry[] {
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
    });
  }

  return entries;
}

/** Fetches the public RSS feed — no API key needed, capped at the 15
 *  most recent uploads (YouTube's own feed limit). */
export async function fetchChannelFeedEntries(): Promise<YoutubeFeedEntry[]> {
  try {
    const response = await fetch(YOUTUBE_CHANNEL.rssFeedUrl, {
      next: { revalidate: 1800 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GLMinistriesSync/1.0)" },
    });
    if (!response.ok) return [];
    return parseAtomFeed(await response.text());
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

/** Full paginated upload history via the YouTube Data API v3 — only
 *  used when `YOUTUBE_API_KEY` is configured. The channel's uploads
 *  playlist id is its channel id with the `UC` prefix swapped for `UU`
 *  (a standard YouTube convention). */
async function fetchUploadsViaApi(apiKey: string): Promise<YoutubeFeedEntry[]> {
  const uploadsPlaylistId = `UU${YOUTUBE_CHANNEL.id.slice(2)}`;
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
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return entries;
}

export interface SyncedYoutubeFeed {
  /** Number of teachings already in the hand-curated, bilingual `SERMONS` catalog. */
  curatedCount: number;
  /** Real channel uploads not yet present in `SERMONS`, newest first. */
  newVideos: YoutubeFeedEntry[];
  source: "api" | "rss";
  fetchedAt: string;
}

/** Merges live channel uploads with the curated catalog, deduplicating
 *  by `youtubeId` — the point of contact for `GET /api/youtube`. */
export async function getSyncedYoutubeFeed(): Promise<SyncedYoutubeFeed> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const liveEntries = apiKey ? await fetchUploadsViaApi(apiKey) : await fetchChannelFeedEntries();

  const curatedIds = new Set(SERMONS.map((sermon) => sermon.youtubeId));
  const newVideos = liveEntries
    .filter((entry) => !curatedIds.has(entry.videoId))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    curatedCount: SERMONS.length,
    newVideos,
    source: apiKey ? "api" : "rss",
    fetchedAt: new Date().toISOString(),
  };
}
