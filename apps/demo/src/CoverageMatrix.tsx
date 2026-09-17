import { Button } from "@/components/ui/button";
import {
  coverageFamilies,
  coverageFeatures,
  exampleCoverage,
  getExampleUsageStatus,
  getExamplesUsingFeature,
  getFeatureReviewStatus,
  getImplementationStatus,
  getOpenGapCount,
} from "@/demos/coverage";
import type {
  ExampleUsageStatus,
  ImplementationStatus,
  ReviewStatus,
} from "@/demos/coverage";
import { examples } from "@/demos/examples";
import { ArrowLeft } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const implementationLabels: Record<
  ImplementationStatus,
  { label: string; className: string }
> = {
  supported: { label: "Implemented", className: "text-green-700" },
  "not-supported": {
    label: "Not implemented",
    className: "text-destructive",
  },
  "not-checked": {
    label: "Implementation not checked",
    className: "text-muted-foreground",
  },
};

const reviewLabels: Record<ReviewStatus, { label: string; className: string }> =
  {
    reviewed: { label: "Feature reviewed", className: "text-green-700" },
    "not-reviewed": {
      label: "Feature review pending",
      className: "text-muted-foreground",
    },
  };

const usageLabels: Record<
  ExampleUsageStatus,
  { label: string; symbol: string; className: string }
> = {
  shown: { label: "Example shown", symbol: "●", className: "text-blue-700" },
  reviewed: {
    label: "Example checked",
    symbol: "✓",
    className: "text-green-700",
  },
  "not-used": {
    label: "No recorded usage",
    symbol: "—",
    className: "text-muted-foreground",
  },
};

const exampleById = new Map(examples.map((example) => [example.id, example]));
const featureById = new Map(
  coverageFeatures.map((feature) => [feature.id, feature])
);

