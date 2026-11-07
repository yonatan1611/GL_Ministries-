"use client";

import { useMemo } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export interface SplitTextProps {
  text: string;
  /** Always "words" for Amharic/Ethiopic text — see BlurText. */
  animateBy?: "words" | "letters";
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  delay?: number;
}

/**
 * React Bits-style `SplitText`: word-by-word (or letter-by-letter) rise +
 * fade, triggered once when the heading scrolls into view — used for
 * section headlines further down each page, as opposed to `BlurText`'s
 * above-the-fold, animate-on-mount hero treatment.
 */
export function SplitText({ text, animateBy = "words", className, as = "span", delay = 40 }: SplitTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const Tag = motion[as];

  const units = useMemo(
    () => (animateBy === "words" ? text.split(/(\s+)/) : Array.from(text)),
    [text, animateBy]
  );

  if (prefersReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const variants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Tag className={className} aria-label={text}>
      {units.map((unit, index) => (
        <motion.span
          key={`${unit}-${index}`}
          aria-hidden="true"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={variants}
          transition={{ duration: 0.45, delay: (index * delay) / 1000, ease: "easeOut" }}
          style={{ display: "inline-block", whiteSpace: unit.trim() === "" ? "pre" : "normal" }}
        >
          {unit}
        </motion.span>
      ))}
    </Tag>
  );
}
