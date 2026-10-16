import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { docsPath } from "../docs/paths";
import { SectionHeading } from "./SectionHeading";

const moves = [
  {
    gesture: "Click or drag",
    title: "Filter from any chart",
    body: "Select a bar, a range, or a cell. Every other view and the record table narrow to the same rows.",
    topic: "filters",
    guide: "Filters",
  },
  {
    gesture: "Alt-click",
    title: "Trace a mark to its rows",
    body: "Follow a bar, a point, or a total back through each step to the source records behind it.",
    topic: "trace",
    guide: "Tracing",
  },
  {
    gesture: "Edit a field",
    title: "Write formulas you can check",
    body: "A calculated field shows what it depends on and previews a draft before any chart uses it.",
    topic: "calculated-fields",
    guide: "Calculated fields",
  },
  {
    gesture: "onStateChange",
    title: "Keep the analysis",
    body: "Layout, filters, and formulas come back as JSON. Store it anywhere and restore it with savedData.",
    topic: "developers",
    guide: "Developers",
  },
];

export function WhyWorkspace() {
  return (
    <section aria-labelledby="why-heading">
      <SectionHeading id="why-heading" heading="What the workspace adds">
        The charts are only part of it. These work the same way in every view
        and every example on this site.
      </SectionHeading>
      <dl className="mt-10 border-b border-border">
        {moves.map(({ gesture, title, body, topic, guide }) => (
          <div
            key={title}
            className="grid gap-x-8 gap-y-2 border-t border-border py-5 md:grid-cols-[10rem_minmax(0,16rem)_minmax(0,1fr)_auto] md:items-baseline"
          >
            <div>
              <kbd className="rounded border border-border border-b-2 bg-card px-1.5 py-px font-mono text-xs font-medium text-foreground">
                {gesture}
              </kbd>
            </div>
            <dt className="font-semibold text-site-ink">{title}</dt>
            <dd className="text-sm leading-relaxed text-muted-foreground">
              {body}
            </dd>
            <dd>
              <Link
                to={docsPath(topic)}
                aria-label={`${guide} guide`}
                className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-site-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {guide}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