function Status({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className ?? ""}`}
    >
      {label}
    </span>
  );
}

function featureGapText(feature: (typeof coverageFeatures)[number]) {
  return "gaps" in feature ? feature.gaps : [];
}

function getExampleCheckStatus(
  featureId: (typeof coverageFeatures)[number]["id"]
): { label: string; className: string } {
  const checked = examples.some(
    (example) => getExampleUsageStatus(featureId, example.id) === "reviewed"
  );
  return checked
    ? { label: "Example checked", className: "text-green-700" }
    : { label: "Example check pending", className: "text-muted-foreground" };
}

function hasAttention(feature: (typeof coverageFeatures)[number]) {
  return (
    featureGapText(feature).length > 0 ||
    getImplementationStatus(feature.id) !== "supported" ||
    getExamplesUsingFeature(feature.id).length === 0 ||
    getFeatureReviewStatus(feature.id) !== "reviewed"
  );
}

function FeatureRow({
  feature,
}: {
  feature: (typeof coverageFeatures)[number];
}) {
  const implementation =
    implementationLabels[getImplementationStatus(feature.id)];
  const review = reviewLabels[getFeatureReviewStatus(feature.id)];
  const exampleCheck = getExampleCheckStatus(feature.id);
  const exampleIds = getExamplesUsingFeature(feature.id);
  const gaps = featureGapText(feature);

  return (
    <li className="border-t first:border-t-0">
      <details className="group">
        <summary className="cursor-pointer list-none px-3 py-3 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 [&::-webkit-details-marker]:hidden">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <span className="font-medium">{feature.label}</span>
            <span className="text-xs text-muted-foreground group-open:text-foreground">
              Details
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Status {...implementation} />
            <Status
              label={
                exampleIds.length
                  ? `${exampleIds.length} evidence ${exampleIds.length === 1 ? "example" : "examples"}`
                  : "No evidence"
              }
              className={
                exampleIds.length ? "text-blue-700" : "text-muted-foreground"
              }
            />
            <Status {...review} />
            <Status {...exampleCheck} />
          </div>
          {gaps.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-destructive">
              {gaps.map((gap) => (
                <li key={gap}>Gap: {gap}</li>
              ))}
            </ul>
          )}
        </summary>
        <div className="space-y-3 border-t bg-muted/20 px-3 py-3 text-sm">
          <p className="text-muted-foreground">{feature.description}</p>
          {gaps.length > 0 && (
            <div>
              <h4 className="font-medium">Notes</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {gaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h4 className="font-medium">Evidence and example checks</h4>
            {exampleIds.length === 0 ? (
              <p className="mt-1 text-muted-foreground">
                No example evidence is recorded for this feature.
              </p>
            ) : (
              <ul className="mt-1 space-y-1">
                {exampleIds.map((exampleId) => {
                  const example = exampleById.get(exampleId);
                  const status = getExampleUsageStatus(feature.id, exampleId);
                  const display = usageLabels[status];
                  return (
                    <li key={exampleId}>
                      <Link
                        to={`?example=${exampleId}`}
                        className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                      >
                        {example?.title ?? exampleId}
                      </Link>{" "}
                      <span className={display.className}>
                        ({display.label})
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

function AttentionQueue({ showAll }: { showAll: boolean }) {
  const features = showAll
    ? coverageFeatures
    : coverageFeatures.filter(hasAttention);
  const reviewedCount = coverageFeatures.filter(
    (feature) => getFeatureReviewStatus(feature.id) === "reviewed"
  ).length;
  const evidenceCount = coverageFeatures.filter(
    (feature) => getExamplesUsingFeature(feature.id).length > 0
  ).length;

  return (
    <section aria-labelledby="feature-review-title" className="mt-8">
      <div className="max-w-3xl">
        <h2 id="feature-review-title" className="text-2xl font-semibold">
          {showAll ? "All features" : "Needs attention"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {showAll
            ? "Review implementation, evidence, component review, and example checks for every feature."
            : "Start with known gaps, missing evidence, and unfinished feature or example checks."}
        </p>
        <p className="mt-3 text-sm">
          <strong>{getOpenGapCount()} open gaps</strong>
          <span className="text-muted-foreground">
            {" "}
            · {reviewedCount} of {coverageFeatures.length} features reviewed ·{" "}
            {evidenceCount} with evidence
          </span>
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border">
        {coverageFamilies.map((family) => {
          const familyFeatures = features.filter(
            (feature) => feature.family === family
          );
          if (familyFeatures.length === 0) {
            return null;
          }

          return (
            <section key={family} aria-labelledby={`family-${family}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 bg-muted/70 px-3 py-2">
                <h3 id={`family-${family}`} className="font-semibold">
                  {family}
                </h3>
                <span className="text-sm text-muted-foreground">
                  {familyFeatures.length}{" "}
                  {familyFeatures.length === 1 ? "feature" : "features"}
                </span>
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
    </section>
  );
}

