import { scaleLinear, scaleUtc } from "d3-scale";
import {
  detectColumnType,
  type DataType,
} from "@/components/SummaryTable/utils/dataTypeDetection";
import { applyFilter } from "@/hooks/applyFilter";
import { categoryLabel, categoryValue } from "@/lib/categories";
import { dateTimestamp } from "@/lib/dateTime";
import { finiteNumber, isMissingValue } from "@/lib/numeric";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { DEFAULT_AXIS_SETTINGS } from "@/utils/defaultSettings";
import {
  filterSpan,
  jitter,
  JITTER_SHARE,
  planScatterAxis,
  spanFilter,
  type ScatterAxisScale,
} from "../ScatterPlot/scatterAxis";
import {
  DEFAULT_DIAGONAL_CELLS,
  DEFAULT_LOWER_CELLS,
  DEFAULT_UPPER_CELLS,
  type ScatterMatrixSettings,
} from "./definition";

/** Numeric and date fields are continuous; everything else gets bands. */
export type MatrixFieldKind = "numeric" | "date" | "band";
export type MatrixPairType = "numeric" | "mixed" | "categorical";
export type MatrixCellKind =
  | "points"
  | "correlation"
  | "blank"
  | "histogram"
  | "bars"
  | "label";

export interface MatrixSnapshot {
  /** Every source row. Domains and bands use them, so they hold still. */
  allIds: number[];
  /** Rows after other charts' filters. */
  liveIds: number[];
  columns: Record<string, Record<number, datum>>;
  types: Record<string, DataType | undefined>;
}

export interface MatrixTick {
  /** Offset along the cell, from its left edge or its bottom edge. */
  offset: number;
  label: string;
}

export interface MatrixField {
  field: string;
  label: string;
  index: number;
  kind: MatrixFieldKind;
  /** Scale over cell offsets [inset, size - inset]. Dates use timestamps. */
  axis: ScatterAxisScale;
  /** Offset of each live row along this field, NaN when it has no place. */
  offset: Float32Array;
  /** Live rows with a value for this field. */
  valid: number;
  ticks: MatrixTick[];
}

export interface MatrixBar {
  id: string;
  label: string;
  /** Offsets along the cell's x direction. */
  start: number;
  end: number;
  total: number;
  selected: number;
  /** One-field filter a click on the bar sets. */
  filter: Filter;
}

export interface MatrixCell {
  id: string;
  row: number;
  column: number;
  /** Top-left corner in content coordinates. */
  x: number;
  y: number;
  kind: MatrixCellKind;
  pairType?: MatrixPairType;
  /** Rows with values for both fields, or for the one diagonal field. */
  n: number;
  /** Pearson r for two continuous fields; undefined when undefined. */
  r?: number;
  bars?: MatrixBar[];
  /** Largest bar total, for scaling. */
  maxBar?: number;
}

export interface MatrixPlan {
  fields: MatrixField[];
  cells: MatrixCell[];
  cellSize: number;
  gap: number;
  /** Content size; larger than the chart when cells hit their minimum. */
  contentWidth: number;
  contentHeight: number;
  /** Top-left of the first cell in content coordinates. */
  origin: { x: number; y: number };
  liveIds: number[];
  /** 1 when a live row passes every one of the matrix's own filters. */
  selected: Uint8Array;
  hasSelection: boolean;
  selectedCount: number;
  pointRadius: number;
  pointOpacity: number;
  dimmedOpacity: number;
}

export const MATRIX_GAP = 6;
export const MIN_CELL_SIZE = 72;
export const CELL_INSET = 5;
export const STRIP_SIZE = 20;
export const LEFT_TICKS = 44;
export const BOTTOM_TICKS = 22;
export const HISTOGRAM_BINS = 20;
export const MATRIX_POINT_COLOR = "#3479a8";
export const MATRIX_CONTEXT_COLOR = "rgb(156 163 175)";

