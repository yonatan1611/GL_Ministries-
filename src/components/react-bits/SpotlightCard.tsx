"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  spotlightColor?: string;
  className?: string;
}

/**
 * React Bits-style `SpotlightCard`: a soft glow follows the cursor
 * across the card surface. The glow position is written straight to a
 * CSS custom property on the DOM node in the mouse handler — never
 * through `setState` — so hovering never triggers a React re-render.
 * Extra div props (`onClick`, `role`, `aria-pressed`, ...) pass straight
 * through, since several call sites are clickable filter cards.
 */
export function SpotlightCard({
  children,
  spotlightColor = "rgba(37, 99, 235, 0.22)",
  className,
  ...rest
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--rb-spotlight-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--rb-spotlight-y", `${event.clientY - rect.top}px`);
    el.style.setProperty("--rb-spotlight-opacity", "1");
  }

  function handleMouseLeave() {
    ref.current?.style.setProperty("--rb-spotlight-opacity", "0");
  }

  return (
    <div
      {...rest}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={(event) => {
        const el = ref.current;
        const touch = event.touches[0];
        if (!el || !touch) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--rb-spotlight-x", `${touch.clientX - rect.left}px`);
        el.style.setProperty("--rb-spotlight-y", `${touch.clientY - rect.top}px`);
        el.style.setProperty("--rb-spotlight-opacity", "1");
      }}
      className={cn("relative isolate overflow-hidden", className)}
      style={{
        "--rb-spotlight-x": "50%",
        "--rb-spotlight-y": "50%",
        "--rb-spotlight-opacity": 0,
      } as React.CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: "var(--rb-spotlight-opacity)",
          background: `radial-gradient(240px circle at var(--rb-spotlight-x) var(--rb-spotlight-y), ${spotlightColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}
