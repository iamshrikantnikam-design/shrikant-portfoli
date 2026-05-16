"use client";

/*
  SequinBackground — dense iridescent bubble field with cursor-burst
  interaction and an automatic fade zone around UI elements.

  ── Visual ────────────────────────────────────────────────────────────
  Each bubble is a soft radial gradient (white core → tinted body →
  transparent edge) so it reads as a translucent reflective sphere.
  Bubbles drift slowly upward (gentle float) and wrap from top → bottom.
  Twinkle: per-bubble sin-phase modulates alpha 60–100% on a 2–4s cycle.

  ── Interaction ───────────────────────────────────────────────────────
  Mouse / touch movement pops any bubble within `POP_RADIUS` of the
  cursor. Each pop spawns 3–5 smaller fragments that fly outward with
  light gravity and fade over ~600ms. A replacement bubble is seeded
  off-screen at the bottom so the field never thins out.
  Fragments do NOT re-burst on contact — prevents runaway chains.

  ── Fade zone ─────────────────────────────────────────────────────────
  Each frame we read getBoundingClientRect() of `FADE_SELECTOR` matches
  (headings, paragraphs, buttons, links, KineticType canvas) and inflate
  by 12px. Bubbles whose centre falls inside any of these rects render
  at 30% alpha — they're still visible as ambient sparkle behind text
  but don't compete with it. We tag our own canvas with `data-sequin`
  and exclude it from the selector so it doesn't fade itself.

  ── Performance ───────────────────────────────────────────────────────
  - Canvas 2D at devicePixelRatio (capped at 2) for crisp dots.
  - ~700–900 bubbles in a typical viewport; collision is O(n) per frame
    but cheap (squared-distance check). Burst particle pool stays under
    ~100 in normal use.
  - Pauses the rAF loop on `visibilitychange` (hidden tab) and skips
    animation entirely under `prefers-reduced-motion`.
*/

import { useEffect, useRef } from "react";

const PALETTE = [
  "#00E5FF", // cyan
  "#FF3DCB", // magenta
  "#FFC93D", // gold
  "#A56BFF", // purple
  "#23E0BD", // teal
  "#FF7A6B", // coral
];

// Selectors whose rects mute bubble alpha. Includes the KineticType
// <canvas> by tagging others with :not([data-sequin]) so our own canvas
// is excluded from the fade list.
const FADE_SELECTOR =
  "h1, h2, h3, h4, p, a, button, [role=button], canvas:not([data-sequin]), [data-bubble-fade]";

const POP_RADIUS = 20;
const FADE_ALPHA_MULT = 0.3;

type Bubble = {
  x: number;
  y: number;
  r: number;
  color: string;
  baseAlpha: number;
  phase: number;
  speed: number;
  driftX: number;
  driftY: number;
};

type Burst = {
  x: number;
  y: number;
  r: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
  decay: number;
};

type Rect = { x: number; y: number; w: number; h: number };