export function matrixFieldKind(type: DataType | undefined): MatrixFieldKind {
  return type === "numeric" ? "numeric" : type === "datetime" ? "date" : "band";
}

export function pairType(
  a: MatrixFieldKind,
  b: MatrixFieldKind
): MatrixPairType {
  const bandA = a === "band";
  const bandB = b === "band";
  return bandA && bandB ? "categorical" : bandA || bandB ? "mixed" : "numeric";
}

function dateValue(value: datum): number | undefined {
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const time = dateTimestamp(value);
  return Number.isFinite(time) ? time : undefined;
}

/** The continuous value a row plots at: a number, a timestamp, or undefined. */
export function continuousValue(kind: MatrixFieldKind, value: datum) {
  return kind === "date" ? dateValue(value) : finiteNumber(value);
}

function timestamps(ids: number[], data: Record<number, datum>) {
  const out: Record<number, number | undefined> = {};
  for (const id of ids) out[id] = dateValue(data[id]);
  return out;
}

function planFieldAxis(
  kind: MatrixFieldKind,
  ids: number[],
  data: Record<number, datum>,
  size: number
): ScatterAxisScale {
  const range: [number, number] = [
    CELL_INSET,
    Math.max(CELL_INSET + 1, size - CELL_INSET),
  ];
  if (kind === "date") {
    const times = timestamps(ids, data);
    return planScatterAxis({
      ids,
      data: times,
      dataType: "numeric",
      axis: DEFAULT_AXIS_SETTINGS,
      range,
    });
  }
  return planScatterAxis({
    ids,
    data,
    dataType: kind === "numeric" ? "numeric" : "categorical",
    axis: DEFAULT_AXIS_SETTINGS,
    range,
  });
}

function planTicks(
  field: Omit<MatrixField, "ticks" | "offset" | "valid">,
  size: number
) {
  const axis = field.axis;
  const count = Math.max(2, Math.min(5, Math.floor(size / 40)));
  if (axis.kind === "band") {
    // Label every band that has room; skip the rest evenly.
    const step = Math.max(1, Math.ceil((axis.categories.length * 12) / size));
    return axis.categories
      .filter((_, index) => index % step === 0)
      .map((category) => ({
        offset: (axis.scale(category.label) ?? 0) + axis.scale.bandwidth() / 2,
        label: category.label,
      }));
  }
  if (field.kind === "date") {
    const time = scaleUtc().domain(axis.domain.map((value) => new Date(value)));
    const format = time.tickFormat(count);
    return time.ticks(count).map((tick) => ({
      offset: axis.scale(tick.getTime()),
      label: format(tick),
    }));
  }
  const linear = scaleLinear().domain(axis.domain);
  const format = linear.tickFormat(count, "~s");
  return linear
    .ticks(count)
    .filter((tick) => tick >= axis.domain[0] && tick <= axis.domain[1])
    .map((tick) => ({ offset: axis.scale(tick), label: format(tick) }));
}

/** Offsets for every live row along one field. Bands jitter by row and field. */
function planOffsets(
  field: Pick<MatrixField, "axis" | "kind" | "index">,
  ids: number[],
  data: Record<number, datum>
) {
  const offset = new Float32Array(ids.length);
  let valid = 0;
  const axis = field.axis;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!;
    const raw = data[id];
    let pixel = NaN;
    if (axis.kind === "band") {
      const start = axis.scale(categoryLabel(categoryValue(raw)));
      if (start !== undefined) {
        const width = axis.scale.bandwidth();
        pixel =
          start +
          width / 2 +
          jitter(id, field.index + 1) * width * JITTER_SHARE;
      }
    } else {
      const value = continuousValue(field.kind, raw);
      if (value !== undefined) pixel = axis.scale(value);
    }
    offset[i] = pixel;
    if (Number.isFinite(pixel)) valid++;
  }
  return { offset, valid };
}

