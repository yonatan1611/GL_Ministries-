"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useIsTouchDevice } from "@/components/react-bits/hooks";
import { cn } from "@/lib/utils";

export interface TiltedCardProps {
  children: ReactNode;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  className?: string;
}

/**
 * React Bits-style `TiltedCard`: a tactile 3D perspective tilt that
 * follows the cursor — book covers, leadership portraits. Desktop/mouse
 * only: on a touch screen there's no hover to track, so it's a plain
 * passthrough rather than wiring up pointless touch listeners.
 */
export function TiltedCard({ children, rotateAmplitude = 10, scaleOnHover = 1.04, className }: TiltedCardProps) {
  const isTouch = useIsTouchDevice();
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const scale = useSpring(useMotionValue(1), { stiffness: 200, damping: 20 });

  if (isTouch || prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * rotateAmplitude * 2);
    rotateX.set(-py * rotateAmplitude * 2);
    scale.set(scaleOnHover);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("[perspective:800px]", className)}
    >
      <motion.div style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}>{children}</motion.div>
    </motion.div>
  );
}
