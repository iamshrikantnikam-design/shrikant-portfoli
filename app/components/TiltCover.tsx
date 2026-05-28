"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  href: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
  /** Max tilt magnitude in degrees. Defaults to 15. */
  maxDeg?: number;
  target?: string;
  rel?: string;
};

/**
 * Cursor-driven X-axis tilt.
 *
 * Listens for mousemove on the anchor and maps the cursor's vertical
 * position (0 → 1 across the element's height) to a rotateX angle in
 * the range [-maxDeg, +maxDeg]. Cursor at the top tilts the card
 * upward (top edge toward viewer); cursor at the bottom tilts it down.
 * On leave, the angle eases back to 0. All writes happen via a single
 * requestAnimationFrame loop with lerp smoothing — no React re-renders
 * per mouse move.
 */
export function TiltCover({
  href,
  ariaLabel,
  className,
  children,
  maxDeg = 15,
  target,
  rel,
}: Props) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function loop() {
      currentRef.current +=
        (targetRef.current - currentRef.current) * 0.18;
      if (el) {
        el.style.transform = `perspective(1200px) rotateX(${currentRef.current.toFixed(
          2
        )}deg)`;
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    function onMove(e: MouseEvent) {
      const r = el!.getBoundingClientRect();
      const y = (e.clientY - r.top) / r.height;
      // (y - 0.5) * 2 → [-1, 1]. Cursor near the top → negative angle
      // (rotateX < 0) brings the top edge toward the viewer.
      const norm = Math.max(-1, Math.min(1, (y - 0.5) * 2));
      targetRef.current = -norm * maxDeg;
    }
    function onLeave() {
      targetRef.current = 0;
    }

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [maxDeg]);

  return (
    <a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      className={className}
      target={target}
      rel={rel}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </a>
  );
}
