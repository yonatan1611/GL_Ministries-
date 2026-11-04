"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { MINISTRY_IMAGES } from "@/data/social-media";

interface MinistryImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string;
  /** Shown instead if `src` (an external, ministry-hosted asset we
   *  don't control) is slow, offline, or errors. Defaults to the local
   *  ministry logo so a broken third-party host never leaves blank
   *  space on the page. */
  fallbackSrc?: string;
}

/**
 * Resilient wrapper around `next/image` for authentic ministry photos
 * hotlinked from `glministries.org`, YouTube thumbnails, and Facebook —
 * hosts we don't control. Swaps to a local fallback on load failure
 * instead of showing a broken image icon.
 */
export function MinistryImage({ src, fallbackSrc = MINISTRY_IMAGES.localFallback, alt, ...props }: MinistryImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
