import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  variant?: "default" | "accent" | "muted";
  className?: string;
};

/**
 * Small rounded badge. Used for availability pills, card tags, skill chips.
 * Monochrome by default to match the palette.
 */
export function Pill({ children, variant = "default", className = "" }: Props) {
  const variants = {
    default:
      "border-fg/15 bg-fg/[0.02] text-fg/70 hover:border-fg/30 hover:text-fg",
    accent: "border-fg/80 bg-fg text-bg",
    muted: "border-fg/10 bg-transparent text-fg/50",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-[0.01em] transition-colors sm:text-[12px] md:text-[13px]",
        variants[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function AvailabilityPill({ children }: { children: ReactNode }) {
  return (
    <Pill variant="accent" className="pl-2.5">
      <span
        aria-hidden
        className="inline-block h-1.5 w-1.5 rounded-full bg-bg"
      />
      {children}
    </Pill>
  );
}
