import { applyFilter } from "@/hooks/applyFilter";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import type { TraceTarget } from "../trace/traceTypes";
import type {
  MatrixCell,
  MatrixField,
  MatrixPlan,
  MatrixSnapshot,
} from "./matrixPlan";

/** One source row, followed across every field of the matrix. */
export interface MatrixRowTrace {
  kind: "matrix-row";
  id: string;
  revision: string;
  sourceId: number;
  hasSelection: boolean;
  selected: boolean;
  color?: { field: string; value: datum; color: string };
  values: {
    field: MatrixField;
    raw: datum;
    /** Where the row sits on this field: a band, a value, or nowhere. */
    position: string;
    /** Undefined when the matrix does not filter this field. */
    passes?: boolean;
  }[];
  /** Point cells that draw this row, of all point cells. */
  drawnIn: number;
  pointCells: number;
}

/** One cell: what it draws and which rows it uses. */
export interface MatrixCellTrace {
  kind: "matrix-cell";
  id: string;
  revision: string;
  cell: MatrixCell;
  column: MatrixField;
  row: MatrixField;
  liveCount: number;
  /** Live rows missing the column field, then the row field. */
  missing: [number, number];
  groups?: { label: string; color: string; r?: number }[];
}

export type MatrixTrace = MatrixRowTrace | MatrixCellTrace;

const KIND_NAMES: Record<string, string> = {
  points: "points",
  correlation: "Pearson correlation",
  box: "box plots by category",
  tiles: "count tiles",
  shares: "share bars",
  density: "density",
  histogram: "histogram",
  bars: "category counts",
  label: "field name",
  blank: "blank",
};

export const cellKindName = (kind: string) => KIND_NAMES[kind] ?? kind;

function position(field: MatrixField, index: number) {
  if (index < 0 || field.offset[index] !== field.offset[index]) {
    return "no place on this axis";
  }
  if (field.bands && field.band) {
    return `band "${field.bands.labels[field.band[index]!]}", jittered`;
  }
  return `${field.value![index]}`;
}

export function resolveMatrixTrace(
  plan: MatrixPlan,
  snapshot: MatrixSnapshot,
  filters: Filter[],
  revision: string,
  kind: string,
  id: string
): MatrixTrace | undefined {
  if (kind === "matrix-cell") {
    const cell = plan.cells.find((item) => item.id === id);
    if (!cell) {
      return undefined;
    }
    const column = plan.fields[cell.column]!;
    const row = plan.fields[cell.row]!;
    const live = plan.liveIds.length;
    return {
      kind,
      id,
      revision,
      cell,
      column,
      row,
      liveCount: live,
      missing: [live - column.valid, live - row.valid],
      groups:
        plan.groups && cell.groupR
          ? plan.groups.labels.map((label, group) => ({
              label,
              color: plan.groups!.colors[group]!,
              r: cell.groupR![group],
            }))
          : undefined,
    };
  }
  if (kind !== "matrix-row") {
    return undefined;
  }
  const sourceId = Number(id.replace("row:", ""));
  const index = plan.liveIds.indexOf(sourceId);
  if (index < 0) {
    return undefined;
  }
  const pointCells = plan.cells.filter((cell) => cell.kind === "points");
  const drawnIn = pointCells.filter(
    (cell) =>
      plan.fields[cell.column]!.offset[index] ===
        plan.fields[cell.column]!.offset[index] &&
      plan.fields[cell.row]!.offset[index] ===
        plan.fields[cell.row]!.offset[index]
  ).length;
  const group = plan.groups?.index[index] ?? -1;
  return {
    kind,
    id,
    revision,
    sourceId,
    hasSelection: plan.hasSelection,
    selected: Boolean(plan.selected[index]),
    color:
      plan.groups && group >= 0
        ? {
            field: plan.groups.field,
            value: snapshot.columns[plan.groups.field]?.[sourceId],
            color: plan.groups.colors[group]!,
          }
        : undefined,
    values: plan.fields.map((field) => {
      const raw = snapshot.columns[field.field]?.[sourceId];
      const own = filters.filter((filter) => filter.field === field.field);
      return {
        field,
        raw,
        position: position(field, index),
        passes: own.length
          ? own.every((filter) => applyFilter(raw, filter))
          : undefined,
      };
    }),
    drawnIn,
    pointCells: pointCells.length,
  };
}

export function matrixTraceTargets(plan: MatrixPlan): TraceTarget[] {
  return plan.cells.map((cell) => ({
    kind: "matrix-cell",
    id: cell.id,
    label:
      cell.row === cell.column
        ? `${plan.fields[cell.column]!.label}: ${cellKindName(cell.kind)}`
        : `${plan.fields[cell.column]!.label} × ${plan.fields[cell.row]!.label}: ${cellKindName(cell.kind)}`,
  }));
}

export function findMatrixTraceRow(plan: MatrixPlan, id: number) {
  return plan.liveIds.includes(id)
    ? { kind: "matrix-row", id: `row:${id}` }
    : undefined;
}
