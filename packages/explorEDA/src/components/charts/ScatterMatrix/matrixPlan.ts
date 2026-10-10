import { scaleLinear, scaleUtc } from "d3-scale";
import {
  detectColumnType,
  type DataType,
} from "@/components/SummaryTable/utils/dataTypeDetection";
import { applyFilter } from "@/hooks/applyFilter";
import {
  dateBound,
  finiteNumber,
  isMissingValue,
  timestampOf,
} from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import { makeColorScale } from "@/lib/colorScaleMath";
import { DEFAULT_AXIS_SETTINGS } from "@/utils/defaultSettings";
import {
  jitter,
  JITTER_SHARE,
  planScatterAxis,
  type ScatterAxisScale,
} from "../ScatterPlot/scatterAxis";
import {
  bandAt,
  bandAxis,
  bandFilter,
  bandFilterSpan,
  bandOf,
  bandSpanFilter,
  planBands,
  type BandAxis,
  type MatrixBands,
} from "./matrixBands";
import {
  planBoxGroups,
  planDensity,
  selectedDensities,
  type MatrixDensity,
  planPairs,
  selectedBoxStats,
  selectedPairs,
  type MatrixBoxGroup,
  type MatrixBoxStats,
  type MatrixPairs,
} from "./matrixCells";
import {
  DEFAULT_DIAGONAL_CELLS,
  DEFAULT_LOWER_CELLS,
  DEFAULT_UPPER_CELLS,
  MAX_MATRIX_CATEGORIES,
  type ScatterMatrixSettings,
} from "./definition";

/** Numeric and date fields are continuous; everything else gets bands. */
export type MatrixFieldKind = "numeric" | "date" | "band";
export type MatrixPairType = "numeric" | "mixed" | "categorical";
export type MatrixCellKind =
  | "points"
  | "correlation"
  | "box"
  | "tiles"
  | "shares"
  | "blank"
  | "histogram"
  | "density"
  | "bars"
  | "label";

export interface MatrixSnapshot {
  /** Every source row. Domains and bands use them, so they hold still. */
  allIds: number[];
  /** Rows after other filters. */
  liveIds: number[];
  columns: Record<string, Record<number, datum>>;
  types: Record<string, DataType | undefined>;
  /** The scale that colors rows by `colorField`, when the matrix has one. */
  colorScale?: ColorScaleType;
}

/** Rows grouped by the color field's categories. */
export interface MatrixGroups {
  field: string;
  labels: string[];
  colors: string[];
  /** Each live row's group, or -1. */
  index: Int32Array;
  /** Live row indices in each group, so drawing walks each row once. */
  rows: Int32Array[];
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
  /** Category fields: their bands and each live row's band, or -1. */
  bands?: MatrixBands;
  band?: Int32Array;
  /** Continuous fields: each live row's number or timestamp, NaN when missing. */
  value?: Float64Array;
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
  /** Selected rows in each color group. */
  groups?: number[];
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
  /** The bar each live row counts toward, or -1. Diagonal cells only. */
  barIndex?: Int32Array;
  /** Box plot cells: one group per category of the band field. */
  boxes?: {
    /** True when the categories run down the row field. */
    horizontal: boolean;
    groups: MatrixBoxGroup[];
    /** Statistics of the selected rows in each group. */
    selected?: (MatrixBoxStats | undefined)[];
  };
  /** Density diagonals: the curve of every row, then of the selection. */
  density?: MatrixDensity & {
    selected?: Float64Array;
    groups?: Float64Array[];
  };
  /** Correlation cells with a color field: r within each group. */
  groupR?: (number | undefined)[];
  /** Tile and share cells: counts for each pair of bands. */
  pairs?: MatrixPairs;
  pairSelected?: Int32Array;
}

/** Everything that holds still while the matrix's own selection changes. */
export interface MatrixLayout {
  fields: MatrixField[];
  groups?: MatrixGroups;
  cells: MatrixCell[];
  cellSize: number;
  gap: number;
  /** Content size; larger than the chart when cells hit their minimum. */
  contentWidth: number;
  contentHeight: number;
  /** Top-left of the first cell in content coordinates. */
  origin: { x: number; y: number };
  liveIds: number[];
  pointRadius: number;
  pointOpacity: number;
  dimmedOpacity: number;
}

