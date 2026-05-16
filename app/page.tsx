import type { CSSProperties, ReactNode } from "react";
import { Container } from "./components/Container";
import { Nav } from "./components/Nav";
import { FooterHero, FooterContact } from "./components/Footer";
import { Pill } from "./components/Pill";
import { KineticType } from "./components/KineticType";
import { FloatingCta } from "./components/FloatingCta";
import { TiltCover } from "./components/TiltCover";

// Layered "stacked-plate" CTA.
// Three nested layers create one composed button:
//   1. Outer  — soft halo: backdrop-blur + faint tint + larger radius. Sits
//      behind everything and refracts the page background.
//   2. Middle — glass ring: thin (1.5px) padding around the core, painted
//      with a top-light gradient. Reads as a frosted bezel around the core.
//   3. Inner  — black core: 48px tall, solid #0A0A0F, white display text.
// Hover lifts the whole stack 1px, brightens the halo, and intensifies the
// drop shadow under the core so the composition reads as breathing.
const CTA_OUTER_CLASS = [
  "group relative inline-flex p-[2px]",
  "rounded-full",
  // Colored halo: brand-aligned cyan → purple → coral gradient at low alpha,
  // softened by the backdrop-blur. On hover the colors saturate further.
  "bg-gradient-to-br from-[#7ED0FF]/25 via-[#C771FF]/25 to-[#FF8A8A]/25",
  "backdrop-blur-xl backdrop-saturate-150",
  "shadow-[0_8px_24px_-8px_rgba(15,23,42,0.18),0_2px_6px_-2px_rgba(15,23,42,0.08)]",
  "transition-all duration-[280ms] ease-out",
  "hover:from-[#7ED0FF]/70 hover:via-[#C771FF]/70 hover:to-[#FF8A8A]/70",
  "hover:shadow-[0_18px_44px_-12px_rgba(199,113,255,0.35),0_4px_10px_-4px_rgba(15,23,42,0.18)]",
  "hover:-translate-y-[1px]",
].join(" ");

const CTA_MIDDLE_CLASS = [
  "p-[1.5px] rounded-full",
  "bg-gradient-to-b from-white/85 via-white/40 to-white/20",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]",
].join(" ");

const CTA_CORE_CLASS = [
  "flex h-12 items-center justify-center px-7 w-full",
  "rounded-full",
  "bg-[#0A0A0F] text-white text-[14px] font-semibold uppercase tracking-[0.02em]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_4px_12px_-2px_rgba(0,0,0,0.4)]",
  "transition-shadow duration-[280ms] ease-out",
  "group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_22px_-4px_rgba(0,0,0,0.55)]",
].join(" ");

