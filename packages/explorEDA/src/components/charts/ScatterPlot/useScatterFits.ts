import { useMemo, useRef } from "react";
import type { ScatterPlotSettings } from "./definition";
import {
  METHOD_NAMES,
  fitInputKey,
  fitSummary,
  planFitMarks,
  planScatterFits,
  type ScatterFitPlan,
} from "./fitPlan";
import type { FitTrace } from "./FitTraceBody";
import { planPairedSummary, type PairedSummaryPlan } from "./pairedSummary";
import type { ScatterPlan, ScatterSnapshot } from "./scatterPlan";
import type { TraceTarget } from "../trace/traceTypes";

/**
 * Fits for one chart panel. Results are cached on their inputs, so brushing
 * this chart redraws the dimmed points without refitting.
 */
export function useScatterFits(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  plan: ScatterPlan
) {
  const cache = useRef<{
    key: string;
    plan?: ScatterFitPlan;
    summary?: PairedSummaryPlan;
  }>(undefined);
  const key =
    settings.regression || settings.summary
      ? fitInputKey(settings, snapshot, plan)
      : "";
  if (cache.current?.key !== key)
    cache.current = {
      key,
      plan: planScatterFits(settings, snapshot, plan),
      summary: planPairedSummary(settings, snapshot, plan),
    };
  const fitPlan = cache.current.plan;
  const summary = cache.current.summary;
  const marks = useMemo(() => planFitMarks(fitPlan, plan), [fitPlan, plan]);
  return useMemo(() => {
    const trace = (kind: string, id: string): FitTrace | undefined => {
      if (kind === "paired-summary")
        return summary
          ? {
              kind,
              id,
              revision: plan.revision,
              summary,
              xLabel: plan.xDisplay,
              yLabel: plan.yDisplay,
            }
          : undefined;
      if (!fitPlan || (kind !== "fit" && kind !== "fit-results")) return;
      const fit = fitPlan.fits.find((item) => item.id === id);
      if (kind === "fit" && !fit) return;
      return {
        kind,
        id,
        revision: plan.revision,
        plan: fitPlan,
        fit,
        xLabel: plan.xDisplay,
        yLabel: plan.yDisplay,
      };
    };
    const targets = (): TraceTarget[] => [
      ...(summary
        ? [
            {
              kind: "paired-summary",
              id: "paired-summary",
              label: "Paired summary",
            },
          ]
        : []),
      ...(fitPlan
        ? [
            {
              kind: "fit-results",
              id: "fit-results",
              label: `${METHOD_NAMES[fitPlan.method]} fit results`,
            },
            ...fitPlan.fits.map((fit) => ({
              kind: "fit",
              id: fit.id,
              label: `Fit · ${fit.label}: ${fitSummary(fit)}`,
            })),
          ]
        : []),
    ];
    return { plan: fitPlan, summary, marks, resolve: trace, targets };
  }, [fitPlan, summary, marks, plan.revision, plan.xDisplay, plan.yDisplay]);
}