/** Pearson correlation of two continuous fields over rows that have both. */
export function pearson(xs: ArrayLike<number>, ys: ArrayLike<number>) {
  const n = xs.length;
  if (n < 3) return undefined;
  let mx = 0;
  let my = 0;
  for (let i = 0; i < n; i++) {
    mx += xs[i]!;
    my += ys[i]!;
  }
  mx /= n;
  my /= n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx;
    const dy = ys[i]! - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return undefined;
  return sxy / Math.sqrt(sxx * syy);
}

function cellKind(
  settings: ScatterMatrixSettings,
  row: number,
  column: number,
  fields: MatrixField[]
): { kind: MatrixCellKind; pairType?: MatrixPairType } {
  if (row === column) {
    const diagonal = { ...DEFAULT_DIAGONAL_CELLS, ...settings.diagonal };
    return {
      kind:
        fields[row]!.kind === "band"
          ? diagonal.categorical
          : diagonal.continuous,
    };
  }
  const type = pairType(fields[row]!.kind, fields[column]!.kind);
  const triangle =
    row > column
      ? { ...DEFAULT_LOWER_CELLS, ...settings.lower }
      : { ...DEFAULT_UPPER_CELLS, ...settings.upper };
  return { kind: triangle[type], pairType: type };
}

/** Whether a row passes one of the matrix's own filters. */
function passes(filter: Filter, id: number, snapshot: MatrixSnapshot) {
  const value =
    filter.field === "__ID" ? id : snapshot.columns[filter.field]?.[id];
  return applyFilter(value, filter);
}

function planDiagonalBars(
  field: MatrixField,
  snapshot: MatrixSnapshot,
  selected: Uint8Array
): MatrixBar[] {
  const ids = snapshot.liveIds;
  const data = snapshot.columns[field.field] ?? {};
  const axis = field.axis;
  if (axis.kind === "band") {
    const bars = axis.categories.map((category) => {
      const start = axis.scale(category.label) ?? 0;
      return {
        id: `${field.field}:bar:${category.label}`,
        label: category.label,
        start,
        end: start + axis.scale.bandwidth(),
        total: 0,
        selected: 0,
        filter: {
          type: "value",
          field: field.field,
          values: [category.value],
        } as Filter,
      };
    });
    const byLabel = new Map(bars.map((bar) => [bar.label, bar]));
    for (let i = 0; i < ids.length; i++) {
      const bar = byLabel.get(categoryLabel(categoryValue(data[ids[i]!])));
      if (!bar) continue;
      bar.total++;
      if (selected[i]) bar.selected++;
    }
    return bars;
  }
  // Equal-width bins over the data bounds from every source row.
  const [low, high] = axis.bounds;
  const span = high > low ? high - low : 1;
  const width = span / HISTOGRAM_BINS;
  const bars: MatrixBar[] = Array.from(
    { length: HISTOGRAM_BINS },
    (_, index) => {
      const min = low + index * width;
      const max = index === HISTOGRAM_BINS - 1 ? low + span : min + width;
      return {
        id: `${field.field}:bin:${index}`,
        label: `${min}–${max}`,
        start: axis.scale(min),
        end: axis.scale(max),
        total: 0,
        selected: 0,
        filter: rangeFilter(field, min, max),
      };
    }
  );
  for (let i = 0; i < ids.length; i++) {
    const value = continuousValue(field.kind, data[ids[i]!]);
    if (value === undefined) continue;
    const index = Math.min(
      HISTOGRAM_BINS - 1,
      Math.max(0, Math.floor((value - low) / width))
    );
    bars[index]!.total++;
    if (selected[i]) bars[index]!.selected++;
  }
  return bars;
}

/** A continuous filter between two values: a number range or a date range. */
export function rangeFilter(
  field: MatrixField,
  min: number,
  max: number
): Filter {
  if (field.kind === "date") {
    return {
      type: "date-range",
      field: field.field,
      min: new Date(min).toISOString(),
      max: new Date(max).toISOString(),
    };
  }
  return { type: "range", field: field.field, min, max };
}