function PositiveExampleUsage() {
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
    <section aria-labelledby="example-usage-title" className="mt-8">
      <div className="max-w-3xl">
        <h2 id="example-usage-title" className="text-2xl font-semibold">
          Example usage
        </h2>
        <p className="mt-2 text-muted-foreground">
          Positive coverage only: examples that show or check a feature. Empty
          cells are omitted.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {entries.map((entry) => {
          const example = exampleById.get(entry.exampleId);
          return (
            <section
              key={entry.exampleId}
              aria-labelledby={`example-${entry.exampleId}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 id={`example-${entry.exampleId}`} className="font-semibold">
                  <Link
                    to={`?example=${entry.exampleId}`}
                    className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                  >
                    {example?.title ?? entry.exampleId}
                  </Link>
                </h3>
                <span className="text-sm text-muted-foreground">
                  {entry.features.length}{" "}
                  {entry.features.length === 1 ? "feature" : "features"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {entry.intent}
              </p>
              <ul className="mt-3 divide-y rounded-lg border">
                {entry.features.map(([featureId, status]) => {
                  const feature = featureById.get(featureId);
                  if (!feature || !status) {
                    return null;
                  }
                  const display = usageLabels[status];
                  return (
                    <li
                      key={featureId}
                      className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                    >
                      <span>{feature.label}</span>
                      <Status
                        label={display.label}
                        className={display.className}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <AdvancedExampleMatrix />
    </section>
  );
}

function AdvancedExampleMatrix() {
  return (
    <details className="mt-8 rounded-lg border">
      <summary className="cursor-pointer px-3 py-3 font-medium outline-none focus-visible:bg-muted/40">
        Advanced: full example matrix
      </summary>
      <div className="border-t p-3">
        <p className="mb-3 text-sm text-muted-foreground">
          Blank cells mean no usage is recorded. Only positive coverage links to
          the example.
        </p>
        <div
          role="region"
          aria-label="Scrollable example usage matrix"
          className="overflow-auto"
        >
          <table
            aria-label="Full example usage matrix"
            className="min-w-[960px] border-separate border-spacing-0 text-sm"
          >
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky top-0 z-10 border-b bg-background p-3 text-left"
                >
                  Feature
                </th>
                {examples.map((example) => (
                  <th
                    key={example.id}
                    scope="col"
                    className="sticky top-0 z-10 w-32 border-b bg-background p-3 text-center align-bottom"
                  >
                    <Link
                      to={`?example=${example.id}`}
                      className="underline decoration-border underline-offset-4 hover:decoration-foreground"
                    >
                      {example.title}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            {coverageFamilies.map((family) => (
              <tbody key={family}>
                <tr>
                  <th
                    scope="rowgroup"
                    colSpan={examples.length + 1}
                    className="border-b bg-muted/70 px-3 py-2 text-left"
                  >
                    {family}
                  </th>
                </tr>
                {coverageFeatures
                  .filter((feature) => feature.family === family)
                  .map((feature) => (
                    <tr key={feature.id}>
                      <th
                        scope="row"
                        className="border-b p-3 text-left align-top font-medium"
                      >
                        {feature.label}
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
                              className="border-b p-3"
                            />
                          );
                        }
                        const display = usageLabels[status];
                        return (
                          <td
                            key={example.id}
                            className="border-b p-1 text-center"
                          >
                            <Link
                              to={`?example=${example.id}`}
                              aria-label={`${example.title}: ${feature.label} — ${display.label}`}
                              className={`block rounded px-2 py-3 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${display.className}`}
                            >
                              <span aria-hidden="true" className="font-bold">
                                {display.symbol}
                              </span>{" "}
                              {display.label}
                            </Link>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </details>
  );
}

export function CoverageMatrix() {
  const [searchParams] = useSearchParams();
  const coverageView = searchParams.get("coverage") ?? "attention";
  const showExamples = coverageView === "examples";
  const showAll = coverageView === "all";

  return (
    <main className="mx-auto max-w-[1600px]">
      <Button asChild variant="ghost" className="mb-4">
        <Link to="?">
          <ArrowLeft aria-hidden="true" />
          Return to examples
        </Link>
      </Button>
      <h1 className="text-3xl font-bold">Feature coverage</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Track what is implemented, what has evidence, and which component and
        example checks remain.
      </p>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Implemented means product support. Evidence means a declared example.
        Feature reviewed and Example checked are separate review records.
      </p>
      <nav aria-label="Coverage views" className="mt-6 flex flex-wrap gap-2">
        <Button
          asChild
          variant={!showExamples && !showAll ? "default" : "outline"}
        >
          <Link to="?view=coverage">Needs attention</Link>
        </Button>
        <Button asChild variant={showAll ? "default" : "outline"}>
          <Link to="?view=coverage&coverage=all">All features</Link>
        </Button>
        <Button asChild variant={showExamples ? "default" : "outline"}>
          <Link to="?view=coverage&coverage=examples">Example usage</Link>
        </Button>
      </nav>

      {showExamples ? (
        <PositiveExampleUsage />
      ) : (
        <AttentionQueue showAll={showAll} />
      )}
    </main>
  );
}
