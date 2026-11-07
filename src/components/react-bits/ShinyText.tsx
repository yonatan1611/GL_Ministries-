"use client";

import { usePrefersReducedMotion } from "@/components/react-bits/hooks";
import { cn } from "@/lib/utils";

export interface ShinyTextProps {
  text: string;
  /** Seconds per sweep. */
  speed?: number;
  className?: string;
  /** Resting text color the glint sweeps across. */
  baseColor?: string;
  /** Color of the glint itself. */
  shineColor?: string;
}

/**
 * React Bits-style `ShinyText`: a soft light glint sweeps across a badge
 * or label on a loop, implemented as a CSS `background-clip: text`
 * gradient animation (see `.rb-shiny-sweep` in globals.css) rather than a
 * JS animation loop, so it costs nothing on the main thread.
 */
export function ShinyText({
  text,
  speed = 3,
  className,
  baseColor = "rgba(191, 219, 254, 0.85)",
  shineColor = "rgba(255, 255, 255, 0.95)",
}: ShinyTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className} style={{ color: baseColor }}>{text}</span>;
  }

  return (
    <span
      className={cn("rb-shiny-sweep", className)}
      style={{
        backgroundImage: `linear-gradient(120deg, ${baseColor} 40%, ${shineColor} 50%, ${baseColor} 60%)`,
        animationDuration: `${speed}s`,
      }}
    >
      {text}
    </span>
  );
}