/** Turns a span of offsets along a field into its filter. */
export function offsetFilter(
  field: MatrixField,
  [a, b]: [number, number]
): Filter {
  const axis = field.axis;
  if (axis.kind === "numeric") {
    const x = axis.scale.invert(Math.min(a, b));
    const y = axis.scale.invert(Math.max(a, b));
    return rangeFilter(field, Math.min(x, y), Math.max(x, y));
  }
  return spanFilter(axis, field.field, [a, b]);
}

/** The span of offsets a field's filter covers, if it has one. */
export function filterOffsets(
  field: MatrixField,
  filters: Filter[]
): [number, number] | undefined {
  const axis = field.axis;
  if (field.kind === "date" && axis.kind === "numeric") {
    const filter = filters.find(
      (item) => item.field === field.field && item.type === "date-range"
    );
    if (filter?.type !== "date-range" || !filter.min || !filter.max)
      return undefined;
    const a = axis.scale(dateTimestamp(filter.min));
    const b = axis.scale(dateTimestamp(filter.max));
    return [Math.min(a, b), Math.max(a, b)];
  }
  return filterSpan(axis, filters, field.field);
}

/** Replaces the matrix's selection: a brush always starts a new one. */
export function replaceSelection(
  settings: ScatterMatrixSettings,
  next: Filter[]
): Filter[] {
  const fields = new Set([...settings.fields, "__ID"]);
  return [
    ...settings.filters.filter((filter) => !fields.has(filter.field)),
    ...next,
  ];
}

