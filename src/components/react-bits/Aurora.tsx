"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/react-bits/hooks";

export interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
}

const VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uBlend;
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    float wave1 = sin(uv.x * 3.1 + uTime) * 0.5 + 0.5;
    float wave2 = sin(uv.x * 5.3 - uTime * 1.3 + 2.0) * 0.5 + 0.5;
    float band = uv.y + (wave1 - 0.5) * uAmplitude * 0.5 + (wave2 - 0.5) * uAmplitude * 0.25;

    float t1 = smoothstep(0.0, uBlend, band);
    float t2 = smoothstep(0.3, 0.3 + uBlend, band);
    float t3 = smoothstep(0.6, 0.6 + uBlend, band);

    vec3 color = mix(uColor0, uColor1, t1);
    color = mix(color, uColor2, t2);
    color = mix(color, uColor3, t3);

    float fade = smoothstep(1.0, 0.15, uv.y);
    float glow = pow(1.0 - abs(uv.y - 0.45), 2.0) * 0.6;

    gl_FragColor = vec4(color * (0.55 + glow), fade * 0.9);
  }
`;

function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.repeat(2).slice(0, 6) : clean, 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

/**
 * React Bits-style `Aurora`: a flowing, multi-color light-band
 * background rendered with a single fullscreen WebGL fragment shader
 * via `ogl` — no particle system, so it stays cheap on mobile GPUs.
 * Sits absolutely positioned behind dark "stage" sections (Hero,
 * Salvation Banner, Monthly Offer) alongside the existing video/photo
 * layers, never above them.
 */
export function Aurora({
  colorStops = ["#091528", "#1B365D", "#2563EB", "#1E40AF"],
  amplitude = 1.1,
  blend = 0.55,
  speed = 0.6,
  className,
}: AuroraProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let raf = 0;

    import("ogl").then(({ Renderer, Program, Mesh, Triangle }) => {
      if (destroyed || !container) return;

      const renderer = new Renderer({ alpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio, 1.5) });
      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      container.appendChild(gl.canvas);

      const [c0, c1, c2, c3] = [
        colorStops[0] ?? "#091528",
        colorStops[1] ?? "#1B365D",
        colorStops[2] ?? "#2563EB",
        colorStops[3] ?? colorStops[2] ?? "#1E40AF",
      ].map(hexToRgb01);

      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uResolution: { value: [container.clientWidth, container.clientHeight] },
          uTime: { value: 0 },
          uAmplitude: { value: amplitude },
          uBlend: { value: blend },
          uColor0: { value: c0 },
          uColor1: { value: c1 },
          uColor2: { value: c2 },
          uColor3: { value: c3 },
        },
        transparent: true,
      });

      const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

      function resize() {
        if (!container) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        program.uniforms.uResolution.value = [container.clientWidth, container.clientHeight];
      }
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);

      function renderFrame(time: number) {
        program.uniforms.uTime.value = (time / 1000) * speed;
        renderer.render({ scene: mesh });
        if (!prefersReducedMotion) raf = requestAnimationFrame(renderFrame);
      }

      if (prefersReducedMotion) {
        renderFrame(0);
      } else {
        raf = requestAnimationFrame(renderFrame);
      }

      return () => {
        observer.disconnect();
        if (raf) cancelAnimationFrame(raf);
        gl.canvas.remove();
      };
    });

    return () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      if (container) container.innerHTML = "";
    };
  }, [colorStops, amplitude, blend, speed, prefersReducedMotion]);

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}
