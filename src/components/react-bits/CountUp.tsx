"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

export interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  /** Thousands separator, e.g. "," for "100,000". */
  separator?: string;
  className?: string;
}

function formatValue(value: number, separator: string): string {
  if (!separator) return String(value);
  return value.toLocaleString("en-US").replace(/,/g, separator);
}

/**
 * React Bits-style `CountUp`: counts from `from` to `to` once the number
 * scrolls into view. Uses Framer Motion's spring-backed `animate()`
 * driving a plain `useState` tick rather than re-rendering per frame via
 * motion values bound to the DOM, since the value here is interpolated
 * into text content (year counts, branch counts), not a style prop.
 */
export function CountUp({
  from = 0,
  to,
  duration = 2,
  suffix = "",
  prefix = "",
  separator = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    if (prefersReducedMotion) {
      setValue(to);
      return;
    }
    const controls = animate(from, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, from, to, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatValue(value, separator)}
      {suffix}
    </span>
  );
}
