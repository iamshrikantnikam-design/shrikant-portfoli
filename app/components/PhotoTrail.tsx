"use client";

/*
  PhotoTrail — cursor-follow photo stamps, scoped to one section.

  Drop this component inside a `position: relative` section. As the
  cursor moves through that section, a new photo "stamps" at the
  pointer (small rotation, fade-in, then animates out). The trail is
  rate-limited: a new stamp only appears after the cursor has travelled
  at least `MIN_DIST_PX` since the last one, so it doesn't fire on every
  pixel.

  Placeholder behaviour: each stamp uses `background-image: url(...)`
  layered over a coloured gradient. If the URL 404s, the gradient stays
  visible — so the motion works *now* with no assets, and the same
  paths pick up real photos as soon as you drop them into
  `/public/about/01.jpg`, `/public/about/02.jpg`, etc.

  Respects `prefers-reduced-motion` (component does nothing) and is
  touch-inert (no `touchmove` handler — desktop-only flourish).
*/

import { useEffect, useRef } from "react";

// Files the trail expects in /public/about/. Add or rename freely.
// If a file is missing the colored fallback gradient is shown instead.
const PHOTOS = [
  "/about/01.jpg",
  "/about/02.jpg",
  "/about/03.jpg",
  "/about/04.jpg",
  "/about/05.jpg",
  "/about/06.jpg",
];

const MIN_DIST_PX = 28; // travel before stamping the next photo — smaller = denser trail
const PHOTO_W = 96; // stamp width in px (height = 1.25× for 4:5 portrait)
const LIFE_MS = 1800; // total visible lifespan per stamp — longer = trail extends further
const ENTER_MS = 360; // pop-in (scale-up + fade-in) duration — longer = gentler entry
const END_SCALE = 0.28; // stamp shrinks to this fraction of its starting size before removal

// Easing curves. Both are non-bouncy — bouncy overshoot was creating
// visual hiccups when stamps spawned in rapid succession.
const ENTER_EASE = "cubic-bezier(0.22, 1, 0.36, 1)"; // soft ease-out, no overshoot
const DECAY_EASE = "cubic-bezier(0.4, 0, 0.6, 1)"; // long ease-in-out tail

export function PhotoTrail() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reduceMotion.matches) return;

    let lastX = -9999;
    let lastY = -9999;
    let idx = 0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    // Idle clear — when the cursor stops moving (no mousemove for
    // IDLE_THRESHOLD_MS), drop every live stamp on the floor with a
    // fast shrink-and-fade. Net effect: the trail is *only* alive while
    // the cursor is in motion. Stand-still ⇒ empty section.
    // Slightly more forgiving idle window + a smoother clear ease so the
    // trail evaporates without the previous abrupt cut-off.
    const IDLE_THRESHOLD_MS = 140;
    const CLEAR_MS = 320;

    const clearTrail = () => {
      const stamps = Array.from(container.children) as HTMLElement[];
      stamps.forEach((s, i) => {
        const m = s.style.transform.match(/rotate\(([^)]+)\)/);
        const rot = m ? m[1] : "0deg";
        // Tiny per-stamp delay (3ms × index) so older stamps fade just
        // slightly ahead of newer ones — reads as a smooth dissolve
        // along the trail rather than every stamp dropping at once.
        const delay = i * 3;
        s.style.transition = `transform ${CLEAR_MS}ms ${DECAY_EASE} ${delay}ms, opacity ${CLEAR_MS}ms ${DECAY_EASE} ${delay}ms`;
        s.style.opacity = "0";
        s.style.transform = `rotate(${rot}) scale(${END_SCALE})`;
        window.setTimeout(() => s.remove(), CLEAR_MS + delay + 20);
      });
    };

    const spawn = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      const src = PHOTOS[idx % PHOTOS.length];
      idx++;

      const hueA = Math.floor(Math.random() * 360);
      const hueB = (hueA + 40 + Math.floor(Math.random() * 60)) % 360;
      const rot = (Math.random() - 0.5) * 14; // ±7°

      const card = document.createElement("div");
      card.setAttribute("aria-hidden", "true");
      card.style.cssText = `
        position: absolute;
        top: ${localY - PHOTO_W * 1.25 * 0.5}px;
        left: ${localX - PHOTO_W * 0.5}px;
        width: ${PHOTO_W}px;
        height: ${PHOTO_W * 1.25}px;
        border-radius: 10px;
        box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.28),
                    0 4px 10px -4px rgba(0, 0, 0, 0.16);
        background-color: hsl(${hueA}, 70%, 78%);
        background-image: linear-gradient(135deg, hsl(${hueA}, 70%, 80%), hsl(${hueB}, 70%, 70%)), url("${src}");
        background-size: cover, cover;
        background-position: center, center;
        background-blend-mode: normal, normal;
        opacity: 0;
        transform-origin: center center;
        transform: rotate(${rot}deg) scale(0.7);
        transition: transform ${ENTER_MS}ms ${ENTER_EASE},
                    opacity ${ENTER_MS}ms ${ENTER_EASE};
        pointer-events: none;
        will-change: transform, opacity;
      `;
      container.appendChild(card);

      // Once the image loads (if it exists), drop the gradient overlay so
      // the photo shows clearly. If it 404s we never enter this branch
      // and the gradient remains the visible content.
      if (src) {
        const probe = new Image();
        probe.onload = () => {
          card.style.backgroundImage = `url("${src}")`;
        };
        probe.src = src;
      }

      // Entry: pop in to full size at the cursor (next frame so the
      // transition triggers).
      requestAnimationFrame(() => {
        card.style.opacity = "1";
        card.style.transform = `rotate(${rot}deg) scale(1)`;
      });

      // Decay: once the entry pop completes, shrink continuously from
      // scale(1) → scale(END_SCALE) and fade to zero across the rest of
      // the lifespan. The newest stamp at the cursor stays full-size; as
      // each older stamp ages it shrinks, so the trail tapers from cursor
      // (largest, first→last reducing in size).
      const DECAY_MS = LIFE_MS - ENTER_MS;
      window.setTimeout(() => {
        card.style.transition = `transform ${DECAY_MS}ms ${DECAY_EASE}, opacity ${DECAY_MS}ms ${DECAY_EASE}`;
        card.style.opacity = "0";
        card.style.transform = `rotate(${rot}deg) scale(${END_SCALE})`;
      }, ENTER_MS);

      // Remove from DOM once decay completes.
      window.setTimeout(() => {
        card.remove();
      }, LIFE_MS);
    };

    const armIdleClear = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(clearTrail, IDLE_THRESHOLD_MS);
    };

    const onMouseMove = (e: MouseEvent) => {
      // Any motion at all rearms the idle timer — even sub-MIN_DIST_PX
      // wiggles count as "the cursor is still moving", so we don't
      // mistake a slow drift for a stop.
      armIdleClear();

      const rect = container.getBoundingClientRect();
      // Outside the section → reset distance gate (so re-entry spawns
      // immediately) and clear the trail right away — no point leaving
      // stamps lingering once the cursor has left.
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        lastX = -9999;
        lastY = -9999;
        if (idleTimer) clearTimeout(idleTimer);
        clearTrail();
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (dx * dx + dy * dy < MIN_DIST_PX * MIN_DIST_PX) return;
      lastX = e.clientX;
      lastY = e.clientY;
      spawn(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  // overflow-visible (default) so stamps that spawn near the section edge
  // don't get clipped by the section's frame. Stamps stay logically tied
  // to the section (parented under it) but render freely outside its box.
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: 5 }}
    />
  );
}