/** The rows passing the matrix's own filters. */
export interface MatrixSelection {
  /** 1 when a live row passes every one of the matrix's own filters. */
  selected: Uint8Array;
  hasSelection: boolean;
  selectedCount: number;
}

export type MatrixPlan = MatrixLayout & MatrixSelection;

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

/** The continuous value a row plots at: a number, a timestamp, or undefined. */
export function continuousValue(kind: MatrixFieldKind, value: datum) {
  return kind === "date" ? timestampOf(value) : finiteNumber(value);
}

function timestamps(ids: number[], data: Record<number, datum>) {
  const out: Record<number, number | undefined> = {};
  for (const id of ids) {
    out[id] = timestampOf(data[id]);
  }
  return out;
}

function planFieldAxis(
  kind: MatrixFieldKind,
  ids: number[],
  data: Record<number, datum>,
  size: number
): { axis: ScatterAxisScale; bands?: MatrixBands } {
  const range: [number, number] = [
    CELL_INSET,
    Math.max(CELL_INSET + 1, size - CELL_INSET),
  ];
  if (kind === "band") {
    const bands = planBands(ids, data, MAX_MATRIX_CATEGORIES);
    return { axis: bandAxis(bands, range), bands };
  }
  if (kind === "date") {
    const times = timestamps(ids, data);
    return {
      axis: planScatterAxis({
        ids,
        data: times,
        dataType: "numeric",
        axis: DEFAULT_AXIS_SETTINGS,
        range,
      }),
    };
  }
  return {
    axis: planScatterAxis({
      ids,
      data,
      dataType: "numeric",
      axis: DEFAULT_AXIS_SETTINGS,
      range,
    }),
  };
}

function planTicks(field: Pick<MatrixField, "axis" | "kind">, size: number) {
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
  // SI prefixes only for large magnitudes, so years read plainly in roomy cells.
  const largest = Math.max(...axis.domain.map(Math.abs));
  // Small cells have room for short labels only, such as 4k.
  const short = largest >= 1e5 || (largest >= 1000 && size < 110);
  const format = linear.tickFormat(count, short ? "~s" : undefined);
  return linear
    .ticks(count)
    .filter((tick) => tick >= axis.domain[0] && tick <= axis.domain[1])
    .map((tick) => ({ offset: axis.scale(tick), label: format(tick) }));
}

/**
 * Offsets for every live row along one field, with each row's band or value.
 * Bands jitter by row and field across `jitterShare` of their width.
 */
function planOffsets(
  field: Pick<MatrixField, "axis" | "kind" | "index" | "bands">,
  ids: number[],
  data: Record<number, datum>,
  jitterShare: number
) {
  const offset = new Float32Array(ids.length);
  let valid = 0;
  const axis = field.axis;
  if (axis.kind === "band" && field.bands) {
    const band = new Int32Array(ids.length);
    const width = axis.scale.bandwidth();
    const starts = field.bands.labels.map((label) => axis.scale(label) ?? 0);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]!;
      const index = bandOf(field.bands, data[id]);
      band[i] = index;
      offset[i] =
        index < 0
          ? NaN
          : starts[index]! +
            width / 2 +
            jitter(id, field.index + 1) * width * jitterShare;
      if (index >= 0) {
        valid++;
      }
    }
    return { offset, valid, band };
  }
  const value = new Float64Array(ids.length);
  for (let i = 0; i < ids.length; i++) {
    const number = continuousValue(field.kind, data[ids[i]!]);
    value[i] = number ?? NaN;
    offset[i] =
      number === undefined || axis.kind !== "numeric"
        ? NaN
        : axis.scale(number);
    if (offset[i] === offset[i]) {
      valid++;
    }
  }
  return { offset, valid, value };
}

/** Pearson correlation of two continuous fields over rows that have both. */
export function pearson(xs: ArrayLike<number>, ys: ArrayLike<number>) {
  const n = xs.length;
  if (n < 3) {
    return undefined;
  }
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
  if (sxx === 0 || syy === 0) {
    return undefined;
  }
  return sxy / Math.sqrt(sxx * syy);
}

