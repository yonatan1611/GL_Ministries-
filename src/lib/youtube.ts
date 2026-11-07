/** Pure URL builders for a YouTube video id — kept in one place so the
 *  sermon catalog, the media theater, and the channel-sync API all
 *  derive the same URLs instead of storing redundant copies. */

export function getYoutubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function getYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`;
}

export function getYoutubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Muted, autoplaying, looping ambient background embed — used for the
 *  homepage hero's worship-video backdrop. `playlistIds` (primary id
 *  first) makes YouTube loop across all of them instead of restarting
 *  the same single video. */
export function getYoutubeBackgroundEmbedUrl(primaryId: string, playlistIds: string[] = [primaryId]): string {
  const playlist = playlistIds.join(",");
  return `https://www.youtube-nocookie.com/embed/${primaryId}?autoplay=1&mute=1&loop=1&playlist=${playlist}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
}

/** Full, unmuted, autoplaying embed for a video opened deliberately by
 *  the visitor (a "Watch" button/modal), as opposed to the muted
 *  ambient background embed above. */
export function getYoutubeAutoplayEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

/** Pulls an 11-character video id out of a raw id or any common
 *  YouTube URL shape (`watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`)
 *  — used by the Admin Portal's "add a sermon by URL" form, so staff
 *  can paste whatever link they have. */
export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.slice(1).split("/")[0];
      return id && /^[\w-]{11}$/.test(id) ? id : null;
    }
    const vParam = url.searchParams.get("v");
    if (vParam && /^[\w-]{11}$/.test(vParam)) return vParam;

    const pathMatch = url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/);
    if (pathMatch) return pathMatch[1]!;
  } catch {
    return null;
  }
  return null;
}

export interface YoutubeOEmbedResult {
  title: string;
  authorName: string;
}

/** YouTube's official, key-free oEmbed endpoint — a sanctioned way to
 *  get a public video's title/channel name for a given URL, not a
 *  scrape of any internal API. Used to auto-fill the Admin Portal's
 *  add-sermon form when staff only paste a link. */
export async function fetchYoutubeOEmbed(videoId: string): Promise<YoutubeOEmbedResult | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(getYoutubeWatchUrl(videoId))}&format=json`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) return null;
    const data = (await response.json()) as { title?: string; author_name?: string };
    if (!data.title) return null;
    return { title: data.title, authorName: data.author_name ?? "Gospel Light Ministries" };
  } catch {
    return null;
  }
}