export function planScatterMatrix({
  settings,
  snapshot,
  width,
  height,
  getFieldLabel = (field) => field,
}: {
  settings: ScatterMatrixSettings;
  snapshot: MatrixSnapshot;
  width: number;
  height: number;
  getFieldLabel?: (field: string) => string;
}): MatrixPlan {
  const names = settings.fields.filter(Boolean);
  const k = Math.max(1, names.length);
  const margin = settings.margin;
  const origin = {
    x: margin.left + LEFT_TICKS,
    y: margin.top + STRIP_SIZE,
  };
  const availableWidth =
    width - origin.x - STRIP_SIZE - margin.right - MATRIX_GAP * (k - 1);
  const availableHeight =
    height - origin.y - BOTTOM_TICKS - margin.bottom - MATRIX_GAP * (k - 1);
  const cellSize = Math.max(
    MIN_CELL_SIZE,
    Math.floor(Math.min(availableWidth, availableHeight) / k)
  );
  const span = k * cellSize + (k - 1) * MATRIX_GAP;

  const fields: MatrixField[] = names.map((name, index) => {
    const data = snapshot.columns[name] ?? {};
    const hasValues = snapshot.allIds.some((id) => !isMissingValue(data[id]));
    const type =
      snapshot.types[name] ??
      (hasValues
        ? detectColumnType(snapshot.allIds.map((id) => data[id]))
        : "numeric");
    const kind = matrixFieldKind(type);
    const axis = planFieldAxis(kind, snapshot.allIds, data, cellSize);
    const base = { field: name, label: getFieldLabel(name), index, kind, axis };
    const { offset, valid } = planOffsets(base, snapshot.liveIds, data);
    return { ...base, offset, valid, ticks: planTicks(base, cellSize) };
  });

  const liveIds = snapshot.liveIds;
  const selected = new Uint8Array(liveIds.length);
  const own = settings.filters;
  let selectedCount = 0;
  for (let i = 0; i < liveIds.length; i++) {
    const pass = own.every((filter) => passes(filter, liveIds[i]!, snapshot));
    selected[i] = pass ? 1 : 0;
    if (pass) selectedCount++;
  }

  const cells: MatrixCell[] = [];
  for (let row = 0; row < fields.length; row++) {
    for (let column = 0; column < fields.length; column++) {
      const { kind, pairType } = cellKind(settings, row, column, fields);
      const cell: MatrixCell = {
        id: `${row}:${column}`,
        row,
        column,
        x: origin.x + column * (cellSize + MATRIX_GAP),
        y: origin.y + row * (cellSize + MATRIX_GAP),
        kind,
        pairType,
        n: 0,
      };
      const a = fields[column]!;
      const b = fields[row]!;
      if (row === column) {
        cell.n = a.valid;
        if (kind === "histogram" || kind === "bars") {
          cell.bars = planDiagonalBars(a, snapshot, selected);
          cell.maxBar = Math.max(1, ...cell.bars.map((bar) => bar.total));
        }
      } else {
        const xs: number[] = [];
        const ys: number[] = [];
        const continuous = a.kind !== "band" && b.kind !== "band";
        const dataA = snapshot.columns[a.field] ?? {};
        const dataB = snapshot.columns[b.field] ?? {};
        for (let i = 0; i < liveIds.length; i++) {
          if (!Number.isFinite(a.offset[i]!) || !Number.isFinite(b.offset[i]!))
            continue;
          cell.n++;
          if (kind === "correlation" && continuous) {
            xs.push(continuousValue(a.kind, dataA[liveIds[i]!])!);
            ys.push(continuousValue(b.kind, dataB[liveIds[i]!])!);
          }
        }
        if (kind === "correlation") cell.r = pearson(xs, ys);
      }
      cells.push(cell);
    }
  }

  // Dense clouds get smaller, lighter points, as in the scatter plot.
  const density = liveIds.length > 5000 ? 2 : liveIds.length > 1000 ? 1 : 0;
  const small = cellSize < 110 ? 0.5 : 0;
  return {
    fields,
    cells,
    cellSize,
    gap: MATRIX_GAP,
    contentWidth: Math.max(width, origin.x + span + STRIP_SIZE + margin.right),
    contentHeight: Math.max(
      height,
      origin.y + span + BOTTOM_TICKS + margin.bottom
    ),
    origin,
    liveIds,
    selected,
    hasSelection: own.length > 0,
    selectedCount,
    pointRadius: settings.pointSize ?? [2.5, 2, 1.5][density]! - small,
    pointOpacity: settings.pointOpacity ?? [0.7, 0.5, 0.35][density]!,
    dimmedOpacity: 0.15,
  };
}

/** Pixel position of a row in a cell: x from the column field, y from the row field. */
export function cellPoint(plan: MatrixPlan, cell: MatrixCell, index: number) {
  const x = plan.fields[cell.column]!.offset[index]!;
  const y = plan.cellSize - plan.fields[cell.row]!.offset[index]!;
  return { x, y };
}

/** The nearest live row to a point in a cell, within a few pixels. */
export function nearestRow(
  plan: MatrixPlan,
  cell: MatrixCell,
  x: number,
  y: number,
  reach = 6
) {
  let best = -1;
  let bestDistance = reach * reach;
  const xs = plan.fields[cell.column]!.offset;
  const ys = plan.fields[cell.row]!.offset;
  for (let i = 0; i < plan.liveIds.length; i++) {
    const dx = xs[i]! - x;
    const dy = plan.cellSize - ys[i]! - y;
    const distance = dx * dx + dy * dy;
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  }
  return best < 0 ? undefined : best;
}

/** Filters for a brush in an off-diagonal cell, given cell-local corners. */
export function brushFilters(
  plan: MatrixPlan,
  cell: MatrixCell,
  [x0, y0]: [number, number],
  [x1, y1]: [number, number]
): Filter[] {
  const xField = plan.fields[cell.column]!;
  const yField = plan.fields[cell.row]!;
  return [
    offsetFilter(xField, [x0, x1]),
    // Y offsets count up from the cell's bottom edge.
    offsetFilter(yField, [plan.cellSize - y0, plan.cellSize - y1]),
  ];
}
