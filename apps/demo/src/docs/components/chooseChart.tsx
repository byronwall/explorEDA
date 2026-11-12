import { Link } from "react-router-dom";
import { catalogue, GROUP_LABELS, type DocsGroup } from "../catalogue";
import { CHART_CHOICES, CHART_QUESTIONS } from "../chooser";
import { GLANCES } from "../glance";
import { docsPath } from "../paths";
import { inlineLinkClass } from "./chrome";

function ChartLink({ type }: { type: string }) {
  const page = catalogue.find((item) => item.chartType === type);
  return (
    <Link className={inlineLinkClass} to={docsPath(page?.topic ?? type)}>
      {page?.title ?? type}
    </Link>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Each question a reader brings, with the charts that answer it. */
export function ChartQuestions() {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {CHART_QUESTIONS.map((question) => (
        <section
          key={question.id}
          aria-label={question.question}
          className="min-w-0 rounded-lg border border-border bg-card p-4"
        >
          <p className="text-sm font-semibold text-foreground">
            {question.question}
          </p>
          <ul className="mt-2 space-y-1.5 text-sm leading-6 text-foreground/80">
            {question.picks.map(([type, why]) => (
              <li key={type}>
                <ChartLink type={type} />: {why}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Every chart type by sidebar section: when to use it, and what it needs. */
export function ChartTypeList() {
  const groups = (Object.keys(GROUP_LABELS) as DocsGroup[])
    .map((group) => ({
      group,
      pages: catalogue.filter((page) => page.group === group && page.chartType),
    }))
    .filter(({ pages }) => pages.length > 0);
  return (
    <div className="mt-5 space-y-6">
      {groups.map(({ group, pages }) => (
        <section key={group} aria-label={GROUP_LABELS[group]}>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
            {GROUP_LABELS[group]}
          </p>
          <div
            aria-hidden="true"
            className="mt-2 hidden gap-x-4 px-4 text-xs text-muted-foreground md:grid md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)]"
          >
            <span>Chart</span>
            <span>Use it when</span>
            <span>It needs</span>
          </div>
          <dl className="mt-1.5 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
            {pages.map((page) => {
              const type = page.chartType!;
              return (
                <div
                  key={type}
                  className="grid gap-x-4 gap-y-1 px-4 py-3 text-sm leading-6 md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)]"
                >
                  <dt className="font-semibold">
                    <ChartLink type={type} />
                  </dt>
                  <dd className="text-foreground/80">
                    <span className="sr-only">Use it when </span>
                    {capitalize(CHART_CHOICES[type]?.when ?? "")}
                  </dd>
                  <dd className="text-muted-foreground">
                    <span className="sr-only">It needs: </span>
                    {GLANCES[type]?.needs}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}
