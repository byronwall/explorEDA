import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { exampleGroups } from "../demos/exampleIndex";
import { examples } from "../demos/examples";
import { SectionHeading } from "../landing/SectionHeading";
import { SiteNav } from "../landing/SiteNav";
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
    <div className="pb-16">
      <header className="landing-hero relative">
        <div
          aria-hidden="true"
          className="landing-hero-grid pointer-events-none absolute inset-0"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <SiteNav current="examples" />
          <h1 className="mt-10 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            All examples
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/75 sm:text-lg">
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
                className="rounded-full border border-band-border bg-white/5 px-3.5 py-1.5 font-medium text-white transition-colors hover:border-brand-teal/60 hover:bg-brand-teal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
              >
                {group.heading}{" "}
                <span className="tabular-nums text-brand-teal">
                  {group.examples.length}
                </span>
              </a>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto mt-14 max-w-6xl space-y-16 px-4 sm:px-6">
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
