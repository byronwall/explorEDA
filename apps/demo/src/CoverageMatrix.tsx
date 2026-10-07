import {
  coverageFamilies,
  coverageFeatures,
  exampleCoverage,
  getExampleUsageStatus,
  getExamplesUsingFeature,
  getFeatureReviewStatus,
  getImplementationStatus,
} from "@/demos/coverage";
import type {
  CoverageFeature,
  ExampleUsageStatus,
  ImplementationStatus,
} from "@/demos/coverage";
import { examples } from "@/demos/examples";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./CoverageMatrix.css";

type Tone = "success" | "info" | "danger" | "muted";

const implementationDisplay: Record<
  ImplementationStatus,
  { label: string; tone: Tone }
> = {
  supported: { label: "Implemented", tone: "success" },
  "not-supported": { label: "Not implemented", tone: "danger" },
  "not-checked": { label: "Not checked", tone: "muted" },
};

const usageDisplay: Record<
  ExampleUsageStatus,
  { label: string; tone: Tone }
> = {
  reviewed: { label: "Example checked", tone: "success" },
  shown: { label: "Example shown", tone: "info" },
  "not-used": { label: "No recorded usage", tone: "muted" },
};

const exampleById = new Map(examples.map((example) => [example.id, example]));
const featureById = new Map(
  coverageFeatures.map((feature) => [feature.id, feature])
);

function exampleHref(exampleId: string) {
  return `/examples/${exampleId}`;
}

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

function Chip({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <span className="coverage-chip" data-tone={tone}>
      {children}
    </span>
  );
}

