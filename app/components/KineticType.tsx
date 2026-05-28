"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type KineticTypeProps = {
  /** 1–3 lines of text. Each letter animates independently. */
  lines?: string[];
  /** Background colour. */
  bg?: string;
  /** Letter colour. */
  fg?: string;
  /** Optional CSS background (image/gradient) painted *through* the
   *  letters via background-clip: text. Overrides `fg` when set. */
  fgGradient?: string;
  /** Radius (px) of cursor influence on each letter. */
  influence?: number;
  /** Resting font-weight axis value. */
  baseWeight?: number;
  /** Resting font-width axis value. */
  baseWidth?: number;
  /** 0–1, how hard letters react. Can exceed 1 for punchier motion. */
  intensity?: number;
  /** CSS height. Defaults to 100vh for the original full-screen widget. */
  height?: string;
  /** Multiplier on the auto-fit font size. 1 = default fit. Larger
   *  values push the text edge-to-edge (and may clip horizontally). */
  fontScale?: number;
  /** When true, each line is independently click-and-drag repositionable.
   *  Disables the cursor-driven kinetic morph so dragging doesn't fight
   *  the parallax offset. */
  draggableLines?: boolean;
  /** Inner safe-area padding in px. The cqh font-size cap budget is
   *  measured against the post-padding box, so larger padding => smaller
   *  type. Default 32 leaves comfortable margins; reduce to 0–8 when
   *  fontScale > 1.5 to give ascenders/descenders headroom. */
  padding?: number;
  /** Horizontal cqw budget per line. fontSize is capped at
   *  `widthBudget / charsInLine` cqw. Default 140 fills the box
   *  edge-to-edge (good for short lines). Reduce to ~95–110 on
   *  multi-line wide layouts so the cqh cap binds instead — otherwise
   *  the cqw cap pins fontSize too tall and the stack overflows
   *  vertically. */
  widthBudget?: number;
};

/**
 * KineticType — variable-font kinetic typography that reshapes around the
 * cursor. Each letter reads its distance to the pointer and drives its
 * `font-variation-settings` (wght, wdth, opsz, GRAD, slnt) off of it.
 *
 * Loads Roboto Flex from Google Fonts on mount; falls back to invisible
 * until the font is ready so the initial paint doesn't jump.
 *
 * Ports the standalone JSX widget to TS and relaxes `position: fixed` so
 * the band can live inline inside the footer instead of overlaying the
 * whole viewport.
 */
