"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function SystemSound({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    type AudioCtor = typeof AudioContext;
    const Ctor: AudioCtor | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: AudioCtor })
        .webkitAudioContext;
    if (!Ctor) return;

    let ctx: AudioContext | null = null;
    const getCtx = () => {
      if (!ctx) ctx = new Ctor();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    };

    // C major pentatonic — always sounds consonant, so any order plays
    // as a pleasant little melody.
    const NOTES = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.0, // G4
      440.0, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.0, // A5
    ];
    let noteIdx = 0;

    const playClick = () => {
      const ac = getCtx();
      const now = ac.currentTime;
      const freq = NOTES[noteIdx % NOTES.length];
      noteIdx++;

      const dur = 1.1;

      // Master envelope — sharp attack, long exponential decay (piano-like)
      const master = ac.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.linearRampToValueAtTime(0.32, now + 0.006);
      master.gain.exponentialRampToValueAtTime(0.12, now + 0.12);
      master.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      // Gentle low-pass to keep it clean and warm
      const tone = ac.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.setValueAtTime(4200, now);
      tone.frequency.exponentialRampToValueAtTime(1400, now + dur);
      tone.Q.value = 0.4;

      master.connect(tone);
      tone.connect(ac.destination);

      // Additive piano-ish partials (fundamental + harmonics)
      const partials: { mult: number; gain: number; type: OscillatorType }[] = [
        { mult: 1, gain: 0.55, type: "sine" },
        { mult: 2, gain: 0.22, type: "sine" },
        { mult: 3, gain: 0.1, type: "sine" },
        { mult: 4, gain: 0.05, type: "triangle" },
      ];

      partials.forEach((p) => {
        const osc = ac.createOscillator();
        osc.type = p.type;
        osc.frequency.value = freq * p.mult;
        const g = ac.createGain();
        g.gain.value = p.gain;
        osc.connect(g);
        g.connect(master);
        osc.start(now);
        osc.stop(now + dur);
      });
    };

    let lastRow: Element | null = null;
    let lastPlay = 0;

    const onOver = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const row = target.closest("[data-sysrow]");
      if (!row || row === lastRow) return;
      lastRow = row;
      const t = performance.now();
      if (t - lastPlay < 40) return;
      lastPlay = t;
      try {
        playClick();
      } catch {
        /* audio may be blocked until user interaction */
      }
    };

    const onOut = (e: PointerEvent) => {
      const related = e.relatedTarget as Element | null;
      if (!related || !related.closest?.("[data-sysrow]")) {
        lastRow = null;
      }
    };

    root.addEventListener("pointerover", onOver);
    root.addEventListener("pointerout", onOut as EventListener);
    return () => {
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerout", onOut as EventListener);
      ctx?.close();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
