import type { ReactNode } from "react";

export function SectionHeading({
  id,
  heading,
  children,
}: {
  id: string;
  heading: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <h2
        id={id}
        className="text-3xl font-bold tracking-[-0.025em] text-site-ink text-balance sm:text-4xl"
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
