import type { TraceTarget } from "../trace/traceTypes";
import { idsThrough, shareAt, type EcdfCurve, type EcdfPlan } from "./ecdfPlan";

export interface EcdfTrace {
  kind: "ecdf-step";
  id: string;
  revision: string;
  curve: EcdfCurve;
  x: number;
  share: number;
  /** Rows counted in the share: at or below x, or at or above it. */
  throughIds: number[];
  /** Rows with exactly this value. */
  atIds: number[];
  direction: EcdfPlan["direction"];
  fieldLabel: string;
  groupLabel?: string;
  position: { x: number; y: number };
  excluded: EcdfPlan["excluded"];
  scopeNote: string;
}

export const ecdfStepId = (curve: EcdfCurve, x: number) => `${curve.key}@${x}`;

export function resolveEcdfTrace(
  plan: EcdfPlan,
  kind: string,
  id: string
): EcdfTrace | undefined {
  if (kind !== "ecdf-step") {
    return undefined;
  }
  const split = id.lastIndexOf("@");
  const curve = plan.curves.find((item) => item.key === id.slice(0, split));
  const x = Number(id.slice(split + 1));
  if (!curve || !Number.isFinite(x)) {
    return undefined;
  }
  const share = shareAt(curve, x, plan.direction);
  return {
    kind,
    id,
    revision: plan.revision,
    curve,
    x,
    share,
    throughIds: idsThrough(curve, x, plan.direction),
    atIds: curve.steps.find((step) => step.x === x)?.ids ?? [],
    direction: plan.direction,
    fieldLabel: plan.fieldLabel,
    groupLabel: plan.groupLabel,
    position: { x: plan.px(x), y: plan.py(share) },
    excluded: plan.excluded,
    scopeNote: plan.scopeNote,
  };
}

export function ecdfTraceTargets(plan: EcdfPlan): TraceTarget[] {
  return plan.curves.flatMap((curve) =>
    curve.quantiles.map((quantile) => ({
      kind: "ecdf-step",
      id: ecdfStepId(curve, quantile.x),
      label: `${curve.label}: ${Math.round(quantile.level * 100)}% mark`,
    }))
  );
}

export function findEcdfTraceRow(plan: EcdfPlan, id: number) {
  for (const curve of plan.curves) {
    if (curve.overall && plan.curves.length > 1) {
      continue;
    }
    const step = curve.steps.find((item) => item.ids.includes(id));
    if (step) {
      return { kind: "ecdf-step", id: ecdfStepId(curve, step.x) };
    }
  }
  return undefined;
}
