import { Link } from "react-router-dom";
import { catalogue as docsPages } from "../docs/catalogue";
import { docsPath } from "../docs/paths";
import { examples } from "../demos/examples";
import { EXAMPLES_PATH } from "../routes";

const viewCount = docsPages.filter((page) => page.chartType).length;

const stats = [
  { value: viewCount, label: "chart and table views", to: "#views" },
  { value: examples.length, label: "live examples", to: EXAMPLES_PATH },
  { value: docsPages.length, label: "guides with live demos", to: docsPath() },
  { value: "3 + 1", label: "props and a ref to embed", to: "#integration" },
];

/** What the project holds, counted from the docs and example catalogues. */
export function ProofStrip() {
  return (
    <section aria-label="At a glance">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
        {stats.map(({ value, label, to }) => (
          <div
            key={label}
            className="group relative flex flex-col-reverse bg-card px-5 py-5 transition-colors focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring hover:bg-brand-teal/5 sm:px-6"
          >
            <dt className="mt-1 text-sm text-muted-foreground">
              <Link
                to={to}
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
              >
                {label}
              </Link>
            </dt>
            <dd className="text-3xl font-bold tabular-nums tracking-tight text-foreground transition-colors group-hover:text-site-accent sm:text-4xl">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
