import {
  guideTargets,
  resolveGuideTrace,
  type GuideTrace,
  type TraceTarget,
} from "../trace/traceTypes";
import { findBarForRow, type BarChartPlan, type BarMark } from "./barPlan";

export interface BarTrace {
  kind: "bar";
  id: string;
  revision: string;
  mark: BarMark;
  mode: BarChartPlan["mode"];
  field: string;
  fieldLabel: string;
  valueLabel: string;
  aggregation: string;
  groupOrder: string[];
  domain: BarChartPlan["domain"];
  xScale: BarChartPlan["xScale"];
  yScale: BarChartPlan["yScale"];
  scopeNote: string;
}

/** Explains one planned bar or guide. Returns undefined when the plan no longer draws it. */
export function resolveBarTrace(
  plan: BarChartPlan,
  kind: string,
  id: string
): BarTrace | GuideTrace | undefined {
  if (kind === "guide") return resolveGuideTrace(plan.axes, id, plan.revision);
  if (kind !== "bar") return undefined;
  const mark = plan.bars.find((bar) => bar.id === id);
  if (!mark) return undefined;
  return {
    kind: "bar",
    id,
    revision: plan.revision,
    mark,
    mode: plan.mode,
    field: plan.field,
    fieldLabel: plan.fieldLabel,
    valueLabel: plan.valueLabel,
    aggregation: plan.aggregation,
    groupOrder: plan.groupOrder,
    domain: plan.domain,
    xScale: plan.xScale,
    yScale: plan.yScale,
    scopeNote: plan.scopeNote,
  };
}

export function barTraceTargets(plan: BarChartPlan): TraceTarget[] {
  return [
    ...plan.bars.map((bar) => ({
      kind: "bar",
      id: bar.id,
      label: `Bar: ${bar.label}`,
    })),
    ...guideTargets(plan.axes),
  ];
}

export function findBarTraceRow(plan: BarChartPlan, id: number) {
  const bar = findBarForRow(plan, id);
  return bar && { kind: "bar", id: bar.id };
}
