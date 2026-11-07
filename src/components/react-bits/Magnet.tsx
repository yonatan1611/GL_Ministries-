"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useIsTouchDevice, usePrefersReducedMotion } from "@/components/react-bits/hooks";

export interface MagnetProps {
  children: ReactNode;
  /** Distance from the element (px) at which the pull starts. */
  padding?: number;
  magnetStrength?: number;
  className?: string;
}

/**
 * React Bits-style `Magnet`: nudges its content toward the cursor as it
 * approaches, desktop-only — pointless (and just wasted listeners) on a
 * touch screen, so it's a plain passthrough there.
 */
export function Magnet({ children, padding = 40, magnetStrength = 3, className }: MagnetProps) {
  const isTouch = useIsTouchDevice();
  const prefersReducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  if (isTouch || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = event.clientX - centerX;
    const distanceY = event.clientY - centerY;
    const distance = Math.hypot(distanceX, distanceY);
    const activeRange = Math.max(rect.width, rect.height) / 2 + padding;

    if (distance < activeRange) {
      setOffset({ x: distanceX / magnetStrength, y: distanceY / magnetStrength });
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
}
