"use client";

import { useEffect, useRef } from "react";

type Props = {
  label?: string;
};

/**
 * Cursor-tracking pill. Lives inside a positioned ancestor (the work
 * card's image area) and follows the mouse while the pointer is over
 * that ancestor. Fades in on enter, fades out + snaps back to centre
 * on leave. Direct DOM writes via rAF — no React re-renders per move.
 */
export function FloatingCta({ label = "View case study" }: Props) {
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const pill = pillRef.current;
    if (!pill) return;
    // Closest positioned ancestor — the cover div the pill is inside.
    const host =
      (pill.offsetParent as HTMLElement | null) ?? pill.parentElement;
    if (!host) return;

    function loop() {
      // Smoothing: lerp current → target each frame for trail-like feel.
      currentRef.current.x +=
        (targetRef.current.x - currentRef.current.x) * 0.18;
      currentRef.current.y +=
        (targetRef.current.y - currentRef.current.y) * 0.18;
      if (pill) {
        pill.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    function onMove(e: MouseEvent) {
      const r = host!.getBoundingClientRect();
      targetRef.current.x = e.clientX - r.left;
      targetRef.current.y = e.clientY - r.top;
    }
    function onEnter(e: MouseEvent) {
      const r = host!.getBoundingClientRect();
      // Seed both target and current so the pill appears right at the
      // cursor instead of flying in from (0, 0).
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      targetRef.current = { x, y };
      currentRef.current = { x, y };
      pill!.dataset.visible = "1";
    }
    function onLeave() {
      delete pill!.dataset.visible;
    }

    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseenter", onEnter);
    host.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseenter", onEnter);
      host.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <span
      ref={pillRef}
      aria-hidden
      data-floating-cta
      className="pointer-events-none absolute left-0 top-0 z-10 inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-white px-6 text-[14px] font-semibold uppercase text-black opacity-0 transition-opacity duration-200 ease-out data-[visible]:opacity-100"
      style={{ willChange: "transform, opacity" }}
    >
      {label} <span aria-hidden>→</span>
    </span>
  );
}
