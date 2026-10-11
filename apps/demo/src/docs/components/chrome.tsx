import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { docsPath } from "../paths";

export const proseClass = "text-base leading-7 text-muted-foreground";
export const inlineLinkClass =
  "font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const eyebrowClass =
  "text-xs font-semibold uppercase tracking-wide text-primary";
export const labelClass =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";
export const stretchedLinkClass =
  "after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none";
export const cardLinkClass =
  "group relative rounded-xl border border-border bg-card transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-accent/40";

const crumbLinkClass =
  "rounded-md px-1.5 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DocsBar({ current }: { current?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border pb-4 pt-3">
      <Link
        to="/"
        aria-label="explorEDA home"
        className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img src="/brand/icon.svg" alt="" className="size-7" />
        <img src="/brand/wordmark.svg" alt="" className="h-6 w-auto" />
      </Link>
      <nav aria-label="Documentation" className="min-w-0 text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
          <li>
            <Link className={crumbLinkClass} to="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            {current ? (
              <Link className={crumbLinkClass} to={docsPath()}>
                Docs
              </Link>
            ) : (
              <span
                aria-current="page"
                className="px-1.5 py-1 font-medium text-foreground"
              >
                Docs
              </span>
            )}
          </li>
          {current && (
            <>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <span
                  aria-current="page"
                  className="px-1.5 py-1 font-medium text-foreground"
                >
                  {current}
                </span>
              </li>
            </>
          )}
        </ol>
      </nav>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  heading,
  children,
}: {
  eyebrow: string;
  heading: string;
  children?: ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, [heading]);

  return (
    <header className="max-w-3xl pt-10 sm:pt-14">
      <p className={eyebrowClass}>{eyebrow}</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 text-4xl font-bold leading-[1.08] tracking-[-0.03em] text-balance outline-none sm:text-5xl"
      >
        {heading}
      </h1>
      {children && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {children}
        </p>
      )}
    </header>
  );
}

export function TryCard({
  heading,
  meta,
  to,
  label,
}: {
  heading: string;
  meta: string;
  to: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className={labelClass}>Try it</p>
      <p className="mt-2 font-semibold">{heading}</p>
      <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
      <Button asChild className="mt-4 w-full">
        <Link to={to}>
          {label}
          <ArrowRight aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}
