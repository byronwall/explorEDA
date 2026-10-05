import { TriangleAlert } from "lucide-react";
import { TraceReadout, TraceSection, TraceSwatch } from "../ChartTraceDetails";
import { useChartTrace, useChartTraceApi } from "../trace/ChartTraceScope";
import { PairedSummaryBody } from "./PairedSummaryBody";
import type { PairedSummaryPlan } from "./pairedSummary";
import {
  METHOD_NAMES,
  fitSummary,
  type ScatterFit,
  type ScatterFitPlan,
} from "./fitPlan";
import {
  LOESS_EXACT_ROWS,
  LOESS_VERTICES,
  fitEquation,
  formatR2,
  type RegressionFit,
} from "./regression";

export type FitTrace =
  | {
      kind: "fit" | "fit-results";
      id: string;
      revision: string;
      plan: ScatterFitPlan;
      fit?: ScatterFit;
      xLabel: string;
      yLabel: string;
    }
  | {
      kind: "paired-summary";
      id: string;
      revision: string;
      summary: PairedSummaryPlan;
      xLabel: string;
      yLabel: string;
    };

/** Enough digits to reproduce a coefficient, without float noise. */
const precise = (value: number | undefined) =>
  value === undefined ? "undefined" : String(Number(value.toPrecision(6)));

const METHOD_HELP: Record<ScatterFitPlan["method"], string> = {
  linear:
    "Ordinary least squares: the straight line that minimizes the squared vertical distances to the points. Slope is the change in Y for one unit of X. Offset is the fitted Y at X = 0, which may lie outside the data. R² is the share of Y variance the line explains; it does not show that the relationship is linear or causal.",
  polynomial:
    "Least squares on powers of X up to the chosen degree. Coefficients are listed from the constant term up. Adding terms always raises R², so compare adjusted R², which charges for each term. The curve is drawn only across the observed X range; outside it a polynomial can turn sharply.",
  loess:
    "Locally weighted regression: each point on the curve comes from a straight line fitted to the nearest rows, weighted by distance with a tricube kernel. Span is the share of rows in each local fit; a larger span gives a smoother curve. LOESS has no single equation or slope. Pseudo R² is 1 − residual sum of squares / total sum of squares.",
};

const POWER_NAMES = ["Constant", "x", "x²", "x³", "x⁴", "x⁵", "x⁶"];

function Coefficients({ fit }: { fit: RegressionFit }) {
  if (fit.method === "loess")
    return (
      <>
        <TraceReadout label="Span">
          {fit.span} · {fit.neighbors.toLocaleString()} rows per local fit
        </TraceReadout>
        <TraceReadout label="Pseudo R²">{formatR2(fit.r2)}</TraceReadout>
        <TraceReadout label="Residual RMS">{precise(fit.rmse)}</TraceReadout>
        {fit.interpolated && (
          <p className="text-muted-foreground">
            With more than {LOESS_EXACT_ROWS} rows, local fits run exactly at{" "}
            {LOESS_VERTICES + 1} evenly spaced X values and the curve and
            residuals interpolate between them.
          </p>
        )}
      </>
    );
  if (fit.method === "polynomial")
    return (
      <>
        <TraceReadout label="Degree">{fit.degree}</TraceReadout>
        {fit.coefficients.map((value, power) => (
          <TraceReadout key={power} label={POWER_NAMES[power]!}>
            {precise(value)}
          </TraceReadout>
        ))}
        <TraceReadout label="R²">{formatR2(fit.r2)}</TraceReadout>
        <TraceReadout label="Adjusted R²">
          {fit.adjustedR2 === undefined ? "undefined" : precise(fit.adjustedR2)}
        </TraceReadout>
        <TraceReadout label="Residual SE">
          {precise(fit.residualSe)}
        </TraceReadout>
      </>
    );
  return (
    <>
      <TraceReadout label="Slope">
        {precise(fit.slope)}
        {fit.slopeSe !== undefined && ` ± ${precise(fit.slopeSe)} SE`}
      </TraceReadout>
      <TraceReadout label="Offset">{precise(fit.intercept)}</TraceReadout>
      <TraceReadout label="R²">{formatR2(fit.r2)}</TraceReadout>
      {fit.r !== undefined && (
        <TraceReadout label="Pearson r">{precise(fit.r)}</TraceReadout>
      )}
      <TraceReadout label="Residual SE">{precise(fit.residualSe)}</TraceReadout>
    </>
  );
}

