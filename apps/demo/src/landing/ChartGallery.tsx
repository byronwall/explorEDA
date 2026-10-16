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
          heading={`${views.length} chart and table views`}
        >
          Each one filters the others the same way. The guides explain what a
          view computes from your rows, with a live example to try.
        </SectionHeading>
        <Link
          to={docsPath("rendering")}
          className="inline-flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-site-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          How rendering works
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
        {views.map(({ topic, title, summary, icon: Icon }) => (
          <li
            key={topic}
            className="group relative -mx-2.5 flex items-start gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring hover:bg-muted"
          >
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-site-ink transition-colors duration-150 group-hover:text-site-accent"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-snug">
                <Link
                  to={docsPath(topic)}
                  className="after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:outline-none"
                >
                  {title}
                </Link>
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {summary}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
