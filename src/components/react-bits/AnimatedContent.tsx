"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface AnimatedContentProps {
  children: ReactNode;
  /** Pixels traveled during the entrance. */
  distance?: number;
  direction?: "vertical" | "horizontal";
  duration?: number;
  /** Stagger delay in seconds, for siblings rendered with increasing
   *  `delay` props (e.g. a card grid). */
  delay?: number;
  className?: string;
  /** Fraction of the element that must be visible before it animates. */
  threshold?: number;
}

/**
 * React Bits-style `AnimatedContent`: a generic scroll-triggered
 * glide-and-fade wrapper for sections, cards, and form containers.
 * Also covers the "FadeContent" use-case (pass `distance={0}`).
 */
export function AnimatedContent({
  children,
  distance = 20,
  direction = "vertical",
  duration = 0.6,
  delay = 0,
  className,
  threshold = 0.2,
}: AnimatedContentProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = direction === "vertical" ? { y: distance } : { x: distance };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