/** Rows in the color field's Other group and missing values read gray. */
const NEUTRAL_GROUP_COLOR = "#8a94a3";

function planGroups(
  settings: ScatterMatrixSettings,
  snapshot: MatrixSnapshot
): MatrixGroups | undefined {
  const field = settings.colorField;
  const data = field ? snapshot.columns[field] : undefined;
  if (!field || !data || !snapshot.colorScale) {
    return undefined;
  }
  const bands = planBands(snapshot.allIds, data, MAX_MATRIX_CATEGORIES);
  const color = makeColorScale(snapshot.colorScale);
  const colors = bands.labels.map((_, band) => {
    if (band === bands.other) {
      return NEUTRAL_GROUP_COLOR;
    }
    try {
      return color(bands.values[band]![0]);
    } catch {
      return NEUTRAL_GROUP_COLOR;
    }
  });
  const index = Int32Array.from(snapshot.liveIds, (id) =>
    bandOf(bands, data[id])
  );
  const members: number[][] = bands.labels.map(() => []);
  index.forEach((group, row) => {
    if (group >= 0) {
      members[group]!.push(row);
    }
  });
  const rows = members.map((list) => Int32Array.from(list));
  return { field, labels: bands.labels, colors, index, rows };
}

/** Pearson r over the rows where both value arrays have a number. */
function pairedCorrelation(
  xs: Float64Array,
  ys: Float64Array,
  groups?: Int32Array,
  group?: number
) {
  const a: number[] = [];
  const b: number[] = [];
  for (let i = 0; i < xs.length; i++) {
    if (groups && groups[i] !== group) {
      continue;
    }
    if (xs[i] === xs[i] && ys[i] === ys[i]) {
      a.push(xs[i]!);
      b.push(ys[i]!);
    }
  }
  return pearson(a, b);
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

function planDiagonalBars(
  field: MatrixField,
  snapshot: MatrixSnapshot
): { bars: MatrixBar[]; barIndex: Int32Array } {
  const ids = snapshot.liveIds;
  const data = snapshot.columns[field.field] ?? {};
  const axis = field.axis;
  const barIndex = new Int32Array(ids.length).fill(-1);
  if (axis.kind === "band" && field.bands && field.band) {
    const bands = field.bands;
    const bars: MatrixBar[] = bands.labels.map((label, index) => {
      const start = axis.scale(label) ?? 0;
      return {
        id: `${field.field}:bar:${label}`,
        label,
        start,
        end: start + axis.scale.bandwidth(),
        total: 0,
        selected: 0,
        filter: bandFilter(field.field, bands, index),
      };
    });
    for (let i = 0; i < ids.length; i++) {
      const index = field.band[i]!;
      if (index < 0) {
        continue;
      }
      bars[index]!.total++;
      barIndex[i] = index;
    }
    return { bars, barIndex };
  }
  if (axis.kind !== "numeric") {
    return { bars: [], barIndex };
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
    if (value === undefined) {
      continue;
    }
    const index = Math.min(
      HISTOGRAM_BINS - 1,
      Math.max(0, Math.floor((value - low) / width))
    );
    bars[index]!.total++;
    barIndex[i] = index;
  }
  return { bars, barIndex };
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
  return bandSpanFilter(field.field, field.bands!, axis, [a, b]);
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
    if (filter?.type !== "date-range" || !filter.min || !filter.max) {
      return undefined;
    }
    const a = axis.scale(dateBound(filter.min));
    const b = axis.scale(dateBound(filter.max, true));
    return [Math.min(a, b), Math.max(a, b)];
  }
  return bandFilterSpan(field.field, field.bands!, axis as BandAxis, filters);
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

/**
 * Plans fields, cells, and summaries. None of it depends on the matrix's own
 * filters, so a brush reuses it and only recounts the selection.
 */
export function planMatrixLayout({
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
}): MatrixLayout {
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
    const { axis, bands } = planFieldAxis(
      kind,
      snapshot.allIds,
      data,
      cellSize
    );
    const base = {
      field: name,
      label: getFieldLabel(name),
      index,
      kind,
      axis,
      bands,
    };
    const jitterShare = Math.min(
      1,
      Math.max(0, settings.jitter ?? JITTER_SHARE)
    );
    return {
      ...base,
      ...planOffsets(base, snapshot.liveIds, data, jitterShare),
      ticks: planTicks(base, cellSize),
    };
  });

  const liveIds = snapshot.liveIds;
  const groups = planGroups(settings, snapshot);
  const boxCache = new Map<string, MatrixBoxGroup[]>();
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
        if (kind === "density" && a.value && a.axis.kind === "numeric") {
          const axis = a.axis;
          cell.density = planDensity(
            a.value,
            axis.domain[0],
            axis.domain[1],
            (value) => axis.scale(value)
          );
          if (!cell.density) {
            cell.kind = "label";
          }
        }
        if (kind === "histogram" || kind === "bars") {
          const { bars, barIndex } = planDiagonalBars(a, snapshot);
          cell.bars = bars;
          cell.barIndex = barIndex;
          cell.maxBar = Math.max(1, ...cell.bars.map((bar) => bar.total));
        }
      } else {
        for (let i = 0; i < liveIds.length; i++) {
          if (a.offset[i] === a.offset[i] && b.offset[i] === b.offset[i]) {
            cell.n++;
          }
        }
        if (kind === "correlation" && a.value && b.value) {
          cell.r = pairedCorrelation(a.value, b.value);
          if (groups) {
            cell.groupR = groups.labels.map((_, group) =>
              pairedCorrelation(a.value!, b.value!, groups.index, group)
            );
          }
        } else if (kind === "box") {
          // Mirror cells share one grouping of the same two fields.
          const bandField = a.band ? a : b;
          const valueField = a.band ? b : a;
          const key = `${bandField.index}:${valueField.index}`;
          let groups = boxCache.get(key);
          if (!groups) {
            groups = planBoxGroups(
              bandField.band!,
              valueField.value!,
              bandField.bands!.labels.length
            );
            boxCache.set(key, groups);
          }
          cell.boxes = { horizontal: !a.band, groups };
        } else if (
          (kind === "tiles" || kind === "shares") &&
          a.band &&
          b.band
        ) {
          cell.pairs = planPairs(
            a.band,
            b.band,
            a.bands!.labels.length,
            b.bands!.labels.length
          );
        }
      }
      cells.push(cell);
    }
  }

  // Dense clouds get smaller, lighter points, as in the scatter plot.
  const density =
    liveIds.length > 50_000
      ? 3
      : liveIds.length > 5000
        ? 2
        : liveIds.length > 1000
          ? 1
          : 0;
  const small = cellSize < 110 ? 0.5 : 0;
  return {
    fields,
    groups,
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
    pointRadius:
      settings.pointSize ?? Math.max(0.75, [2.5, 2, 1.5, 1][density]! - small),
    pointOpacity: settings.pointOpacity ?? [0.7, 0.5, 0.35, 0.2][density]!,
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

/** Marks the live rows that pass every one of the matrix's own filters. */
export function planMatrixSelection(
  layout: MatrixLayout,
  filters: Filter[],
  snapshot: MatrixSnapshot
): MatrixSelection {
  const ids = layout.liveIds;
  const selected = new Uint8Array(ids.length);
  if (!filters.length) {
    selected.fill(1);
    return { selected, hasSelection: false, selectedCount: ids.length };
  }
  const checks = filters.map((filter) => ({
    filter,
    values:
      filter.field === "__ID" ? undefined : snapshot.columns[filter.field],
  }));
  let selectedCount = 0;
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]!;
    let pass = true;
    for (const { filter, values } of checks) {
      if (!applyFilter(values ? values[id] : id, filter)) {
        pass = false;
        break;
      }
    }
    if (pass) {
      selected[i] = 1;
      selectedCount++;
    }
  }
  return { selected, hasSelection: true, selectedCount };
}

