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
