import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { compositionExamples } from "../demos/exampleIndex";
import { ExampleCardGrid } from "../examples/ExampleCard";
import { EXAMPLES_PATH } from "../routes";
import { SectionHeading } from "./SectionHeading";

const PREVIEW_COUNT = 6;

/** The newest report graphics, with a link to the rest. */
export function ReportGraphics() {
  if (compositionExamples.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="report-graphics-heading">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading id="report-graphics-heading" heading="Report graphics">
          Compose a finished graphic from your rows: titles, repeated chart
          units, shared scales, and callouts on one artboard. Filters still
          reach every mark.
        </SectionHeading>
        <Link
          to={`${EXAMPLES_PATH}#report-graphics`}
          className="inline-flex shrink-0 items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          All {compositionExamples.length} report graphics
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <ExampleCardGrid examples={compositionExamples.slice(0, PREVIEW_COUNT)} />
    </section>
  );
}
