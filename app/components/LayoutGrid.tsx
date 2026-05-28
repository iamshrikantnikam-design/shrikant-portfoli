"use client";

import { useEffect, useState } from "react";
import { Container } from "./Container";

/**
 * Development-style 12-col grid overlay.
 *
 * Toggle:  Cmd+G (macOS) / Ctrl+G (Windows/Linux)
 * Close:   Esc
 *
 * Cmd+G is the browser's "Find Next" shortcut — we preventDefault so the
 * overlay wins. Keypresses are ignored while the user is typing in an
 * input/textarea/contenteditable so we don't intercept their work.
 *
 * Overlay spec:
 *   12 columns · 32px horizontal padding · 8px gutter
 */
export function LayoutGrid() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      // Toggle requires the platform meta key (Cmd on macOS, Ctrl elsewhere)
      // plus G. Plain G is intentionally NOT a trigger — too easy to fire
      // mid-typing or by accident.
      const isToggle =
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey &&
        !e.altKey &&
        (e.key === "g" || e.key === "G");

      if (isToggle && !typing) {
        e.preventDefault();
        setShow((v) => !v);
        return;
      }

      if (e.key === "Escape" && show) {
        setShow(false);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  if (!show) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      <Container className="h-full !px-8">
        <div className="grid h-full grid-cols-12 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="relative h-full border-x border-white/30 bg-white/[0.06]"
            >
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-black tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          ))}
        </div>
      </Container>

      {/* HUD pill bottom-right confirms the overlay is on and reminds shortcut */}
      <div className="absolute bottom-4 right-4 rounded-full bg-white px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-black">
        12-col · 32px padding · 8px gutter · Cmd+G to toggle · Esc to close
      </div>
    </div>
  );
}
