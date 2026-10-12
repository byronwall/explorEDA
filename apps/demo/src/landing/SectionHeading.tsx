import type { ReactNode } from "react";

export function SectionHeading({
  id,
  eyebrow,
  heading,
  children,
}: {
  id: string;
  /** A short label above the heading, in the site accent. */
  eyebrow?: string;
  heading: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-site-accent">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="text-3xl font-bold tracking-[-0.025em] text-balance sm:text-4xl"
      >
        {heading}
      </h2>
      {children && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {children}
        </p>
      )}
    </div>
  );
}
