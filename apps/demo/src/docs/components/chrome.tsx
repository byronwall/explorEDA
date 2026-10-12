import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, ChevronRight, PencilLine } from "lucide-react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { DocsPage } from "../catalogue";
import { docsPath } from "../paths";

export const proseClass = "text-[0.9375rem] leading-7 text-foreground/80";
export const inlineCodeClass =
  "rounded border border-border/70 bg-muted/70 px-[0.3em] py-px font-mono text-[0.85em] text-foreground";
export const inlineLinkClass =
  "font-medium text-docs-accent underline decoration-docs-accent/30 underline-offset-[3px] transition-colors hover:decoration-docs-accent focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const labelClass =
  "text-xs font-semibold uppercase tracking-wide text-foreground/70";
export const stretchedLinkClass =
  "after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none";
export const cardLinkClass =
  "group relative rounded-xl border border-border bg-card transition-[border-color,box-shadow] focus-within:ring-2 focus-within:ring-ring hover:border-docs-accent/40 hover:shadow-[0_6px_24px_-12px_color-mix(in_oklab,var(--foreground)_25%,transparent)]";

const SOURCE_BASE =
  "https://github.com/byronwall/explorEDA/blob/main/apps/demo/src/docs/pages/";

/** The page's title block. `trail` names the section it sits in. */
export function PageHeader({
  trail,
  heading,
  children,
}: {
  trail?: readonly string[];
  heading: string;
  children?: ReactNode;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, [heading]);

  return (
    <header className="pt-8 sm:pt-10">
      {trail && trail.length > 0 && (
        <p className="flex items-center gap-1 text-sm font-medium text-docs-accent">
          {trail.map((step, index) => (
            <span key={step} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  aria-hidden="true"
                  className="size-3.5 text-muted-foreground"
                />
              )}
              {step}
            </span>
          ))}
        </p>
      )}
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-3xl font-bold leading-tight tracking-[-0.025em] text-balance outline-none sm:text-4xl"
      >
        {heading}
      </h1>
      {children && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          {children}
        </p>
      )}
    </header>
  );
}

function PagerLink({
  page,
  direction,
}: {
  page: DocsPage;
  direction: "previous" | "next";
}) {
  const next = direction === "next";
  return (
    <Link
      to={docsPath(page.topic)}
      className={cn(
        "group flex flex-col gap-1 rounded-lg border border-border px-4 py-3 transition-colors hover:border-docs-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        next && "items-end text-right sm:col-start-2"
      )}
    >
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        {!next && <ArrowLeft aria-hidden="true" className="size-3.5" />}
        {next ? "Next" : "Previous"}
        {next && <ArrowRight aria-hidden="true" className="size-3.5" />}
      </span>
      <span className="font-medium text-foreground group-hover:text-docs-accent">
        {page.title}
      </span>
    </Link>
  );
}

/** Previous and next pages in sidebar order, and where the page's source is. */
export function PageFooter({
  topic,
  previous,
  next,
}: {
  topic: string;
  previous?: DocsPage;
  next?: DocsPage;
}) {
  return (
    <footer className="mt-16 border-t border-border pt-6">
      <a
        href={`${SOURCE_BASE}${topic}.mdx`}
        className="inline-flex items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <PencilLine aria-hidden="true" className="size-3.5" />
        Edit this page on GitHub
      </a>
      {(previous || next) && (
        <nav
          aria-label="Previous and next pages"
          className="mt-6 grid gap-3 sm:grid-cols-2"
        >
          {previous && <PagerLink page={previous} direction="previous" />}
          {next && <PagerLink page={next} direction="next" />}
        </nav>
      )}
    </footer>
  );
}

/** A small link card in the right rail, such as the page's full example. */
export function RailCard({
  label,
  heading,
  meta,
  to,
}: {
  label: string;
  heading: string;
  meta: string;
  to: string;
}) {
  return (
    <div className={cn(cardLinkClass, "p-4")}>
      <p className={labelClass}>{label}</p>
      <p className="mt-2 text-sm font-semibold">
        <Link className={stretchedLinkClass} to={to}>
          {heading}
        </Link>
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{meta}</p>
      <p
        aria-hidden="true"
        className="mt-3 flex items-center gap-1 text-xs font-medium text-docs-accent"
      >
        Open the example
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </p>
    </div>
  );
}
