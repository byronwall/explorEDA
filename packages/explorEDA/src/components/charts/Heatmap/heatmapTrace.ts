import type { TraceTarget } from "../trace/traceTypes";
import type { HeatmapCell, HeatmapPlan } from "./heatmapPlan";

export interface HeatmapTrace {
  kind: "cell";
  id: string;
  revision: string;
  cell: HeatmapCell;
  rowFieldLabel: string;
  columnFieldLabel: string;
  metricLabel: string;
  scale: HeatmapPlan["scale"];
  omitted: HeatmapPlan["omitted"];
  scopeNote: string;
}

/** Explains one planned cell. Returns undefined when the plan no longer draws it. */
export function resolveHeatmapTrace(
  plan: HeatmapPlan,
  kind: string,
  id: string
): HeatmapTrace | undefined {
  if (kind !== "cell") {return undefined;}
  const cell = plan.cells.find((item) => item.id === id);
  return (
    cell && {
      kind: "cell",
      id,
      revision: plan.revision,
      cell,
      rowFieldLabel: plan.rowFieldLabel,
      columnFieldLabel: plan.columnFieldLabel,
      metricLabel: plan.metricLabel,
      scale: plan.scale,
      omitted: plan.omitted,
      scopeNote: plan.scopeNote,
    }
  );
}

export function heatmapTraceTargets(plan: HeatmapPlan): TraceTarget[] {
  return plan.cells
    .filter((cell) => cell.state !== "empty")
    .map((cell) => ({
      kind: "cell",
      id: cell.id,
      label: `Cell: ${cell.row.label} × ${cell.column.label}`,
    }));
}

export function findHeatmapTraceRow(plan: HeatmapPlan, id: number) {
  const cell = plan.cells.find((item) =>
    item.contributors.some((contributor) => contributor.sourceId === id)
  );
  return cell && { kind: "cell", id: cell.id };
}
