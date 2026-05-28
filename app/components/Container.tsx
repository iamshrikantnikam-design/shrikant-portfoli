import type { ReactNode, HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/**
 * 1440px max container with responsive horizontal padding:
 *   mobile 20px · tablet 24px · desktop 32px
 * Wraps a 12-column grid with 8px gutter (`Grid`).
 */
export function Container({ children, className = "", ...rest }: Props) {
  return (
    <div
      className={`mx-auto w-full max-w-[1440px] px-5 sm:px-6 md:px-8 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Grid({ children, className = "", ...rest }: Props) {
  return (
    <div className={`grid grid-cols-12 gap-2 ${className}`} {...rest}>
      {children}
    </div>
  );
}
