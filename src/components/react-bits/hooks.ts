"use client";

import { useEffect, useState } from "react";

/** True once the browser confirms `prefers-reduced-motion: reduce`. Every
 *  React Bits effect in this folder checks this before animating. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    function onChange(event: MediaQueryListEvent) {
      setReduced(event.matches);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** True on touch-only viewports (`hover: none`) — used to skip
 *  mouse-tracking effects (Magnet, 3D tilt) that have no meaning on a
 *  phone and would otherwise just burn battery. */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: none), (pointer: coarse)");
    setIsTouch(query.matches);
    function onChange(event: MediaQueryListEvent) {
      setIsTouch(event.matches);
    }
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return isTouch;
}
