"use client";

import { useEffect, useState } from "react";

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  angle: number;
  tag: string;
};

/**
 * Skeleton inspector overlay.
 *
 * Press `K` to toggle. Strips colour/imagery from the page, draws an
 * outline around every element, and labels each box with its width ×
 * height (and rotation in degrees if the element is transformed).
 *
 * Coordinates are measured in document space (left + scrollX) so the
 * labels stick to elements as the page scrolls — no per-frame recompute.
 * A ResizeObserver and a debounced rAF re-scan handle layout shifts.
 */
export function SkeletonView() {
  const [on, setOn] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);

  // Toggle on `K`, dismiss on `Escape`.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (
        t?.tagName === "INPUT" ||
        t?.tagName === "TEXTAREA" ||
        t?.isContentEditable ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }
      if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setOn((v) => !v);
      } else if (e.key === "Escape" && on) {
        setOn(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on]);

  // Toggle a body class so CSS can flatten the page.
  useEffect(() => {
    if (on) document.body.classList.add("skeleton-mode");
    else document.body.classList.remove("skeleton-mode");
    return () => document.body.classList.remove("skeleton-mode");
  }, [on]);

  // Walk the DOM, build a Box[] of every meaningful element.
  useEffect(() => {
    if (!on) return;

    let raf = 0;
    function compute() {
      const all = document.querySelectorAll<HTMLElement>(
        "main *, header *, footer *"
      );
      const out: Box[] = [];
      all.forEach((el) => {
        if (el.closest(".skeleton-overlay")) return;
        const r = el.getBoundingClientRect();
        if (r.width < 4 || r.height < 4) return;

        // Read 2D rotation from the computed transform matrix.
        const cs = getComputedStyle(el);
        const t = cs.transform;
        let angle = 0;
        if (t && t !== "none") {
          const m = t.match(/matrix(?:3d)?\(([^)]+)\)/);
          if (m) {
            const parts = m[1].split(",").map((n) => parseFloat(n));
            const a = parts[0];
            const b = parts[1];
            const deg = (Math.atan2(b, a) * 180) / Math.PI;
            angle = Math.round(deg);
          }
        }

        out.push({
          x: r.left + window.scrollX,
          y: r.top + window.scrollY,
          w: Math.round(r.width),
          h: Math.round(r.height),
          angle,
          tag: el.tagName.toLowerCase(),
        });
      });
      setBoxes(out);
    }

    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    }

    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    window.addEventListener("resize", schedule);
    // Re-scan when scroll-driven animations land elements in new spots.
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(raf);
    };
  }, [on]);

  if (!on) return null;

  return (
    <div
      aria-hidden
      className="skeleton-overlay pointer-events-none absolute inset-x-0 top-0 z-[99]"
      style={{ height: document.documentElement.scrollHeight }}
    >
      {boxes.map((b, i) => (
        <div
          key={i}
          className="absolute border border-black/40"
          style={{
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
          }}
        >
          {/* Dimension chip: anchored top-left, kerning tightened to match the
              site's −0.02em system. */}
          <span
            className="absolute left-0 top-0 inline-flex h-4 items-center bg-black px-1 font-mono text-[9px] font-semibold leading-none text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            {b.w}×{b.h}
            {b.angle !== 0 ? ` · ${b.angle}°` : ""}
          </span>
        </div>
      ))}
      <div className="pointer-events-none fixed bottom-4 right-4 rounded-full bg-black px-3 py-1.5 font-mono text-[11px] font-semibold uppercase text-white">
        skeleton · K to toggle · Esc to close
      </div>
    </div>
  );
}
