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
      <h2 id={id} className="text-2xl font-bold tracking-tight sm:text-3xl">
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