/** Counts the selection into diagonal bars, box plots, and pair cells. */
export function withSelectedBars(
  layout: MatrixLayout,
  selection: MatrixSelection
): MatrixPlan {
  const selected = selection.selected;
  const groups = layout.groups;
  const boxStats = new Map<MatrixBoxGroup[], (MatrixBoxStats | undefined)[]>();
  const cells = layout.cells.map((cell) => {
    if (cell.density) {
      return {
        ...cell,
        density: {
          ...cell.density,
          ...selectedDensities(
            cell.density,
            selected,
            groups && { index: groups.index, count: groups.labels.length }
          ),
        },
      };
    }
    if (cell.bars && cell.barIndex) {
      const counts = new Int32Array(cell.bars.length);
      const byGroup = groups
        ? cell.bars.map(() => new Array<number>(groups.labels.length).fill(0))
        : undefined;
      const index = cell.barIndex;
      for (let i = 0; i < index.length; i++) {
        const bar = index[i]!;
        if (selected[i] && bar >= 0) {
          counts[bar]!++;
          const group = groups?.index[i] ?? -1;
          if (byGroup && group >= 0) {
            byGroup[bar]![group]!++;
          }
        }
      }
      return {
        ...cell,
        bars: cell.bars.map((bar, b) => ({
          ...bar,
          selected: counts[b]!,
          groups: byGroup?.[b],
        })),
      };
    }
    if (cell.boxes && selection.hasSelection) {
      const groups = cell.boxes.groups;
      let stats = boxStats.get(groups);
      if (!stats) {
        stats = groups.map((group) => selectedBoxStats(group, selected));
        boxStats.set(groups, stats);
      }
      return { ...cell, boxes: { ...cell.boxes, selected: stats } };
    }
    if (cell.pairs) {
      return { ...cell, pairSelected: selectedPairs(cell.pairs, selected) };
    }
    return cell;
  });
  return { ...layout, ...selection, cells };
}

