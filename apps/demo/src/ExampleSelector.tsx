import { ArrowRight } from "lucide-react";
import { describeViews, ExampleData, examples } from "./demos/examples";

const labelClass =
  "text-xs font-medium uppercase tracking-wide text-muted-foreground";

interface ExampleSelectorProps {
  onSelect: (exampleId: string) => void;
  examplesToShow?: ExampleData[];
}

export function ExampleSelector({
  onSelect,
  examplesToShow = examples,
}: ExampleSelectorProps) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      {examplesToShow.map((example) => {
        const Icon = example.icon;
        const views = describeViews(example);
        const { rows, fields, source } = example.dataset;
        return (
          <li
            key={example.id}
            className="group relative grid cursor-pointer gap-x-8 gap-y-4 px-5 py-5 transition-colors focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring hover:bg-accent/40 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_1.25rem] lg:items-center"
          >
            <div className="flex min-w-0 items-start gap-3">
              <Icon
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h3 className="text-base font-semibold leading-snug text-card-foreground">
                  <button
                    type="button"
                    className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                    onClick={() => onSelect(example.id)}
                  >
                    {example.title}
                  </button>
                </h3>
                <p className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  {example.description}
                </p>
              </div>
            </div>
            <dl className="ml-8 grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2.5 border-t border-border pt-4 text-sm lg:ml-0 lg:self-stretch lg:content-center lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <dt className={labelClass}>Data</dt>
              <dd className="min-w-0 text-foreground">
                <span className="font-medium tabular-nums">{rows}</span>
                {" · "}
                <span className="tabular-nums">{fields}</span> fields ·{" "}
                {source === "Real" ? "real data" : "synthetic"}
              </dd>
              {views.count > 0 && (
                <>
                  <dt className={labelClass}>Views</dt>
                  <dd className="min-w-0 text-foreground">
                    <span className="font-medium tabular-nums">
                      {views.count} {views.count === 1 ? "view" : "views"}
                    </span>
                    {" · "}
                    {views.types.join(", ")}
                  </dd>
                </>
              )}
              <dt className={labelClass}>Shows</dt>
              <dd className="flex min-w-0 flex-wrap gap-1.5">
                {example.shows.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </dd>
            </dl>
            <ArrowRight
              aria-hidden="true"
              className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary lg:block"
            />
          </li>
        );
      })}
    </ul>
  );
}
