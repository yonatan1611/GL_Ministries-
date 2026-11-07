"use client";

import { useMemo } from "react";
import { usePrefersReducedMotion } from "@/components/react-bits/hooks";

export interface LightRaysProps {
  color?: string;
  rayCount?: number;
  className?: string;
}

/**
 * React Bits-style `LightRays`: soft "god ray" beams fanning down from a
 * single source, for the stage-lighting feel behind dark sanctuary
 * sections.
 *
 * Implementation note: unlike `Aurora`/`Particles`, this one is built
 * with pure CSS (conic gradient beams + blur + a slow rotation/opacity
 * drift) rather than a third stacked WebGL canvas — the Hero already
 * layers a video, a Ken Burns photo crossfade, and the `Aurora` shader
 * behind it, and a second GPU context there bought nothing visually
 * that CSS couldn't deliver more cheaply.
 */
export function LightRays({ color = "#60A5FA", rayCount = 6, className }: LightRaysProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  const rays = useMemo(
    () =>
      Array.from({ length: rayCount }, (_, index) => ({
        angle: (index - (rayCount - 1) / 2) * (10 + index % 2),
        delay: index * 0.6,
        width: 10 + ((index * 7) % 14),
      })),
    [rayCount]
  );

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ mixBlendMode: "screen", overflow: "hidden" }}
    >
      <div className="relative h-full w-full">
        {rays.map((ray, index) => (
          <div
            key={index}
            className={prefersReducedMotion ? undefined : "rb-light-ray"}
            style={{
              position: "absolute",
              top: "-10%",
              left: "50%",
              width: `${ray.width}%`,
              height: "140%",
              transformOrigin: "top center",
              transform: `translateX(-50%) rotate(${ray.angle}deg)`,
              background: `linear-gradient(to bottom, ${color}55, transparent 70%)`,
              filter: "blur(18px)",
              animationDelay: `${ray.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
