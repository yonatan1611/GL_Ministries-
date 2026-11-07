"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/components/react-bits/hooks";
import { cn } from "@/lib/utils";

export interface GradientTextProps {
  children: ReactNode;
  colors?: string[];
  /** Seconds per full pan cycle. */
  animationSpeed?: number;
  className?: string;
  /** Fade/scale in on mount, e.g. when used inline inside a hero
   *  headline alongside `BlurText`. */
  animateIn?: boolean;
}

/**
 * React Bits-style `GradientText`: a slow-panning multi-color gradient
 * clipped to the text, for a single highlighted phrase inside a
 * headline (e.g. "Washington, D.C." or "Accept Jesus Today!").
 */
export function GradientText({
  children,
  colors = ["#60A5FA", "#FFFFFF", "#38BDF8", "#60A5FA"],
  animationSpeed = 6,
  className,
  animateIn = false,
}: GradientTextProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className} style={{ color: colors[0] }}>{children}</span>;
  }

  const style = {
    backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  if (!animateIn) {
    return (
      <span className={cn("rb-gradient-text", className)} style={style}>
        {children}
      </span>
    );
  }

  return (
    <motion.span
      className={cn("rb-gradient-text", className)}
      style={style}
      initial={{ opacity: 0, filter: "blur(10px)", y: -16 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.span>
  );
}
