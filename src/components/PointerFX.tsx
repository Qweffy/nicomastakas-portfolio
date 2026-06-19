"use client";

import { useEffect } from "react";

/**
 * Pointer-driven polish: magnetic big CTAs, a subtle 3D tilt on cards, and a
 * click ripple. Off for touch/coarse pointers and reduced-motion.
 */
export function PointerFX() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let tilted: HTMLElement | null = null;

    const clearTilt = () => {
      if (tilted) {
        tilted.style.transform = "";
        tilted = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      // magnetic big CTAs
      document.querySelectorAll<HTMLElement>(".nm-btn--lg").forEach((btn) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const radius = r.width + 60;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const k = 0.28 * (1 - dist / radius);
          btn.style.transform = `translate(${(dx * k).toFixed(1)}px, ${(dy * k).toFixed(1)}px)`;
        } else if (btn.style.transform) {
          btn.style.transform = "";
        }
      });

      // subtle tilt on the hovered card
      const target = e.target as Element | null;
      const card = target?.closest<HTMLElement>(".nm-case, .nm-syscard") ?? null;
      if (card !== tilted) clearTilt();
      if (card) {
        tilted = card;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 4).toFixed(2)}deg) translateY(-4px)`;
      }
    };

    const onDown = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest(".nm-btn");
      if (!btn) return;
      const span = document.createElement("span");
      span.className = "nm-ripple";
      const size = 120;
      span.style.left = `${e.clientX}px`;
      span.style.top = `${e.clientY}px`;
      span.style.width = `${size}px`;
      span.style.height = `${size}px`;
      document.body.appendChild(span);
      span.addEventListener("animationend", () => span.remove(), { once: true });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("blur", clearTilt);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("blur", clearTilt);
      clearTilt();
    };
  }, []);

  return null;
}
