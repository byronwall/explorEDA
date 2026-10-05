import { TriangleAlert } from "lucide-react";
import { TraceReadout, TraceSection, TraceSwatch } from "../ChartTraceDetails";
import { useChartTrace, useChartTraceApi } from "../trace/ChartTraceScope";
import {
  METHOD_NAMES,
  fitSummary,
  type ScatterFit,
  type ScatterFitPlan,
} from "./fitPlan";
import { fitEquation, formatR2, type RegressionFit } from "./regression";

export interface FitTrace {
  kind: "fit" | "fit-results";
  id: string;
  revision: string;
  plan: ScatterFitPlan;
  fit?: ScatterFit;
  xLabel: string;
  yLabel: string;
}

/** Enough digits to reproduce a coefficient, without float noise. */
const precise = (value: number | undefined) =>
  value === undefined ? "undefined" : String(Number(value.toPrecision(6)));

const METHOD_HELP: Record<ScatterFitPlan["method"], string> = {
  linear:
    "Ordinary least squares: the straight line that minimizes the squared vertical distances to the points. Slope is the change in Y for one unit of X. Offset is the fitted Y at X = 0, which may lie outside the data. R² is the share of Y variance the line explains; it does not show that the relationship is linear or causal.",
};

function Coefficients({ fit }: { fit: RegressionFit }) {
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

function FitDetails({ trace, fit }: { trace: FitTrace; fit: ScatterFit }) {
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
        <TraceSection heading="Equation">
          <p className="font-mono text-sm">{fitEquation(outcome)}</p>
          <p className="text-muted-foreground">
            y is {trace.yLabel}; x is {trace.xLabel}.
          </p>
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

function FitResults({ trace }: { trace: FitTrace }) {
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
  return trace.kind === "fit" && trace.fit ? (
    <FitDetails key={trace.id} trace={trace} fit={trace.fit} />
  ) : (
    <FitResults trace={trace} />
  );
}