export function SequinBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let bubbles: Bubble[] = [];
    let bursts: Burst[] = [];
    let fadeRects: Rect[] = [];
    let raf = 0;
    let lastT = 0;
    let mouseX = -9999;
    let mouseY = -9999;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const makeBubble = (x?: number, y?: number): Bubble => ({
      x: x ?? Math.random() * width,
      y: y ?? Math.random() * height,
      r: 2.4 + Math.random() * 3.6,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      baseAlpha: 0.18 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.45 + Math.random() * 1.1,
      driftX: (Math.random() - 0.5) * 0.06,
      driftY: -0.05 - Math.random() * 0.12, // slow upward float
    });

    const seed = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Dense jittered grid — 24px cell, 90% keep. ~700–900 bubbles.
      const cell = 24;
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      bubbles = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          if (Math.random() > 0.9) continue;
          const jx = (Math.random() - 0.5) * cell * 0.7;
          const jy = (Math.random() - 0.5) * cell * 0.7;
          const b = makeBubble(
            i * cell + cell / 2 + jx,
            j * cell + cell / 2 + jy,
          );
          bubbles.push(b);
        }
      }
    };

    const refreshFadeRects = () => {
      const els = document.querySelectorAll(FADE_SELECTOR);
      const next: Rect[] = [];
      for (const el of Array.from(els)) {
        const r = (el as HTMLElement).getBoundingClientRect();
        if (
          r.bottom < -20 ||
          r.top > height + 20 ||
          r.width === 0 ||
          r.height === 0
        ) {
          continue;
        }
        next.push({
          x: r.left - 12,
          y: r.top - 12,
          w: r.width + 24,
          h: r.height + 24,
        });
      }
      fadeRects = next;
    };

    const inFadeZone = (x: number, y: number): boolean => {
      for (const r of fadeRects) {
        if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
          return true;
        }
      }
      return false;
    };

    const burstAt = (b: Bubble) => {
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2 + Math.random() * 0.6;
        const speed = 0.7 + Math.random() * 1.6;
        bursts.push({
          x: b.x,
          y: b.y,
          r: b.r * (0.45 + Math.random() * 0.45),
          color: b.color,
          alpha: Math.min(0.8, b.baseAlpha * 1.7),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4,
          decay: 0.014 + Math.random() * 0.012,
        });
      }
    };

    const drawSphere = (
      x: number,
      y: number,
      r: number,
      color: string,
      alpha: number,
    ) => {
      const g = ctx.createRadialGradient(
        x - r * 0.35,
        y - r * 0.35,
        r * 0.1,
        x,
        y,
        r,
      );
      g.addColorStop(0, withAlpha("#ffffff", Math.min(1, alpha * 1.4)));
      g.addColorStop(0.5, withAlpha(color, alpha));
      g.addColorStop(1, withAlpha(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (t: number) => {
      const dt = lastT ? Math.min(33, t - lastT) / 16 : 1; // ~60fps normalized
      lastT = t;
      ctx.clearRect(0, 0, width, height);
      const time = t / 1000;

      // Cursor pops nearby bubbles.
      if (mouseX > -1000) {
        for (let i = bubbles.length - 1; i >= 0; i--) {
          const b = bubbles[i];
          const dx = b.x - mouseX;
          const dy = b.y - mouseY;
          const hitR = POP_RADIUS + b.r;
          if (dx * dx + dy * dy < hitR * hitR) {
            burstAt(b);
            bubbles.splice(i, 1);
            // Replenish so the field stays dense — spawn off-screen.
            bubbles.push(makeBubble(
              Math.random() * width,
              height + 20 + Math.random() * 120,
            ));
          }
        }
      }

      // Bubbles
      for (const b of bubbles) {
        b.x += b.driftX * dt;
        b.y += b.driftY * dt;
        // wrap top → bottom
        if (b.y < -12) {
          b.y = height + 12;
          b.x = Math.random() * width;
        }
        if (b.x < -12) b.x = width + 12;
        if (b.x > width + 12) b.x = -12;

        const tw = 0.5 + 0.5 * Math.sin(time * b.speed + b.phase);
        let a = b.baseAlpha * (0.6 + 0.4 * tw);
        if (inFadeZone(b.x, b.y)) a *= FADE_ALPHA_MULT;
        drawSphere(b.x, b.y, b.r, b.color, a);
      }

      // Burst fragments — float outward, drift down slightly, fade.
      for (let i = bursts.length - 1; i >= 0; i--) {
        const p = bursts[i];
        p.x += p.vx * dt * 1.5;
        p.y += p.vy * dt * 1.5;
        p.vy += 0.025 * dt; // mild gravity → falls slightly as it expands
        p.alpha -= p.decay * dt;
        if (p.alpha <= 0 || p.y > height + 30 || p.x < -30 || p.x > width + 30) {
          bursts.splice(i, 1);
          continue;
        }
        let a = p.alpha;
        if (inFadeZone(p.x, p.y)) a *= FADE_ALPHA_MULT + 0.15; // bursts more visible
        drawSphere(p.x, p.y, p.r, p.color, a);
      }

      raf = requestAnimationFrame(draw);
    };

    seed();
    refreshFadeRects();
    if (reduceMotion.matches) {
      // Single static frame; skip the rAF + interactivity for accessibility.
      draw(0);
    } else {
      raf = requestAnimationFrame(draw);
    }

    // ── Listeners ──────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t0 = e.touches[0];
      if (t0) {
        mouseX = t0.clientX;
        mouseY = t0.clientY;
      }
    };
    const onTouchEnd = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Recompute fade rects on scroll / resize. Throttled with rAF.
    let scrollScheduled = false;
    const onScroll = () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(() => {
        refreshFadeRects();
        scrollScheduled = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        seed();
        refreshFadeRects();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (!reduceMotion.matches && !raf) {
        lastT = 0;
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-sequin
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: -1 }}
    />
  );
}

function withAlpha(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}
