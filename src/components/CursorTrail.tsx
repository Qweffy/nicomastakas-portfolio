"use client";

import { useEffect, useRef } from "react";

/**
 * A minimal accent-blue cursor trail. Canvas-based, pointer-events: none.
 * Off for touch/coarse pointers and when the OS asks for reduced motion.
 */
export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reduced || !finePointer) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const LIFE = 360; // ms a point stays in the trail
    const points: { x: number; y: number; t: number }[] = [];
    let raf = 0;
    let running = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const draw = () => {
      const now = performance.now();
      while (points.length && now - points[0]!.t > LIFE) points.shift();
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (points.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = "rgba(79, 140, 255, 0.5)";
        ctx.shadowBlur = 6;
        for (let i = 1; i < points.length; i++) {
          const p0 = points[i - 1]!;
          const p1 = points[i]!;
          const age = (now - p1.t) / LIFE; // 0 head, 1 tail
          const k = 1 - age;
          ctx.strokeStyle = `rgba(79, 140, 255, ${k * 0.55})`;
          ctx.lineWidth = k * 2.5;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
      }

      if (points.length) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };

    const onMove = (e: PointerEvent) => {
      points.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        pointerEvents: "none",
        mixBlendMode: "screen",
      }}
    />
  );
}
