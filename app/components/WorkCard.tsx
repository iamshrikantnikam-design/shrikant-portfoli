import Link from "next/link";
import type { ReactNode } from "react";
import { Pill } from "./Pill";

type Props = {
  tags: string[];
  title: string;
  description: string;
  href?: string;
  cta?: string;
  status?: "live" | "wip";
  aspect?: string;
  span?: string;
  thumb?: ReactNode;
};

/**
 * Work card. Black placeholder thumbnail, monochrome metadata below.
 * Works on a 12-col grid; defaults to full width.
 */
export function WorkCard({
  tags,
  title,
  description,
  href = "#",
  cta = "View case study",
  status = "live",
  aspect = "aspect-[1376/657]",
  span = "col-span-12",
  thumb,
}: Props) {
  const isWip = status === "wip";

  return (
    <article
      className={[
        "rise-in",
        span,
        isWip ? "opacity-70" : "opacity-100",
      ].join(" ")}
    >
      <Link
        href={href}
        aria-label={`Open ${title}`}
        data-nav-theme="dark"
        className={[
          "group relative block w-full overflow-hidden rounded-[20px] sm:rounded-[24px]",
          "bg-card transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)]",
          aspect,
        ].join(" ")}
      >
        {thumb ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {thumb}
          </div>
        ) : null}
        {isWip ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-dashed border-white/30 px-4 py-2 text-[11px] font-medium tracking-[0.04em] text-white/60 sm:text-[12px] md:text-[13px]">
              Case study in progress
            </span>
          </div>
        ) : null}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:mt-5 sm:gap-2">
        {tags.map((t) => (
          <Pill key={t} variant={isWip ? "muted" : "default"}>
            {t}
          </Pill>
        ))}
      </div>

      <h3 className="mt-3 text-[24px] font-semibold leading-[1.15] tracking-[-0.035em] sm:text-[28px] md:text-[34px] lg:text-[40px]">
        {title}
      </h3>

      <p className="mt-2 max-w-[640px] text-[15px] leading-[1.55] text-fg/60 sm:text-[16px] md:text-[18px]">
        {description}
      </p>

      {!isWip ? (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-fg underline decoration-fg/30 underline-offset-[6px] transition hover:decoration-fg sm:text-[14px] md:text-[15px]"
        >
          {cta} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </article>
  );
}
