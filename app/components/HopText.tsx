type HopTextProps = {
  /** The string to render. Split on " " — each space-separated token
   *  becomes its own hop-word block. */
  text: string;
  /** Tailwind / utility classes applied to the outer <p>. Use this for
   *  size, weight, alignment, color of the front (visible) glyphs. */
  className?: string;
};

/**
 * Layered hop-up text.
 *
 * Renders each word as two nested spans:
 *
 *   <span class="hop-word">          ← stationary hover hit area
 *     <span class="hop-word__inner"> ← transforms + shadows
 *       word
 *     </span>
 *   </span>
 *
 * At rest only the front glyphs paint; on hover the inner span lifts
 * with an ease-out-quint settle and a 5-color cascade of text-shadows
 * fans down-right behind it. The outer hit box is intentionally larger
 * than the inner so the cursor never falls out from under a lifted
 * word — see the comment block above .hop-word in globals.css for the
 * flicker-proofing rules.
 *
 * CSS lives in app/globals.css. This component carries no styles of
 * its own beyond what the caller passes via `className`.
 */
export function HopText({ text, className }: HopTextProps) {
  const words = text.split(" ");
  return (
    <p className={className}>
      {words.map((word, i) => (
        <span key={i} className="hop-word">
          <span className="hop-word__inner">{word}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
