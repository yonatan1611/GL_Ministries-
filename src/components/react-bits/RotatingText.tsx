"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface RotatingTextProps {
  texts: string[];
  /** Milliseconds each phrase stays on screen. */
  rotationInterval?: number;
  className?: string;
}

/**
 * React Bits-style `RotatingText`: cycles through a list of short
 * phrases (ministry pillars, service highlights) with a vertical
 * slide + fade crossfade.
 */
export function RotatingText({ texts, rotationInterval = 3200, className }: RotatingTextProps) {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (texts.length < 2 || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % texts.length);
    }, rotationInterval);
    return () => clearInterval(timer);
  }, [texts.length, rotationInterval, prefersReducedMotion]);

  const current = texts[index] ?? texts[0] ?? "";

  if (prefersReducedMotion) {
    return <span className={className}>{current}</span>;
  }

  return (
    <span className={cn("relative inline-grid overflow-hidden align-bottom", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="col-start-1 row-start-1"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
