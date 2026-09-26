import type { ReactNode } from "react";

export function SectionHeading({
  id,
  eyebrow,
  heading,
  children,
}: {
  id: string;
  eyebrow: string;
  heading: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
      >
        {heading}
      </h2>
      {children && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {children}
        </p>
      )}
    </div>
  );
}
