import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { catalogue as docsPages } from "../docs/catalogue";
import { docsPath } from "../docs/paths";
import { SectionHeading } from "./SectionHeading";

const views = docsPages.filter((page) => page.chartType);

/** Every chart and table view, each linking to its guide. */
export function ChartGallery() {
  return (
    <section aria-labelledby="views-heading" id="views" className="scroll-mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          id="views-heading"
          eyebrow="Chart guides"
          heading={`${views.length} views, one way to select`}
        >
          Scatter to Sankey, pivot to map: every view filters the others the
          same way. Each guide explains what the view computes and lets you try
          it live.
        </SectionHeading>
        <Link
          to={docsPath("rendering")}
          className="inline-flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-site-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          How rendering works
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {views.map(({ topic, title, summary, icon: Icon }) => (
          <li
            key={topic}
            className="group relative flex items-center gap-3 rounded-xl sm:items-start border border-border bg-card p-3.5 transition-colors focus-within:ring-2 focus-within:ring-ring hover:border-site-accent/50 hover:bg-brand-teal/5"
          >
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 text-site-accent transition-colors group-hover:bg-brand-navy group-hover:text-brand-teal"
            >
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-snug">
                <Link
                  to={docsPath(topic)}
                  className="after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none"
                >
                  {title}
                </Link>
              </h3>
              <p className="mt-0.5 hidden text-xs leading-relaxed text-muted-foreground sm:line-clamp-2">
                {summary}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
