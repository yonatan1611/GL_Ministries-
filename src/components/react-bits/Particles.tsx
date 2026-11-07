"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/react-bits/hooks";

export interface ParticlesProps {
  particleColors?: string[];
  particleCount?: number;
  speed?: number;
  moveParticlesOnHover?: boolean;
  className?: string;
}

const VERTEX_SHADER = `
  attribute vec2 seed;
  attribute float colorIndex;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHoverStrength;
  varying float vColorIndex;
  varying float vTwinkle;

  void main() {
    vec2 pos = seed;
    pos.x += sin(uTime * 0.3 + seed.y * 6.2831) * 0.12;
    pos.y += cos(uTime * 0.25 + seed.x * 6.2831) * 0.12;

    vec2 toMouse = pos - uMouse;
    float dist = length(toMouse);
    float push = smoothstep(0.35, 0.0, dist) * uHoverStrength;
    pos += normalize(toMouse + 0.0001) * push * 0.15;

    vTwinkle = sin(uTime * 1.6 + seed.x * 40.0) * 0.5 + 0.5;
    vColorIndex = colorIndex;
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = 2.2 + vTwinkle * 2.0;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying float vColorIndex;
  varying float vTwinkle;

  void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float d = length(centered);
    float alpha = smoothstep(0.5, 0.0, d);

    vec3 color = uColor0;
    if (vColorIndex > 1.5) color = uColor2;
    else if (vColorIndex > 0.5) color = uColor1;

    gl_FragColor = vec4(color, alpha * (0.35 + vTwinkle * 0.45));
  }
`;

function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.repeat(2).slice(0, 6) : clean, 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

/**
 * React Bits-style `Particles`: soft floating light specks rendered as a
 * single `gl.POINTS` draw call via `ogl` — one draw call regardless of
 * `particleCount`, so it stays cheap even with hover-tracking enabled.
 */
export function Particles({
  particleColors = ["#60A5FA", "#93C5FD", "#FFFFFF"],
  particleCount = 60,
  speed = 0.15,
  moveParticlesOnHover = true,
  className,
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) return;

    let destroyed = false;
    let raf = 0;
    let mouse: [number, number] = [2, 2];

    import("ogl").then(({ Renderer, Program, Mesh, Geometry }) => {
      if (destroyed || !container) return;

      const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 1.5) });
      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";
      container.appendChild(gl.canvas);

      const seed = new Float32Array(particleCount * 2);
      const colorIndex = new Float32Array(particleCount);
      for (let i = 0; i < particleCount; i += 1) {
        seed[i * 2] = Math.random() * 2 - 1;
        seed[i * 2 + 1] = Math.random() * 2 - 1;
        colorIndex[i] = Math.floor(Math.random() * 3);
      }

      const geometry = new Geometry(gl, {
        seed: { size: 2, data: seed },
        colorIndex: { size: 1, data: colorIndex },
      });

      const [col0, col1, col2] = [
        particleColors[0] ?? "#60A5FA",
        particleColors[1] ?? "#93C5FD",
        particleColors[2] ?? "#FFFFFF",
      ].map(hexToRgb01);

      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: mouse },
          uHoverStrength: { value: moveParticlesOnHover ? 1 : 0 },
          uColor0: { value: col0 },
          uColor1: { value: col1 },
          uColor2: { value: col2 },
        },
        transparent: true,
        depthTest: false,
      });

      const mesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });

      function resize() {
        if (!container) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);

      function handlePointerMove(event: PointerEvent) {
        const rect = container!.getBoundingClientRect();
        mouse = [
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -(((event.clientY - rect.top) / rect.height) * 2 - 1),
        ];
      }
      if (moveParticlesOnHover) container.addEventListener("pointermove", handlePointerMove);

      function renderFrame(time: number) {
        program.uniforms.uTime.value = (time / 1000) * speed * 4;
        program.uniforms.uMouse.value = mouse;
        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(renderFrame);
      }
      raf = requestAnimationFrame(renderFrame);

      return () => {
        observer.disconnect();
        container?.removeEventListener("pointermove", handlePointerMove);
        if (raf) cancelAnimationFrame(raf);
        gl.canvas.remove();
      };
    });

    return () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      if (container) container.innerHTML = "";
    };
  }, [particleColors, particleCount, speed, moveParticlesOnHover, prefersReducedMotion]);

  return <div ref={containerRef} aria-hidden="true" className={className} />;
}
