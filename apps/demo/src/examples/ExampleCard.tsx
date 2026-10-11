import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ExampleData } from "../demos/examples";
import { examplePath } from "../routes";

/** A compact link to one example: its title, summary, data, and highlights. */
export function ExampleCard({ example }: { example: ExampleData }) {
  const Icon = example.icon;
  const { rows, source } = example.dataset;
  return (
    <li className="group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-colors focus-within:ring-2 focus-within:ring-ring hover:bg-accent/40">
      <div className="flex items-start gap-3">
        <Icon
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug text-card-foreground">
          <Link
            to={examplePath(example.id)}
            className="after:absolute after:inset-0 after:rounded-xl after:content-[''] focus-visible:outline-none"
          >
            {example.title}
          </Link>
        </h3>
        <ArrowRight
          aria-hidden="true"
          className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none"
        />
      </div>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {example.description}
      </p>
      <p className="mt-auto pt-3 text-xs text-muted-foreground">
        <span className="tabular-nums">{rows}</span> ·{" "}
        {source === "Real" ? "real data" : "synthetic"}
      </p>
      <ul
        aria-label="Shows"
        className="mt-2 flex flex-wrap gap-1.5 text-xs font-medium"
      >
        {example.shows.map((item) => (
          <li key={item} className="rounded-md bg-muted px-2 py-0.5">
            {item}
          </li>
        ))}
      </ul>
    </li>
  );
}

export function ExampleCardGrid({ examples }: { examples: ExampleData[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {examples.map((example) => (
        <ExampleCard key={example.id} example={example} />
      ))}
    </ul>
  );
}