export function planScatterMatrix(args: {
  settings: ScatterMatrixSettings;
  snapshot: MatrixSnapshot;
  width: number;
  height: number;
  getFieldLabel?: (field: string) => string;
}): MatrixPlan {
  const layout = planMatrixLayout(args);
  return withSelectedBars(
    layout,
    planMatrixSelection(layout, args.settings.filters, args.snapshot)
  );
}

/** Moves one item to a new index, keeping the rest in order. */
export function moveField(fields: string[], from: number, to: number) {
  if (to < 0 || to >= fields.length || from === to) {
    return fields;
  }
  const next = [...fields];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/**
 * The filters a click on a mark sets: a diagonal bar, a box plot's category,
 * or a tile's pair of categories. Undefined when the click missed every mark.
 */
export function markFilters(
  plan: MatrixPlan,
  cell: MatrixCell,
  x: number,
  y: number
): Filter[] | undefined {
  const size = plan.cellSize;
  const column = plan.fields[cell.column]!;
  const row = plan.fields[cell.row]!;
  if (cell.bars) {
    const height = size - 2;
    const bar = cell.bars.find(
      (item) =>
        x >= Math.min(item.start, item.end) &&
        x <= Math.max(item.start, item.end) &&
        y >= size - (item.total / cell.maxBar!) * height - 2
    );
    return bar && [bar.filter];
  }
  if (cell.boxes) {
    const field = cell.boxes.horizontal ? row : column;
    const band = bandAt(
      field.axis as BandAxis,
      cell.boxes.horizontal ? size - y : x
    );
    return cell.boxes.groups.some((group) => group.band === band)
      ? [bandFilter(field.field, field.bands!, band)]
      : undefined;
  }
  if (cell.pairs && column.bands && row.bands) {
    const a = bandAt(column.axis as BandAxis, x);
    const b = bandAt(row.axis as BandAxis, size - y);
    return a >= 0 && b >= 0 && cell.pairs.total[a * cell.pairs.rows + b]
      ? [
          bandFilter(column.field, column.bands, a),
          bandFilter(row.field, row.bands, b),
        ]
      : undefined;
  }
  return undefined;
}

/** True when the matrix already holds exactly these filters on their fields. */
export function sameSelection(current: Filter[], next: Filter[]) {
  const fields = new Set(next.map((filter) => filter.field));
  const held = current.filter((filter) => fields.has(filter.field));
  return (
    held.length === next.length &&
    next.every((filter) =>
      held.some((item) => JSON.stringify(item) === JSON.stringify(filter))
    )
  );
}
