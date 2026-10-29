import {
  guideTargets,
  resolveGuideTrace,
  type GuideTrace,
  type TraceTarget,
} from "../trace/traceTypes";
import { findBarForRow, type BarChartPlan, type BarMark } from "./barPlan";
import type { AggregateResultRow } from "@/lib/aggregates";
import type { SpecLimits } from "@/lib/specification";
import type { SpecRegion } from "@/types/FilterTypes";

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
  /** Context count and exclusions of an engineering histogram. */
  histogram?: { n: number; missing: number; invalid: number };
}

/** One specification status of an engineering histogram and its rows. */
export interface SpecStatusTrace {
  kind: "spec-status";
  id: SpecRegion;
  revision: string;
  fieldLabel: string;
  limits: SpecLimits;
  /** Finite measurements in scope, the share's denominator. */
  n: number;
  missing: number;
  invalid: number;
  /** The status's rows, as a contributor table reads them. */
  row: AggregateResultRow;
}

/** The rows in one status region, from the same plan the marks draw. */
function resolveSpecTrace(
  plan: BarChartPlan,
  region: SpecRegion
): SpecStatusTrace | undefined {
  const histogram = plan.histogram;
  const spec = histogram?.spec;
  if (!histogram || !spec) return undefined;
  const ids =
    region === "outside" ? [...spec.below, ...spec.above] : spec[region];
  const values = plan.bars.flatMap((bar) => bar.row.contributors);
  const input = new Map(values.map((item) => [item.sourceId, item.input]));
  return {
    kind: "spec-status",
    id: region,
    revision: plan.revision,
    fieldLabel: plan.fieldLabel,
    limits: spec.limits,
    n: histogram.n,
    missing: histogram.missing.length,
    invalid: histogram.invalid.length,
    row: {
      id: `spec:${region}`,
      groupValue: region,
      groupLabel: region,
      value: ids.length,
      rowCount: ids.length,
      contributors: ids.map((id) => ({
        sourceId: id,
        input: input.get(id),
        rawInput: input.get(id),
        included: true,
      })),
    },
  };
}

/** Explains one planned bar or guide. Returns undefined when the plan no longer draws it. */
export function resolveBarTrace(
  plan: BarChartPlan,
  kind: string,
  id: string
): BarTrace | GuideTrace | SpecStatusTrace | undefined {
  if (kind === "guide") return resolveGuideTrace(plan.axes, id, plan.revision);
  if (kind === "spec-status") return resolveSpecTrace(plan, id as SpecRegion);
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
    histogram: plan.histogram && {
      n: plan.histogram.n,
      missing: plan.histogram.missing.length,
      invalid: plan.histogram.invalid.length,
    },
  };
}

export function barTraceTargets(plan: BarChartPlan): TraceTarget[] {
  return [
    ...plan.bars.map((bar) => ({
      kind: "bar",
      id: bar.id,
      label: `Bar: ${bar.label}`,
    })),
    ...(plan.histogram?.spec
      ? (["below", "within", "above", "outside"] as const).map((region) => ({
          kind: "spec-status",
          id: region,
          label: `Spec: ${region}`,
        }))
      : []),
    ...guideTargets(plan.axes),
  ];
}

export function findBarTraceRow(plan: BarChartPlan, id: number) {
  const bar = findBarForRow(plan, id);
  return bar && { kind: "bar", id: bar.id };
}
