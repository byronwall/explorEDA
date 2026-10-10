import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { exampleGroups } from "../demos/exampleIndex";
import { examples } from "../demos/examples";
import { SectionHeading } from "../landing/SectionHeading";
import { ExampleCardGrid } from "./ExampleCard";

/** Every example on one page, grouped by kind, with a jump link to each group. */
export function ExamplesIndex() {
  const { hash } = useLocation();
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) {
      target.scrollIntoView?.({ block: "start" });
    } else {
      window.scrollTo?.({ top: 0 });
    }
  }, [hash]);

  return (
    <div className="pb-16 pt-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Home
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        All examples
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
        {examples.length} examples, each opening as a live workspace you can
        filter, inspect, and change.
      </p>
      <nav
        aria-label="Example groups"
        className="mt-6 flex flex-wrap gap-2 text-sm"
      >
        {exampleGroups.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className="rounded-md border border-border bg-card px-3 py-1.5 font-medium transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {group.heading}{" "}
            <span className="tabular-nums text-muted-foreground">
              {group.examples.length}
            </span>
          </a>
        ))}
      </nav>
      <div className="mt-14 space-y-16">
        {exampleGroups.map((group) => (
          <section
            key={group.id}
            id={group.id}
            aria-labelledby={`${group.id}-heading`}
            className="scroll-mt-8"
          >
            <div className="mb-6">
              <SectionHeading
                id={`${group.id}-heading`}
                heading={group.heading}
              >
                {group.body}
              </SectionHeading>
            </div>
            <ExampleCardGrid examples={group.examples} />
          </section>
        ))}
      </div>
    </div>
  );
}
