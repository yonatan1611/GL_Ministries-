"use client";

import { useState } from "react";
import { MINISTRY_IMAGES } from "@/data/social-media";
import { cn } from "@/lib/utils";

/**
 * Book cover renderer for the one image source in this codebase that
 * is genuinely arbitrary: an Admin Portal upload (`/uploads/books/...`
 * or a `data:` URI fallback) or a staff-pasted external URL. Unlike
 * `MinistryImage`, this deliberately skips `next/image` — its Vercel
 * image optimizer requires every remote host to be allow-listed in
 * `next.config.ts`'s `remotePatterns` (wrong fit for admin-entered
 * URLs) and doesn't render `data:` URIs at all. A plain `<img>` with
 * the same load-failure fallback handles all three sources uniformly.
 */
export function BookCoverImage({
  src,
  alt,
  fill = false,
  className,
}: {
  src: string;
  alt: string;
  /** Matches `next/image`'s `fill` convention: absolutely positions the
   *  image to cover its (already `relative`, sized) parent. */
  fill?: boolean;
  className?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
      onError={() => {
        if (currentSrc !== MINISTRY_IMAGES.localFallback) setCurrentSrc(MINISTRY_IMAGES.localFallback);
      }}
    />
  );
}