function Panel({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section
      className={`relative w-full py-16 md:py-24 ${className}`}
      style={style}
    >
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Nav />

      {/*
        Explicit bg on <main> is load-bearing: the navbar runs in
        mix-blend-mode: difference, and transparent ancestors would leave
        the blend with nothing to subtract against. Audit rule.
      */}
      <main className="flex-1">
        <div className="relative">
          {/* ── Panel 1: HERO ───────────────────────────── */}
          <Panel>
            <Container>
              <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 pb-4 pt-[56px] text-center md:gap-5 md:pb-6 md:pt-[68px]">
                <h1 className="sr-only">
                  Designing things that feel human for human.
                </h1>
                <div aria-hidden className="min-h-0 w-full flex-1">
                  <KineticType
                    lines={[
                      "Designing",
                      "Things that",
                      "Feel human,",
                      "For human",
                    ]}
                    bg="transparent"
                    fg="#000000"
                    influence={500}
                    intensity={1.2}
                    fontScale={1.8}
                    widthBudget={80}
                    height="100%"
                    padding={0}
                    draggableLines
                  />
                </div>
                <div className="flex flex-shrink-0 flex-col items-center">
                  <p className="max-w-[760px] text-[15px] font-semibold leading-[1.4] text-[color:var(--muted)] md:text-[16px]">
                    A small-town guy with a bachelor&rsquo;s degree in hand,
                    <br />
                    now designing with AI to craft next-generation products.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <a
                      href="#work"
                      className={`${CTA_OUTER_CLASS} w-[300px]`}
                      aria-label="View work"
                    >
                      <span className={`${CTA_MIDDLE_CLASS} block w-full`}>
                        <span className={CTA_CORE_CLASS}>
                          View work
                        </span>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </Container>
          </Panel>

          {/* ── Panel 2: MoodPlan ───────────────────────── */}
          <Panel>
            <Container>
              <article
                id="work"
                className="group flex flex-col gap-6 md:gap-8"
              >
                <TiltCover
                  href="/case-study/moodplan"
                  ariaLabel="Open MoodPlan case study"
                  maxDeg={20}
                  className="block w-full"
                >
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] md:aspect-[2/1]"
                    style={{ background: "#000000" }}
                  >
                    <KineticType
                      lines={["MOOD", "PLAN"]}
                      bg="#000000"
                      fg="#ffffff"
                      influence={500}
                      intensity={1.2}
                      widthBudget={95}
                      height="100%"
                    />
                    <OverlayPill>Mobile · iOS</OverlayPill>
                    <FloatingCta />
                  </div>
                </TiltCover>
                <div>
                  <h3 className="text-[24px] font-semibold leading-[1.05] tracking-[-0.035em] text-[color:var(--fg)] sm:text-[28px] md:text-[34px]">
                    MoodPlan · An AI daily planner
                  </h3>
                  <p className="mt-2 max-w-[640px] text-[14px] leading-[1.65] text-[color:var(--muted)] md:text-[15px]">
                    A planner that starts with how you feel, not what you have
                    to do. Mood detection, energy matching, and a reward system
                    built for Gen Z.
                  </p>
                </div>
              </article>
            </Container>
          </Panel>

          {/* ── Panels 3–5: secondary case studies ──────── */}
          {WORK_CARDS.map((card, i) => (
            <Panel key={card.title}>
              <Container>
                <WorkCard card={card} index={i} />
              </Container>
            </Panel>
          ))}

          {/* ── Panel 6: OPEN TO WORK ────────────────────── */}
          <Panel>
            <div className="py-10 md:py-0">
              <FooterHero />
            </div>
          </Panel>
        </div>

        <FooterContact />
      </main>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Work cards 2+. Alternate image side at md+; single column on mobile.
──────────────────────────────────────────────────────────────────────────── */

type Card = {
  title: string;
  description: string;
  tags: string[];
  href: string;
  accent: string;
  status: "live" | "wip";
  /** 1–2 short lines used as the cover's kinetic typography. */
  kineticLines: string[];
};

const WORK_CARDS: Card[] = [
  {
    title: "Brand & logo work",
    description:
      "Logo systems, brand identities, and visual language for businesses across food, tech, and services. Rooted in BFA craft.",
    tags: ["Logo design", "Brand identity"],
    href: "#",
    accent: "#ffffff",
    status: "live",
    kineticLines: ["BRAND", "LOGO"],
  },
  {
    title: "AI career guide for Bharat",
    description:
      "Career guidance for tier-2 city students in India. AI-powered, voice-first, built around real constraints.",
    tags: ["Coming soon"],
    href: "#",
    accent: "#ffffff",
    status: "wip",
    kineticLines: ["AI", "GUIDE"],
  },
  {
    title: "Portfolio builder for BFA students",
    description:
      "A web tool for fine arts students to present their work professionally. Designed by the user, for the user.",
    tags: ["Coming soon"],
    href: "#",
    accent: "#ffffff",
    status: "wip",
    kineticLines: ["BFA", "FOLIO"],
  },
];

function WorkCard({ card, index }: { card: Card; index: number }) {
  const isWip = card.status === "wip";
  // Alternate the image side: even index → image left, odd → image right.
  const imageRight = index % 2 === 1;

  return (
    <article
      className={`group grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:gap-12 ${
        imageRight ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <TiltCover
        href={card.href}
        ariaLabel={`Open ${card.title}`}
        maxDeg={20}
        className="block w-full"
      >
        <div
          className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px]"
          style={{ background: "#000000" }}
        >
          <KineticType
            lines={card.kineticLines}
            bg="#000000"
            fg="#ffffff"
            influence={500}
            intensity={1.2}
            widthBudget={95}
            height="100%"
          />
          {card.tags.length > 0 && (
            <OverlayPill>{card.tags[0]}</OverlayPill>
          )}
          {isWip ? (
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
              <span
                className="rounded-full border border-dashed border-white/30 bg-black/50 px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] text-white/70 backdrop-blur"
              >
                In progress
              </span>
            </div>
          ) : (
            <FloatingCta />
          )}
        </div>
      </TiltCover>

      <div className={isWip ? "opacity-65" : ""}>
        <h3 className="text-[24px] font-semibold leading-[1.05] tracking-[-0.035em] text-[color:var(--fg)] sm:text-[28px] md:text-[34px]">
          {card.title}
        </h3>
        <p className="mt-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-[color:var(--muted)]">
          Sub-copy text
        </p>
        <p className="mt-4 max-w-[480px] text-[14px] leading-[1.7] text-[color:var(--muted)] md:text-[15px]">
          {card.description}
        </p>
        {card.tags.length > 1 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {card.tags.slice(1).map((t) => (
              <Pill key={t} variant={isWip ? "muted" : "default"}>
                {t}
              </Pill>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * OverlayPill — pill that sits inside a dark hero card. Transparent fill +
 * thin white border + white text so it reads on the black backdrop. Pulled
 * out as a helper so MoodPlan and the other WorkCards share one style.
 */
function OverlayPill({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-4 top-4 z-10 inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-white/40 bg-transparent px-2.5 py-[3px] text-[9px] font-medium tracking-[0.01em] text-white/90 backdrop-blur-sm sm:text-[10px] md:text-[11px]">
      {children}
    </span>
  );
}

function Body({
  tags,
  title,
  description,
  isWip,
}: {
  tags: string[];
  title: string;
  description: string;
  isWip: boolean;
}): ReactNode {
  return (
    <div className="flex h-full flex-col">
      <h3 className="text-[24px] font-semibold leading-[1.05] tracking-[-0.035em] text-[color:var(--fg)] sm:text-[28px] md:text-[34px]">
        {title}
      </h3>
      <p className="mt-3 max-w-[560px] text-[14px] leading-[1.7] text-[color:var(--muted)]">
        {description}
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pt-8">
        {tags.map((t) => (
          <Pill key={t} variant={isWip ? "muted" : "default"}>
            {t}
          </Pill>
        ))}
      </div>
    </div>
  );
}