type FitResultTrace = Exclude<FitTrace, { kind: "paired-summary" }>;

function FitDetails({
  trace,
  fit,
}: {
  trace: FitResultTrace;
  fit: ScatterFit;
}) {
  const { plan } = trace;
  const outcome = fit.outcome;
  const used = outcome.ok ? outcome.n : fit.sourceIds.length;
  const scope = [
    fit.kind === "overall" ? "all groups" : `${fit.label}`,
    plan.facet?.label,
  ]
    .filter(Boolean)
    .join(" in ");
  return (
    <div className="space-y-3 text-xs" aria-label="Fit trace">
      <div className="eda-trace-subject">
        <span className="flex items-center gap-1.5 font-semibold">
          <TraceSwatch color={fit.color} />
          {fit.label}
        </span>
        <span className="text-muted-foreground">
          {METHOD_NAMES[plan.method]} fit
        </span>
      </div>
      {outcome.ok ? (
        <TraceSection
          heading={outcome.method === "loess" ? "Local fit" : "Equation"}
        >
          {outcome.method === "loess" ? (
            <p className="text-muted-foreground">
              No single equation: each X gets its own weighted local line.
              {` y is ${trace.yLabel}; x is ${trace.xLabel}.`}
            </p>
          ) : (
            <>
              <p className="font-mono text-sm">{fitEquation(outcome)}</p>
              <p className="text-muted-foreground">
                y is {trace.yLabel}; x is {trace.xLabel}.
              </p>
            </>
          )}
          <Coefficients fit={outcome} />
        </TraceSection>
      ) : (
        <TraceSection heading="Fit unavailable">
          <p className="flex gap-1.5">
            <TriangleAlert
              className="mt-0.5 size-3.5 shrink-0 text-warning"
              aria-hidden="true"
            />
            {outcome.reason}
          </p>
        </TraceSection>
      )}
      <TraceSection heading="Rows in the fit">
        <TraceReadout label="Used">
          {used.toLocaleString()} of {fit.eligible.toLocaleString()}
        </TraceReadout>
        {fit.missingX > 0 && (
          <TraceReadout label={`No numeric ${trace.xLabel}`}>
            {fit.missingX.toLocaleString()}
          </TraceReadout>
        )}
        {fit.missingY > 0 && (
          <TraceReadout label={`No numeric ${trace.yLabel}`}>
            {fit.missingY.toLocaleString()}
          </TraceReadout>
        )}
        <p className="text-muted-foreground">
          Rows from {scope || "this chart"} that pass the other charts' filters.
          Selecting points on this chart dims them but does not refit.
        </p>
      </TraceSection>
      <TraceSection heading="Method" muted>
        <p>{METHOD_HELP[plan.method]}</p>
      </TraceSection>
    </div>
  );
}

function FitResults({ trace }: { trace: FitResultTrace }) {
  const state = useChartTrace();
  const api = useChartTraceApi();
  const { plan } = trace;
  return (
    <div className="space-y-3 text-xs" aria-label="Fit results">
      <TraceSection
        heading={`${METHOD_NAMES[plan.method]} fits${plan.facet ? ` · ${plan.facet.label}` : ""}`}
      >
        {plan.notice && <p>{plan.notice}</p>}
        {plan.groupNote && (
          <p className="text-muted-foreground">{plan.groupNote}</p>
        )}
        <ul className="space-y-1">
          {plan.fits.map((fit) => (
            <li key={fit.id}>
              <button
                type="button"
                className="flex w-full items-start gap-1.5 rounded px-1 py-0.5 text-left hover:bg-muted"
                onClick={() =>
                  state?.selection &&
                  api?.inspect(state.selection.owner, "fit", fit.id)
                }
              >
                <TraceSwatch color={fit.color} />
                <span className="min-w-0">
                  <span className="font-medium">{fit.label}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · n {fit.outcome.n.toLocaleString()}
                  </span>
                  <span className="block font-mono">
                    {fit.outcome.ok ? fitSummary(fit) : fit.outcome.reason}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </TraceSection>
    </div>
  );
}

export function FitTraceBody({ trace }: { trace: FitTrace }) {
  if (trace.kind === "paired-summary")
    return <PairedSummaryBody trace={trace} />;
  return trace.kind === "fit" && trace.fit ? (
    <FitDetails key={trace.id} trace={trace} fit={trace.fit} />
  ) : (
    <FitResults trace={trace} />
  );
}
