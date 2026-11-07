"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/components/react-bits/hooks";

export interface ClickSparkProps {
  children: ReactNode;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  /** Milliseconds the burst takes to fade out. */
  duration?: number;
  className?: string;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

/**
 * React Bits-style `ClickSpark`: a short royal-blue light burst radiates
 * from every click inside the wrapped region, drawn on a single
 * pointer-events-none `<canvas>` overlay via `requestAnimationFrame` —
 * the animation loop only runs while sparks are actually alive.
 */
export function ClickSpark({
  children,
  sparkColor = "#60A5FA",
  sparkSize = 10,
  sparkRadius = 20,
  sparkCount = 8,
  duration = 400,
  className,
}: ClickSparkProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const frameRef = useRef<number | null>(null);

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeCanvas, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const now = performance.now();
      sparksRef.current = sparksRef.current.filter((spark) => now - spark.startTime < duration);

      for (const spark of sparksRef.current) {
        const progress = (now - spark.startTime) / duration;
        const eased = 1 - Math.pow(1 - progress, 2);
        const length = sparkSize * (1 - eased * 0.4);
        const travelled = sparkRadius * eased;
        const x1 = spark.x + Math.cos(spark.angle) * travelled;
        const y1 = spark.y + Math.sin(spark.angle) * travelled;
        const x2 = spark.x + Math.cos(spark.angle) * (travelled + length);
        const y2 = spark.y + Math.sin(spark.angle) * (travelled + length);

        ctx!.strokeStyle = sparkColor;
        ctx!.globalAlpha = 1 - progress;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.moveTo(x1, y1);
        ctx!.lineTo(x2, y2);
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      frameRef.current = sparksRef.current.length > 0 ? requestAnimationFrame(draw) : null;
    }

    function handleClick(event: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const now = performance.now();
      for (let i = 0; i < sparkCount; i += 1) {
        sparksRef.current.push({ x, y, angle: (i / sparkCount) * Math.PI * 2, startTime: now });
      }
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(draw);
      }
    }

    const container = containerRef.current;
    container?.addEventListener("click", handleClick);
    return () => {
      container?.removeEventListener("click", handleClick);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, prefersReducedMotion]);

  return (
    <div ref={containerRef} className={className} style={{ position: "relative" }}>
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-50"
        />
      )}
      {children}
    </div>
  );
}
