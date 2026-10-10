import { applyFilter } from "@/hooks/applyFilter";
import { categoryKey, categoryValue } from "@/lib/categories";
import { finiteNumber } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";
import type { TraceTarget } from "../trace/traceTypes";
import type {
  ParallelAxis,
  ParallelPlan,
  ParallelSnapshot,
} from "./parallelPlan";

export interface ParallelLineTrace {
  kind: "polyline";
  id: string;
  revision: string;
  sourceId: number;
  color: string;
  colorField?: string;
  colorValue?: datum;
  selected: boolean;
  hasSelection: boolean;
  vertices: {
    axis: ParallelAxis;
    raw: datum;
    /** Numeric value, or the category's position from the top. */
    position: string;
    y: number;
    /** Undefined when the axis has no selection. */
    passes?: boolean;
  }[];
  scopeNote: string;
}

export interface ParallelAxisTrace {
  kind: "pc-axis";
  id: string;
  revision: string;
  axis: ParallelAxis;
  plotHeight: number;
  liveCount: number;
  drawnCount: number;
}

export type ParallelTrace = ParallelLineTrace | ParallelAxisTrace;

export function resolveParallelTrace(
  plan: ParallelPlan,
  snapshot: ParallelSnapshot,
  colorField: string | undefined,
  kind: string,
  id: string
): ParallelTrace | undefined {
  if (kind === "pc-axis") {
    const axis = plan.axes.find((item) => item.id === id);
    return (
      axis && {
        kind,
        id,
        revision: plan.revision,
        axis,
        plotHeight: plan.plotHeight,
        liveCount: plan.liveCount,
        drawnCount: plan.lines.length,
      }
    );
  }
  if (kind !== "polyline") {
    return undefined;
  }
  const sourceId = Number(id.replace("row:", ""));
  const line = plan.lines.find((item) => item.id === sourceId);
  if (!line) {
    return undefined;
  }
  return {
    kind,
    id,
    revision: plan.revision,
    sourceId,
    color: line.color,
    colorField,
    colorValue: colorField ? snapshot.colorData?.[sourceId] : undefined,
    selected: line.selected,
    hasSelection: plan.hasSelection,
    vertices: plan.axes.map((axis, index) => {
      const raw = snapshot.columns[axis.field]?.[sourceId];
      const category =
        axis.kind === "categorical"
          ? axis.categories.findIndex(
              (item) => item.key === categoryKey(categoryValue(raw))
            )
          : -1;
      return {
        axis,
        raw,
        position:
          axis.kind === "numeric"
            ? String(finiteNumber(raw))
            : `band ${category + 1} of ${axis.categories.length}, jittered`,
        y: line.ys[index]!,
        passes: axis.brush ? applyFilter(raw, axis.brush.filter) : undefined,
      };
    }),
    scopeNote: plan.scopeNote,
  };
}

export function parallelTraceTargets(plan: ParallelPlan): TraceTarget[] {
  return plan.axes.map((axis) => ({
    kind: "pc-axis",
    id: axis.id,
    label: `Axis: ${axis.label}`,
  }));
}

export function findParallelTraceRow(plan: ParallelPlan, id: number) {
  return plan.lines.some((line) => line.id === id)
    ? { kind: "polyline", id: `row:${id}` }
    : undefined;
}