export function KineticType({
  lines = ["SCULPTING", "HARMONY"],
  bg = "#000000",
  fg = "#ffffff",
  fgGradient,
  influence = 420,
  baseWeight = 900,
  // Was 151 (max-stretch). At max width plus the bumped fontSize cap,
  // glyphs were physically wider than the cover and bled past the edges.
  // 100 sits at the middle of the wdth axis: letters render at a normal
  // stride and only narrow when the cursor pushes wdth down.
  baseWidth = 100,
  intensity = 1,
  height = "100vh",
  fontScale = 1,
  draggableLines = false,
  padding = 32,
  widthBudget = 140,
}: KineticTypeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const letterRefs = useRef<HTMLSpanElement[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const parallaxRef = useRef({ target: 0, current: 0 });
  const [fontReady, setFontReady] = useState(false);
  // Per-row drag offsets (only used when draggableLines is true).
  const [rowOffsets, setRowOffsets] = useState<Record<number, { x: number; y: number }>>({});
  const dragStateRef = useRef<{
    rowIdx: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  // Load Roboto Flex once per page.
  useEffect(() => {
    const id = "roboto-flex-kinetic";
    if (document.getElementById(id)) {
      setFontReady(true);
      return;
    }
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght,GRAD,slnt@8..144,25..151,100..1000,-200..150,-10..0&display=swap";
    document.head.appendChild(link);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setFontReady(true));
    } else {
      setTimeout(() => setFontReady(true), 600);
    }
  }, []);

  // Group letters by word so each word is its own inline-block. This is
  // load-bearing: with the row's −0.36em letter-spacing applied to a flat
  // list of letters, inter-word spaces collapse into the neighbours and
  // "TO WORK" reads as "TOWORK". By boxing each word, kerning stays
  // contained inside the word and the row's `column-gap` controls the
  // visible space between words.
  const wordMatrix = useMemo(
    () =>
      lines.map((line, lIdx) =>
        line
          .split(" ")
          .filter((w) => w.length > 0)
          .map((word, wIdx) => ({
            key: `${lIdx}-${wIdx}-${word}`,
            chars: word
              .split("")
              .map((ch, cIdx) => ({ ch, key: `${lIdx}-${wIdx}-${cIdx}-${ch}` })),
          }))
      ),
    [lines]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      const point =
        "touches" in e && e.touches.length ? e.touches[0] : (e as MouseEvent);
      mouseRef.current = {
        x: point.clientX,
        y: point.clientY,
        active: true,
      };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };

    const loop = () => {
      const { x: mx, y: my, active } = mouseRef.current;
      const letters = letterRefs.current;

      // Subtle horizontal parallax: shift the whole text block toward
      // the cursor by up to ±14px. Lerp toward target so motion eases
      // out smoothly when the cursor stops or leaves.
      const cont = containerRef.current;
      if (cont && active) {
        const cr = cont.getBoundingClientRect();
        const norm = Math.max(-1, Math.min(1, ((mx - cr.left) / cr.width - 0.5) * 2));
        parallaxRef.current.target = norm * 14;
      } else {
        parallaxRef.current.target = 0;
      }
      parallaxRef.current.current +=
        (parallaxRef.current.target - parallaxRef.current.current) * 0.08;
      if (innerRef.current) {
        innerRef.current.style.transform = `translate3d(${parallaxRef.current.current.toFixed(
          2,
        )}px, 0, 0)`;
      }

      for (let i = 0; i < letters.length; i++) {
        const node = letters[i];
        if (!node) continue;
        const r = node.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;

        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let proximity = active ? Math.max(0, 1 - dist / influence) : 0;
        // Smoothstep easing for a softer falloff.
        proximity = proximity * proximity * (3 - 2 * proximity);
        proximity *= intensity;

        const horizSign = dx === 0 ? 0 : dx > 0 ? 1 : -1;

        // Resting weight may have been pre-baked per letter (alternating
        // gradient by row); fall back to the component baseWeight.
        const letterBaseWeight =
          Number(node.dataset.baseWeight) || baseWeight;
        // Hover pulls each letter toward the OPPOSITE end of the wght
        // axis from its resting state — thin letters bulk up, bold ones
        // slim down. Mirroring around the axis midpoint (≈575) gives the
        // alternating per-row gradients a satisfying flip on cursor.
        const letterHoverWeight = Math.min(
          1000,
          Math.max(150, 1150 - letterBaseWeight),
        );
        const wght = Math.round(
          letterBaseWeight +
            (letterHoverWeight - letterBaseWeight) * proximity * 0.85,
        );
        // Each row may have been given a row-specific resting wdth so
        // short rows stretch edge-to-edge; fall back to the component
        // baseWidth when no data attribute is set.
        const letterBaseWidth = Number(node.dataset.baseWidth) || baseWidth;
        const wdth = Math.round(
          letterBaseWidth - (letterBaseWidth - 25) * proximity * 0.9
        );
        const opsz = Math.round(144 - 100 * proximity);
        const grad = Math.round(-80 * proximity * horizSign);
        // Subtle cursor-driven italic lean. Roboto Flex slnt axis runs
        // 0 → −10; scale with proximity for a gentle tilt near the
        // pointer, upright when it drifts away.
        const slnt = (-10 * proximity * 0.55).toFixed(2);
        node.style.fontVariationSettings = `"wght" ${wght}, "wdth" ${wdth}, "opsz" ${opsz}, "GRAD" ${grad}, "slnt" ${slnt}`;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove as EventListener);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, [influence, baseWeight, baseWidth, intensity, fontReady]);

  // Reset the letter ref list on every render so it stays aligned with
  // the children React actually painted this pass.
  letterRefs.current = [];
  const registerLetter = (node: HTMLSpanElement | null) => {
    if (node) letterRefs.current.push(node);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height,
        background: bg,
        color: fg,
        fontFamily: "'Roboto Flex', 'SF Pro Display', -apple-system, sans-serif",
        overflow: "hidden",
        // Outer holds the safe area; the inner box owns
        // container-queries so cqw/cqh on the letters resolve to the
        // INSIDE of the padding, guaranteeing nothing bleeds past it.
        padding: `${padding}px`,
        boxSizing: "border-box",
        cursor: "crosshair",
        userSelect: "none",
        opacity: fontReady ? 1 : 0,
        transition: "opacity 400ms ease",
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "stretch",
          rowGap: "5px",
          willChange: "transform",
          // Query container so cqw/cqh below = inner-box dimensions.
          containerType: "size",
          ...(fgGradient
            ? {
                backgroundImage: fgGradient,
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                animation:
                  "rainbow-text-shift 14s ease-in-out infinite",
              }
            : null),
        }}
      >
      {wordMatrix.map((words, rowIdx) => {
        // Total non-space characters in the line — drives the per-letter
        // font-size budget (otherwise short lines and long lines would
        // compute the same fontSize and the long ones would overflow).
        const totalChars = words.reduce((sum, w) => sum + w.chars.length, 0);
        // Alternate the resting-weight gradient direction by row: even
        // rows go thin → bold across the line, odd rows go bold → thin.
        // Drives both the initial paint and the rAF loop (via the
        // data-base-weight attribute we set on each letter below).
        const rowStartWeight = rowIdx % 2 === 0 ? 300 : 1000;
        const rowEndWeight = rowIdx % 2 === 0 ? 1000 : 300;
        let charCursor = -1;
        const offset = rowOffsets[rowIdx] ?? { x: 0, y: 0 };
        return (
          <div
            key={rowIdx}
            onPointerDown={
              draggableLines
                ? (e) => {
                    e.preventDefault();
                    (e.currentTarget as HTMLElement).setPointerCapture(
                      e.pointerId,
                    );
                    const current = rowOffsets[rowIdx] ?? { x: 0, y: 0 };
                    dragStateRef.current = {
                      rowIdx,
                      startX: e.clientX,
                      startY: e.clientY,
                      baseX: current.x,
                      baseY: current.y,
                    };
                  }
                : undefined
            }
            onPointerMove={
              draggableLines
                ? (e) => {
                    const drag = dragStateRef.current;
                    if (!drag || drag.rowIdx !== rowIdx) return;
                    const nextX = drag.baseX + (e.clientX - drag.startX);
                    setRowOffsets((prev) => ({
                      ...prev,
                      [rowIdx]: { x: nextX, y: 0 },
                    }));
                  }
                : undefined
            }
            onPointerUp={
              draggableLines
                ? (e) => {
                    if (dragStateRef.current?.rowIdx === rowIdx) {
                      dragStateRef.current = null;
                    }
                    (e.currentTarget as HTMLElement).releasePointerCapture(
                      e.pointerId,
                    );
                  }
                : undefined
            }
            onPointerCancel={
              draggableLines
                ? () => {
                    if (dragStateRef.current?.rowIdx === rowIdx) {
                      dragStateRef.current = null;
                    }
                  }
                : undefined
            }
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              maxWidth: "100%",
              // Letting the row overflow lets the kinetic morph extend
              // ascenders/descenders past the line box without clipping;
              // the parent KineticType container is `overflow: hidden`
              // so nothing escapes the cover.
              overflow: "visible",
              flex: "0 0 auto",
              // 0.72 was clipping ascenders against the safe box. 0.92
              // gives glyphs the small slack they need without opening
              // a visible vertical gap between rows.
              lineHeight: 0.92,
              // Visible word break — independent of the −0.36em kerning
              // applied inside each word.
              columnGap: "clamp(8px, 1.5cqw, 24px)",
              ...(draggableLines
                ? {
                    cursor:
                      dragStateRef.current?.rowIdx === rowIdx
                        ? "grabbing"
                        : "grab",
                    touchAction: "none",
                    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
                    willChange: "transform",
                  }
                : null),
            }}
          >
            {words.map((word) => (
              <span
                key={word.key}
                style={{
                  display: "inline-block",
                  // Kerning lives on the word, so it can't bleed across
                  // word boundaries.
                  letterSpacing: "-0.36em",
                  whiteSpace: "nowrap",
                  // Belt-and-suspenders: pin upright in case any
                  // user-agent or font-feature default leaks an italic.
                  fontStyle: "normal",
                }}
              >
                {word.chars.map(({ ch, key }) => {
                  charCursor += 1;
                  const t =
                    totalChars <= 1 ? 0 : charCursor / (totalChars - 1);
                  const restingWeight = Math.round(
                    rowStartWeight + (rowEndWeight - rowStartWeight) * t,
                  );
                  return (
                    <span
                      key={key}
                      ref={registerLetter}
                      data-base-weight={restingWeight}
                      style={{
                        display: "inline-block",
                        // Vertical cap. Roboto Flex at wght 900 has ascenders
                        // and descenders that reach a touch beyond the em-box,
                        // so we leave ~18% of the inner-box height as slack
                        // (78cqh / line, plus rowGap). With 4 lines this
                        // stops "DESIGNING" and "FOR HUMAN" clipping at the
                        // top/bottom of the cover.
                        fontSize: `min(${widthBudget / totalChars}cqw, ${
                          (78 * fontScale) / wordMatrix.length
                        }cqh)`,
                        fontVariationSettings: `"wght" ${restingWeight}, "wdth" ${baseWidth}, "opsz" 144, "GRAD" 0, "slnt" 0`,
                        fontStyle: "normal",
                        transition: "font-variation-settings 60ms linear",
                        willChange: "font-variation-settings",
                        textAlign: "center",
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            ))}
          </div>
        );
      })}
      </div>
    </div>
  );
}
