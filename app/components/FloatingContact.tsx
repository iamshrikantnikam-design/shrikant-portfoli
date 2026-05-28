/**
 * Floating contact CTA, pinned to the bottom-right of the viewport.
 *
 * Replaces the prior Contact item in the top nav. Mounted at the layout
 * level so it persists across every route. z-index sits below the nav
 * (z-90 vs nav's z-100) so the nav still wins when their hit zones
 * overlap on narrow viewports.
 */
export function FloatingContact() {
  return (
    <a
      href="#contact"
      aria-label="Jump to contact section"
      className="fixed bottom-5 right-5 z-[90] inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--fg)] px-6 text-[13px] font-semibold uppercase tracking-[0.04em] text-[color:var(--bg)] shadow-[0_8px_24px_-4px_rgba(0,0,0,0.35)] transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.4)] md:bottom-8 md:right-8"
    >
      Contact
    </a>
  );
}
