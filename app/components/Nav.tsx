"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";

const ITEMS = [
  { label: "Work", href: "/" },
  { label: "About", href: "/about" },
  { label: "System", href: "/design-system" },
] as const;

/**
 * Floating navbar.
 *
 * Renders white glyphs over `mix-blend-mode: difference`. Instead of the
 * prior per-element JS theme swap, the browser inverts the nav against
 * whatever section is behind it — requires every section below to declare
 * an explicit `background-color` so the blend has something to subtract.
 *
 * Fixed-position so it floats above the layout regardless of scroll.
 * Transparent background lets the blend-mode do the work. z-100 puts the
 * nav above every other site surface without competing with the layout-
 * grid overlay (z-[100] → this is intentionally the same layer because
 * both are UI chrome; the grid overlay is pointer-events-none so nav still
 * receives input).
 */
export function Nav() {
  const pathname = usePathname();

  return (
    // Fixed + transparent + difference blend = white glyphs that invert to
    // match whatever section sits behind them. No JS theme tracking needed.
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] bg-transparent"
      style={{ mixBlendMode: "difference" }}
    >
      <Container>
        {/*
          Locked 64px desktop / 52px mobile height — audit rule: navbar
          must not size to content. Every child is items-center on a single
          flex row so name, links and CTA share the same baseline.
        */}
        <nav className="pointer-events-auto flex h-[52px] items-center justify-between gap-4 md:h-16">
          <Link
            href="/"
            // Identity tier matches the CTA text spec: 14/600 uppercase.
            className="text-[14px] font-semibold uppercase text-white"
          >
            Shrikant Nikam
          </Link>

          {/*
            Right cluster. Work / About / Contact all at 18/600 to match the
            name. One shared gap-10 between every child gives equal breathing
            room — Work↔About and About↔Contact measure the same.
          */}
          <div className="flex items-center gap-10">
            <div className="hidden items-center gap-10 md:flex">
              {ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname?.startsWith(item.href);
                return (
                  <NavLink
                    key={item.href}
                    {...item}
                    active={!!isActive}
                  />
                );
              })}
            </div>

          </div>
        </nav>
      </Container>
    </header>
  );
}

function NavLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      // Matches the CTA text spec — 14/600 uppercase — so nav links and
      // the contact button share one typographic system.
      className={[
        "text-[14px] font-semibold uppercase text-white transition-opacity duration-300",
        active ? "opacity-100" : "opacity-70 hover:opacity-100",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