/** One square per example: checked, shown, or not recorded. */
function UsageMark({ status }: { status: ExampleUsageStatus }) {
  if (status === "reviewed") {
    return (
      <span className="coverage-mark" data-status="reviewed" aria-hidden="true">
        <Check strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="coverage-mark" data-status={status} aria-hidden="true" />
  );
}

function featureGaps(feature: CoverageFeature) {
  return feature.gaps ?? [];
}

function reviewedExampleCount(feature: CoverageFeature) {
  return examples.filter(
    (example) => getExampleUsageStatus(feature.id, example.id) === "reviewed"
  ).length;
}

function hasAttention(feature: CoverageFeature) {
  return (
    featureGaps(feature).length > 0 ||
    getImplementationStatus(feature.id) !== "supported" ||
    getExamplesUsingFeature(feature.id).length === 0 ||
    getFeatureReviewStatus(feature.id) !== "reviewed"
  );
}

function getSummary() {
  const total = coverageFeatures.length;
  const implemented = coverageFeatures.filter(
    (feature) => getImplementationStatus(feature.id) === "supported"
  ).length;
  const withEvidence = coverageFeatures.filter(
    (feature) => getExamplesUsingFeature(feature.id).length > 0
  ).length;
  const reviewed = coverageFeatures.filter(
    (feature) => getFeatureReviewStatus(feature.id) === "reviewed"
  ).length;
  const attention = coverageFeatures.filter(hasAttention).length;
  return { total, implemented, withEvidence, reviewed, attention };
}

function StatTile({
  label,
  value,
  total,
  tone,
  hint,
}: {
  label: string;
  value: number;
  total?: number;
  tone: Tone;
  hint: string;
}) {
  return (
    <div className="coverage-stat" data-tone={tone}>
      <div className="coverage-stat-label">{label}</div>
      <div className="coverage-stat-value">
        {value}
        {total !== undefined && (
          <span className="coverage-stat-total"> / {total}</span>
        )}
      </div>
      {total !== undefined && (
        <div className="coverage-meter" aria-hidden="true">
          <span style={{ width: `${(value / total) * 100}%` }} />
        </div>
      )}
      <p className="coverage-stat-hint">{hint}</p>
    </div>
  );
}

function SummaryStrip() {
  const summary = getSummary();
  return (
    <section
      aria-label="Coverage summary"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      <StatTile
        label="Implemented"
        value={summary.implemented}
        total={summary.total}
        tone="success"
        hint="Product support exists."
      />
      <StatTile
        label="With evidence"
        value={summary.withEvidence}
        total={summary.total}
        tone="info"
        hint="At least one example declares it."
      />
      <StatTile
        label="Reviewed"
        value={summary.reviewed}
        total={summary.total}
        tone="success"
        hint="Checked in at least one example."
      />
      <StatTile
        label="Needs attention"
        value={summary.attention}
        tone={summary.attention ? "danger" : "success"}
        hint="Missing support, evidence, or review."
      />
    </section>
  );
}

function FeatureRow({ feature }: { feature: CoverageFeature }) {
  const implementation =
    implementationDisplay[getImplementationStatus(feature.id)];
  const exampleIds = getExamplesUsingFeature(feature.id);
  const reviewedCount = reviewedExampleCount(feature);
  const gaps = featureGaps(feature);

  return (
    <li className="coverage-feature">
      <details className="group">
        <summary className="coverage-feature-summary">
          <span className="coverage-feature-name">
            <ChevronRight
              aria-hidden="true"
              className="coverage-chevron group-open:rotate-90"
            />
            <span className="min-w-0">
              <span className="block font-medium">{feature.label}</span>
              <span className="coverage-feature-description">
                {feature.description}
              </span>
            </span>
          </span>
          <span className="coverage-cell" data-label="Implementation">
            <Chip tone={implementation.tone}>{implementation.label}</Chip>
          </span>
          <span className="coverage-cell" data-label="Evidence">
            <span className="coverage-strip" aria-hidden="true">
              {examples.map((example) => (
                <UsageMark
                  key={example.id}
                  status={getExampleUsageStatus(feature.id, example.id)}
                />
              ))}
            </span>
            <span className="coverage-count">
              {exampleIds.length
                ? plural(exampleIds.length, "example")
                : "No evidence"}
            </span>
          </span>
          <span className="coverage-cell" data-label="Review">
            {reviewedCount ? (
              <Chip tone="success">
                <Check aria-hidden="true" strokeWidth={3} />
                Checked in {reviewedCount}
              </Chip>
            ) : (
              <Chip tone="muted">Review pending</Chip>
            )}
          </span>
          {gaps.length > 0 && (
            <span className="coverage-gap-line">
              {plural(gaps.length, "open gap")}
            </span>
          )}
        </summary>
        <div className="coverage-feature-detail">
          {gaps.length > 0 && (
            <div>
              <h4 className="coverage-detail-heading">Open gaps</h4>
              <ul className="coverage-gap-list">
                {gaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h4 className="coverage-detail-heading">Example evidence</h4>
            {exampleIds.length === 0 ? (
              <p className="text-muted-foreground">
                No example declares this feature.
              </p>
            ) : (
              <ul className="coverage-evidence-list">
                {exampleIds.map((exampleId) => {
                  const example = exampleById.get(exampleId);
                  const status = getExampleUsageStatus(feature.id, exampleId);
                  const display = usageDisplay[status];
                  return (
                    <li key={exampleId}>
                      <UsageMark status={status} />
                      <Link to={exampleHref(exampleId)} className="coverage-link">
                        {example?.title ?? exampleId}
                      </Link>
                      <span className="coverage-evidence-status">
                        {display.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </details>
    </li>
  );
}

function FeatureList({ showAll }: { showAll: boolean }) {
  const features = showAll
    ? coverageFeatures
    : coverageFeatures.filter(hasAttention);

  return (
    <section aria-labelledby="coverage-view-title">
      <ViewHeading
        heading={showAll ? "All features" : "Needs attention"}
        description={
          showAll
            ? "Every feature with its implementation, example evidence, and review."
            : "Features with missing support, no example evidence, or no reviewed example."
        }
      />
      {features.length === 0 ? (
        <p className="coverage-panel p-6 text-muted-foreground">
          Every feature is implemented, has evidence, and is reviewed.
        </p>
      ) : (
        <div className="coverage-panel">
          <div className="coverage-feature-head" aria-hidden="true">
            <span>Feature</span>
            <span>Implementation</span>
            <span>Evidence by example</span>
            <span>Review</span>
          </div>
          {coverageFamilies.map((family) => {
            const familyFeatures = features.filter(
              (feature) => feature.family === family
            );
            if (familyFeatures.length === 0) {
              return null;
            }
            const familyId = `family-${family.replace(/\W+/g, "-")}`;
            return (
              <section key={family} aria-labelledby={familyId}>
                <div className="coverage-family">
                  <h3 id={familyId}>{family}</h3>
                  <span>{plural(familyFeatures.length, "feature")}</span>
                </div>
                <ul aria-label={`${family} features`}>
                  {familyFeatures.map((feature) => (
                    <FeatureRow key={feature.id} feature={feature} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Legend({ showEmpty = true }: { showEmpty?: boolean }) {
  return (
    <ul className="coverage-legend" aria-label="Matrix legend">
      <li>
        <UsageMark status="reviewed" />
        Example checked
      </li>
      <li>
        <UsageMark status="shown" />
        Example shown
      </li>
      {showEmpty && (
        <li>
          <UsageMark status="not-used" />
          Not recorded
        </li>
      )}
    </ul>
  );
}

function ExampleMatrix() {
  return (
    <section aria-labelledby="coverage-view-title">
      <ViewHeading
        heading="Example matrix"
        description="Each column is an example. Select a mark to open that example."
      >
        <Legend />
      </ViewHeading>
      <div
        role="region"
        aria-label="Scrollable example usage matrix"
        tabIndex={0}
        className="coverage-panel coverage-matrix-scroll"
      >
        <table aria-label="Full example usage matrix" className="coverage-matrix">
          <thead>
            <tr>
              <th scope="col" className="coverage-matrix-corner sticky top-0">
                Feature
              </th>
              {examples.map((example) => {
                const Icon = example.icon;
                return (
                  <th
                    key={example.id}
                    scope="col"
                    className="coverage-matrix-example sticky top-0"
                  >
                    <Link to={exampleHref(example.id)}>
                      <Icon aria-hidden="true" />
                      <span>{example.title}</span>
                    </Link>
                  </th>
                );
              })}
              <th scope="col" className="coverage-matrix-total sticky top-0">
                Examples
              </th>
            </tr>
          </thead>
          {coverageFamilies.map((family) => (
            <tbody key={family}>
              <tr className="coverage-matrix-family">
                <th scope="rowgroup" colSpan={examples.length + 2}>
                  <span>{family}</span>
                </th>
              </tr>
              {coverageFeatures
                .filter((feature) => feature.family === family)
                .map((feature) => {
                  const implementation = getImplementationStatus(feature.id);
                  const count = getExamplesUsingFeature(feature.id).length;
                  return (
                    <tr key={feature.id}>
                      <th scope="row" className="coverage-matrix-feature">
                        <span>{feature.label}</span>
                        {implementation !== "supported" && (
                          <Chip tone={implementationDisplay[implementation].tone}>
                            {implementationDisplay[implementation].label}
                          </Chip>
                        )}
                      </th>
                      {examples.map((example) => {
                        const status = getExampleUsageStatus(
                          feature.id,
                          example.id
                        );
                        if (status === "not-used") {
                          return (
                            <td
                              key={example.id}
                              aria-label={`${example.title}: no recorded usage`}
                              className="coverage-matrix-cell"
                            >
                              <UsageMark status="not-used" />
                            </td>
                          );
                        }
                        return (
                          <td key={example.id} className="coverage-matrix-cell">
                            <Link
                              to={exampleHref(example.id)}
                              aria-label={`${example.title}: ${feature.label} — ${usageDisplay[status].label}`}
                            >
                              <UsageMark status={status} />
                            </Link>
                          </td>
                        );
                      })}
                      <td
                        className="coverage-matrix-total"
                        data-empty={count === 0 || undefined}
                      >
                        {count}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          ))}
          <tfoot>
            <tr>
              <th scope="row" className="coverage-matrix-feature">
                Features
              </th>
              {examples.map((example) => (
                <td key={example.id} className="coverage-matrix-total">
                  {
                    coverageFeatures.filter(
                      (feature) =>
                        getExampleUsageStatus(feature.id, example.id) !==
                        "not-used"
                    ).length
                  }
                </td>
              ))}
              <td className="coverage-matrix-total" />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function ExampleUsage() {
  const entries = exampleCoverage
    .map((entry) => ({
      ...entry,
      features: coverageFeatures.flatMap((feature) => {
        const status = getExampleUsageStatus(feature.id, entry.exampleId);
        return status === "not-used" ? [] : ([[feature.id, status]] as const);
      }),
    }))
    .filter((entry) => entry.features.length > 0);

  return (
    <section aria-labelledby="coverage-view-title">
      <ViewHeading
        heading="Example usage"
        description="What each example shows or has checked. Features it does not use are left out."
      >
        <Legend showEmpty={false} />
      </ViewHeading>
      <div className="grid gap-3 md:grid-cols-2">
        {entries.map((entry) => {
          const example = exampleById.get(entry.exampleId);
          const Icon = example?.icon;
          const checked = entry.features.filter(
            ([, status]) => status === "reviewed"
          ).length;
          return (
            <section
              key={entry.exampleId}
              aria-labelledby={`example-${entry.exampleId}`}
              className="coverage-panel coverage-example"
            >
              <header className="flex items-start gap-3">
                {Icon && (
                  <span className="coverage-example-icon" aria-hidden="true">
                    <Icon />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <h3
                    id={`example-${entry.exampleId}`}
                    className="font-semibold leading-snug"
                  >
                    <Link
                      to={exampleHref(entry.exampleId)}
                      className="coverage-link"
                    >
                      {example?.title ?? entry.exampleId}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.intent}
                  </p>
                </div>
              </header>
              <p className="coverage-example-counts">
                {plural(entry.features.length, "feature")} ·{" "}
                {checked} checked
              </p>
              <ul className="coverage-pill-list">
                {entry.features.map(([featureId, status]) => {
                  const feature = featureById.get(featureId);
                  if (!feature) {
                    return null;
                  }
                  return (
                    <li
                      key={featureId}
                      className="coverage-pill"
                      data-status={status}
                    >
                      <UsageMark status={status} />
                      {feature.label}
                      <span className="sr-only">
                        {" "}
                        — {usageDisplay[status].label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}

function ViewHeading({
  heading,
  description,
  children,
}: {
  heading: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl">
        <h2 id="coverage-view-title" className="text-lg font-semibold">
          {heading}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

const VIEWS = [
  { id: "attention", label: "Needs attention" },
  { id: "all", label: "All features" },
  { id: "matrix", label: "Example matrix" },
  { id: "examples", label: "Example usage" },
] as const;

type CoverageView = (typeof VIEWS)[number]["id"];

function viewHref(view: CoverageView) {
  return view === "attention"
    ? "?view=coverage"
    : `?view=coverage&coverage=${view}`;
}

export function CoverageMatrix() {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("coverage");
  const view: CoverageView =
    VIEWS.find(({ id }) => id === requested)?.id ?? "attention";
  const summary = getSummary();
  const counts: Partial<Record<CoverageView, number>> = {
    attention: summary.attention,
    all: summary.total,
  };

  return (
    <main className="coverage mx-auto w-full max-w-[1400px] pb-16">
      <Link to="/" className="coverage-back">
        <ArrowLeft aria-hidden="true" />
        Examples
      </Link>
      <header className="mt-3 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Feature coverage
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Which features the product implements, which examples show them, and
          which of those have been checked.
        </p>
      </header>

      <SummaryStrip />

      <dl className="coverage-terms">
        <div>
          <dt>Implemented</dt>
          <dd>The product supports the feature.</dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>An example declares that it shows the feature.</dd>
        </div>
        <div>
          <dt>Checked</dt>
          <dd>
            One feature was reviewed in one example. A feature counts as
            reviewed once any example checks it.
          </dd>
        </div>
      </dl>

      <nav aria-label="Coverage views" className="coverage-tabs">
        {VIEWS.map(({ id, label }) => (
          <Link
            key={id}
            to={viewHref(id)}
            aria-current={view === id ? "page" : undefined}
          >
            {label}
            {counts[id] !== undefined && (
              <span className="coverage-tab-count" aria-hidden="true">
                {counts[id]}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {view === "matrix" ? (
        <ExampleMatrix />
      ) : view === "examples" ? (
        <ExampleUsage />
      ) : (
        <FeatureList showAll={view === "all"} />
      )}
    </main>
  );
}
