"use client";

import { useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface BlurTextProps {
  text: string;
  /** Split unit. Always use "words" for Amharic/Ethiopic strings so Fidel
   *  glyphs never get torn apart mid-ligature. */
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  /** Stagger between each word/letter, in ms. */
  delay?: number;
  /** Flat offset (ms) added before the first word starts — lets several
   *  `BlurText` instances in the same headline read as one continuous
   *  left-to-right reveal instead of all starting at once. */
  startDelay?: number;
  /** Per-word/letter transition duration, in seconds. */
  duration?: number;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

/**
 * React Bits-style `BlurText`: each word (or letter) blurs and slides into
 * focus in sequence. Animates once, on mount — the Hero H1 is above the
 * fold so a scroll-triggered variant isn't needed here.
 */
export function BlurText({
  text,
  animateBy = "words",
  direction = "top",
  delay = 80,
  startDelay = 0,
  duration = 0.5,
  className,
  as = "span",
}: BlurTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const Tag = motion[as];

  const units = useMemo(
    () => (animateBy === "words" ? text.split(/(\s+)/) : Array.from(text)),
    [text, animateBy]
  );

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const offset = direction === "top" ? -16 : 16;
  const variants: Variants = {
    hidden: { opacity: 0, filter: "blur(10px)", y: offset },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  };

  return (
    <Tag className={className} aria-label={text}>
      {units.map((unit, index) => (
        <motion.span
          key={`${unit}-${index}`}
          aria-hidden="true"
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{ duration, delay: (startDelay + index * delay) / 1000, ease: "easeOut" }}
          style={{ display: "inline-block", whiteSpace: unit.trim() === "" ? "pre" : "normal" }}
        >
          {unit}
        </motion.span>
      ))}
    </Tag>
  );
}
