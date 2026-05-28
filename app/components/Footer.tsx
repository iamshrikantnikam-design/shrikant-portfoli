import { Container } from "./Container";
import { KineticType } from "./KineticType";

const ICON_CLASS = "h-[18px] w-[18px] flex-shrink-0";

function IconMail() {
  return (
    <svg
      className={ICON_CLASS}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg
      className={ICON_CLASS}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v2" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function IconBehance() {
  return (
    <svg
      className={ICON_CLASS}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M22 7H17V5.5h5V7M22.6 14.46c0 .19-.02.36-.05.5h-5.45c.07.79.79 1.27 1.66 1.27.6 0 1.11-.16 1.39-.51h2.27c-.39 1.16-1.5 2.07-3.62 2.07-2.13 0-4.27-1.18-4.27-4 0-2.74 1.78-3.96 4.13-3.96 2.18 0 4.04 1.31 3.94 4.63zm-2.45-1.41c-.06-.78-.71-1.32-1.61-1.32-.94 0-1.42.5-1.6 1.32h3.21M5.5 19.7c2.36 0 4.85-.66 4.85-3.6 0-1.59-.79-2.27-1.92-2.66.74-.45 1.38-1.27 1.38-2.39 0-2.61-2.17-3.16-4.39-3.16H1V19.7h4.5m-.36-9.13c1.07 0 1.96.21 1.96 1.34 0 1-.79 1.31-1.74 1.31H3.41v-2.65h1.73m.55 4.93c1.21 0 2.07.51 2.07 1.62 0 1.13-.96 1.5-1.96 1.5H3.41v-3.12h2.28" />
    </svg>
  );
}

/**
 * Bottom-of-page block.
 *
 * Bands:
 *   1. KineticType cover ("OPEN / TO WORK") — framed like a case-study.
 *   2. Light contact band — subtitle, CTA row, meta. Eyebrow + headline
 *      removed; the kinetic cover above carries that role now.
 *
 * The two bands are also exported individually so the homepage can slot
 * the kinetic cover into its parallax stack while the contact band flows
 * below the stack as normal content.
 */
export function FooterHero() {
  return (
    <div className="w-full">
      <Container>
        <div className="overflow-hidden rounded-[28px] bg-black">
          <KineticType
            lines={["OPEN", "TO  WORK"]}
            bg="#000000"
            fg="#ffffff"
            fgGradient="linear-gradient(115deg, hsl(0,85%,70%), hsl(40,90%,65%), hsl(120,65%,60%), hsl(190,75%,60%), hsl(250,70%,70%), hsl(310,75%,70%), hsl(0,85%,70%))"
            influence={500}
            intensity={1.2}
            height="min(720px, 80vh)"
          />
        </div>
      </Container>
    </div>
  );
}

export function FooterContact({
  showIntro = true,
  tightTop = false,
}: { showIntro?: boolean; tightTop?: boolean } = {}) {
  const topPad = tightTop ? "pt-10 md:pt-[60px]" : "pt-20 md:pt-[120px]";
  return (
    <div id="contact" className="bg-white text-black">
      <Container>
        <div className={`${topPad} pb-20 md:pb-[120px]`}>
          {showIntro ? (
            <p className="max-w-[480px] text-[15px] leading-[1.8] text-black/60">
              Whether it&rsquo;s a full-time role, a freelance project, or just
              a conversation about design, I&rsquo;m easy to reach and always
              happy to talk.
            </p>
          ) : null}

          <div
            className={`${showIntro ? "mt-9 " : ""}flex flex-wrap items-center gap-x-8 gap-y-3`}
          >
            <a
              href="mailto:iamshrikantnikam@gmail.com"
              className="inline-flex items-center gap-2 text-[14px] font-semibold uppercase text-black"
            >
              <IconMail />
              <span className="cta-progressive-underline">
                iamshrikantnikam@gmail.com
              </span>
            </a>
            <a
              href="https://linkedin.com/in/shrikantnikam"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[14px] font-semibold uppercase text-black"
            >
              <IconLinkedIn />
              <span className="cta-progressive-underline">LinkedIn</span>
            </a>
            <a
              href="https://behance.net/shrikantnikam"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[14px] font-semibold uppercase text-black"
            >
              <IconBehance />
              <span className="cta-progressive-underline">Behance</span>
            </a>
          </div>
        </div>

        <div className="border-t border-black/10 py-6 text-[12px] text-black/40">
          <span>
            © {new Date().getFullYear()} Shrikant Nikam · UI/UX designer · Pune,
            India
          </span>
        </div>
      </Container>
    </div>
  );
}

/** Default export keeps existing imports working on pages that use the
 *  combined footer (about, design-system). */
export function Footer() {
  return (
    <footer className="bg-[color:var(--bg)]">
      <div className="pt-20 md:pt-[120px]">
        <FooterHero />
      </div>
      <FooterContact />
    </footer>
  );
}
