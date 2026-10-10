import { scaleLinear } from "d3-scale";
import { finiteNumber, timestampOf } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";
import {
  findOverride,
  MUTED_INK,
  INK,
  type CompositionDefinition,
  type InstanceOverride,
  type NumericScale,
  type PathMark,
  type PointMark,
  type PositionScale,
  type StripMark,
  type TimeInterval,
  type UnitElement,
  type ValueScale,
} from "./compositionTypes";
import type { Bounds, PathNode, SceneNode } from "./resolveComposition";
import { evaluateCalc, type CalcResult } from "./calculations";
import { MISSING, orderedRows } from "./ordering";

/** The rows a composition draws from. */
export interface CompositionData {
  /** Every row in the composition's population. Units and domains come from these. */
  allIds: number[];
  /** Rows that pass the active filters. Marks draw these. */
  liveIds: number[];
  column: (field: string) => Record<number, datum>;
  /** Repeats selected in viewing; the others fade. */
  selection?: { field: string; keys: Set<string> };
}

export interface PositionBin {
  key: string;
  label: string;
}

/** A numeric scale as one repeat uses it: its domain and pixel range. */
export interface NumericAxis {
  scale: NumericScale;
  domain: [number, number];
  range: [number, number];
}

export interface ResolvedInstance {
  /** The subset value as text. Stable across reorders and filters. */
  key: string;
  label: string;
  index: number;
  bounds: Bounds;
  frame: Bounds;
  /** Rows in the subset, and those that pass the filters. */
  rowCount: number;
  liveCount: number;
  allIds: number[];
  liveIds: number[];
  /** Bins of the first strip mark's position scale, for guides and anchors. */
  position?: { scale: PositionScale; bins: PositionBin[] };
  /** Numeric x and y of the first point or path mark, for guides and anchors. */
  xy?: { x: NumericAxis; y: NumericAxis };
  /** The value shown beside the label, when the unit has one. */
  labelValue?: CalcResult;
  override?: InstanceOverride;
  /** Where automatic layout put the repeat, before its override. */
  layoutOrigin: { x: number; y: number };
}

/** What one glyph stands for, kept so inspection can list its rows. */
export interface GlyphDatum {
  instanceKey: string;
  markId: string;
  /** The position bin of a strip glyph, or the order value of a point. */
  bin: PositionBin;
  /** The aggregated value of a strip glyph, or the y value of a point. */
  value: number;
  rowIds: number[];
  /** Numeric coordinates, for point marks. */
  point?: { x: number; y: number; xField: string; yField: string };
}

/** What one path stands for: its rows in order, and the ones it skipped. */
export interface PathDatum {
  instanceKey: string;
  markId: string;
  orderField: string;
  /** Rows in path order, including the ones a missing value skipped. */
  rowIds: number[];
  /** Rows left out because a coordinate or order value was missing. */
  skipped: number[];
  /** Connected runs; a skipped row starts a new one. */
  segments: number;
}

export interface ResolvedUnit {
  nodes: SceneNode[];
  bounds: Bounds;
  instances: ResolvedInstance[];
}

const GRID = "#e6e8eb";

/** Rows of one repeat. */
interface Subset {
  key: string;
  label: string;
  allIds: number[];
  liveIds: number[];
}

type ResolvedStrip = {
  type: "strip";
  mark: StripMark;
  position: PositionScale;
  value: ValueScale;
};
type ResolvedXy = {
  type: "xy";
  mark: PointMark | PathMark;
  x: NumericScale;
  y: NumericScale;
};
type ResolvedMark = ResolvedStrip | ResolvedXy;

export function resolveUnit(
  definition: CompositionDefinition,
  unit: UnitElement,
  data: CompositionData
): ResolvedUnit {
  const subsets = repeatSubsets(unit, data, definition);
  const scale = (id: string) =>
    definition.scales.find((item) => item.id === id);
  const marks: ResolvedMark[] = [];
  for (const mark of unit.marks) {
    if (mark.type === "strip") {
      const position = scale(mark.positionScaleId);
      const value = scale(mark.valueScaleId);
      if (position?.kind === "position" && value?.kind === "value")
        marks.push({ type: "strip", mark, position, value });
    } else {
      const x = scale(mark.xScaleId);
      const y = scale(mark.yScaleId);
      if (x?.kind === "numeric" && y?.kind === "numeric")
        marks.push({ type: "xy", mark, x, y });
    }
  }
  const strips = marks.filter(
    (item): item is ResolvedStrip => item.type === "strip"
  );
  const xys = marks.filter((item): item is ResolvedXy => item.type === "xy");

  // Shared position domains span every row; per-unit domains span the subset.
  const sharedBins = new Map<string, PositionBin[]>();
  const binsFor = (scale: PositionScale, subset: Subset) => {
    if (scale.domain === "instance")
      return positionBins(scale, data.column(scale.field), subset.allIds);
    let bins = sharedBins.get(scale.id);
    if (!bins) {
      bins = positionBins(scale, data.column(scale.field), data.allIds);
      sharedBins.set(scale.id, bins);
    }
    return bins;
  };
  const sharedDomains = new Map<string, [number, number]>();
  const domainFor = (scale: NumericScale, subset: Subset) => {
    if (scale.domain === "instance")
      return numericDomain(scale, data.column(scale.field), subset.allIds);
    let domain = sharedDomains.get(scale.id);
    if (!domain) {
      domain = numericDomain(scale, data.column(scale.field), data.allIds);
      sharedDomains.set(scale.id, domain);
    }
    return domain;
  };

  // First pass: aggregate each strip mark per subset and bin.
  const aggregated = subsets.map((subset) =>
    strips.map(({ mark, position }) => {
      const bins = binsFor(position, subset);
      const keyOf = binKeyReader(position, data.column(position.field));
      const groups = new Map<string, number[]>();
      for (const id of subset.liveIds) {
        const key = keyOf(id);
        if (key === undefined) continue;
        const group = groups.get(key);
        if (group) group.push(id);
        else groups.set(key, [id]);
      }
      const measure = mark.measureField
        ? data.column(mark.measureField)
        : undefined;
      const glyphs: GlyphDatum[] = [];
      bins.forEach((bin) => {
        const rowIds = groups.get(bin.key);
        if (!rowIds) return;
        const value = aggregate(mark, rowIds, measure);
        if (value === undefined) return;
        glyphs.push({
          instanceKey: subset.key,
          markId: mark.id,
          bin,
          value,
          rowIds,
        });
      });
      return { bins, glyphs };
    })
  );

  // Value domains: the largest value across every repeat, or within each.
  const sharedMax = new Map<string, number>();
  aggregated.forEach((perMark) =>
    perMark.forEach(({ glyphs }, markIndex) => {
      const id = strips[markIndex]!.value.id;
      for (const glyph of glyphs)
        sharedMax.set(id, Math.max(sharedMax.get(id) ?? 0, glyph.value));
    })
  );

  const nodes: SceneNode[] = [];
  const instances: ResolvedInstance[] = [];
  const labelSize = unit.label.fontSize;
  const labelLeft = unit.repeat.arrangement === "rows" && unit.label.show;
  const labelTop = unit.repeat.arrangement !== "rows" && unit.label.show;
  const labelWidth = labelLeft ? unit.label.width : 0;
  const labelHeight = labelTop ? Math.round(labelSize * 1.6) : 0;
  const axisHeight = unit.axis ? 16 : 0;
  // Rows share one axis under the last row; columns and grids label each frame.
  const axisPerUnit = unit.repeat.arrangement !== "rows";
  const cellWidth = labelWidth + unit.frame.width;
  const cellHeight =
    labelHeight + unit.frame.height + (axisPerUnit ? axisHeight : 0);
  const columns =
    unit.repeat.arrangement === "rows"
      ? 1
      : unit.repeat.arrangement === "columns"
        ? Math.max(1, subsets.length)
        : Math.max(1, unit.repeat.columns);

  subsets.forEach((subset, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const layoutX = unit.x + column * (cellWidth + unit.repeat.gap);
    const layoutY = unit.y + row * (cellHeight + unit.repeat.gap);
    const override = findOverride(definition, unit.id, subset.key);
    const x = layoutX + (override?.dx ?? 0);
    const y = layoutY + (override?.dy ?? 0);
    const selection = data.selection;
    const faded =
      selection !== undefined &&
      selection.field === unit.repeat.field &&
      !selection.keys.has(subset.key);
    const opacity = (override?.opacity ?? 1) * (faded ? 0.25 : 1);
    const firstNode = nodes.length;
    const frame: Bounds = {
      x: x + labelWidth,
      y: y + labelHeight,
      width: unit.frame.width,
      height: unit.frame.height,
    };
    const labelCalc = definition.calculations.find(
      (calc) => calc.id === unit.label.valueCalcId
    );
    const labelValue = labelCalc && evaluateCalc(labelCalc, data, subset);
    if (unit.label.show && labelValue && labelLeft) {
      nodes.push({
        type: "text",
        key: `${unit.id}:${subset.key}:value`,
        elementId: unit.id,
        instanceKey: subset.key,
        x: x + labelWidth - 10,
        lines: [
          {
            text: labelValue.text,
            y: frame.y + frame.height / 2 + labelSize * 0.35,
          },
        ],
        fontSize: labelSize,
        fontWeight: 400,
        fill: MUTED_INK,
        anchor: "end",
      });
    }
    if (unit.label.show && subset.label) {
      nodes.push({
        type: "text",
        key: `${unit.id}:${subset.key}:label`,
        elementId: unit.id,
        instanceKey: subset.key,
        x,
        lines: [
          {
            text:
              labelValue && !labelLeft
                ? `${subset.label} · ${labelValue.text}`
                : subset.label,
            y: labelLeft
              ? frame.y + frame.height / 2 + labelSize * 0.35
              : y + labelSize,
          },
        ],
        fontSize: labelSize,
        fontWeight: override?.emphasize ? 700 : 600,
        fill: override?.accent ?? INK,
        anchor: "start",
      });
    }

    // Numeric frames: the first x–y mark's scales place guides and axes too.
    const firstXy = xys[0];
    const xy = firstXy && {
      x: numericAxis(firstXy.x, domainFor(firstXy.x, subset), [
        frame.x,
        frame.x + frame.width,
      ]),
      y: numericAxis(firstXy.y, domainFor(firstXy.y, subset), [
        frame.y + frame.height,
        frame.y,
      ]),
    };
    const drawAxis = unit.axis && (axisPerUnit || index === subsets.length - 1);
    // Grid lines sit under the marks.
    if (xy && unit.axis)
      nodes.push(...numericGridNodes(unit, subset.key, xy, frame));

    aggregated[index]!.forEach(({ bins, glyphs }, markIndex) => {
      const { mark, value } = strips[markIndex]!;
      const instanceMax =
        value.domain === "instance"
          ? Math.max(0, ...glyphs.map((glyph) => glyph.value))
          : (sharedMax.get(value.id) ?? 0);
      // An accent recolors this repeat's marks, keeping the template's ramp.
      const accented = override?.accent
        ? {
            mark: { ...mark, fill: override.accent },
            value: {
              ...value,
              colors: [value.colors[0], override.accent] as [string, string],
            },
          }
        : { mark, value };
      nodes.push(
        ...glyphNodes(
          unit,
          accented.mark,
          accented.value,
          frame,
          bins,
          glyphs,
          instanceMax
        )
      );
    });
    for (const item of xys) {
      const axes = {
        x: numericAxis(item.x, domainFor(item.x, subset), [
          frame.x,
          frame.x + frame.width,
        ]),
        y: numericAxis(item.y, domainFor(item.y, subset), [
          frame.y + frame.height,
          frame.y,
        ]),
      };
      const accent = override?.accent;
      nodes.push(
        ...(item.mark.type === "path"
          ? pathNodes(
              unit,
              accent ? { ...item.mark, stroke: accent } : item.mark,
              subset,
              axes,
              frame,
              data
            )
          : pointNodes(
              unit,
              accent ? { ...item.mark, fill: accent } : item.mark,
              subset,
              axes,
              frame,
              data
            ))
      );
    }
    if (opacity < 1)
      for (let index = firstNode; index < nodes.length; index += 1)
        nodes[index] = { ...nodes[index]!, opacity };
    if (drawAxis) {
      const first = strips[0];
      if (first) {
        const bins = binsFor(first.position, subset);
        nodes.push(...axisNodes(unit, subset.key, first.position, bins, frame));
      } else if (xy) {
        nodes.push(...numericAxisNodes(unit, subset.key, xy, frame));
      }
    }
    instances.push({
      key: subset.key,
      label: subset.label,
      index,
      bounds: {
        x,
        y,
        width: cellWidth,
        height: labelHeight + unit.frame.height + (drawAxis ? axisHeight : 0),
      },
      frame,
      rowCount: subset.allIds.length,
      liveCount: subset.liveIds.length,
      allIds: subset.allIds,
      liveIds: subset.liveIds,
      position: strips[0] && {
        scale: strips[0].position,
        bins: binsFor(strips[0].position, subset),
      },
      xy,
      labelValue,
      override,
      layoutOrigin: { x: layoutX, y: layoutY },
    });
  });

  return { nodes, bounds: unionBounds(instances, unit), instances };
}

function unionBounds(instances: ResolvedInstance[], unit: UnitElement) {
  if (!instances.length)
    return {
      x: unit.x,
      y: unit.y,
      width: unit.label.width + unit.frame.width,
      height: unit.frame.height,
    };
  const left = Math.min(...instances.map((item) => item.bounds.x));
  const top = Math.min(...instances.map((item) => item.bounds.y));
  const right = Math.max(
    ...instances.map((item) => item.bounds.x + item.bounds.width)
  );
  const bottom = Math.max(
    ...instances.map((item) => item.bounds.y + item.bounds.height)
  );
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/**
 * Splits rows by the repeat field, in the rule's order, up to its limit. The
 * value order needs the definition for its calculation; without it, repeats
 * fall back to label order.
 */
export function repeatSubsets(
  unit: UnitElement,
  data: CompositionData,
  definition?: CompositionDefinition
): Subset[] {
  const field = unit.repeat.field;
  if (!field)
    return [
      { key: "all", label: "", allIds: data.allIds, liveIds: data.liveIds },
    ];
  const values = data.column(field);
  const keyOf = (id: number) => {
    const value = values[id];
    return value === null || value === undefined || value === ""
      ? MISSING
      : String(value);
  };
  const groups = new Map<string, Subset>();
  for (const id of data.allIds) {
    const key = keyOf(id);
    let subset = groups.get(key);
    if (!subset) {
      subset = { key, label: key, allIds: [], liveIds: [] };
      groups.set(key, subset);
    }
    subset.allIds.push(id);
  }
  for (const id of data.liveIds) groups.get(keyOf(id))?.liveIds.push(id);
  const subsets = [...groups.values()];
  const calc =
    unit.repeat.order === "value"
      ? definition?.calculations.find(
          (item) => item.id === unit.repeat.orderCalcId
        )
      : undefined;
  if (calc) {
    // Repeats keep their place while filtering: the order reads every row.
    const values = new Map(
      subsets.map((subset) => [
        subset.key,
        evaluateCalc(calc, data, { ...subset, liveIds: subset.allIds }).value,
      ])
    );
    const sign = unit.repeat.direction === "desc" ? -1 : 1;
    subsets.sort((a, b) => {
      const va = values.get(a.key);
      const vb = values.get(b.key);
      if (va === undefined)
        return vb === undefined ? compareLabels(a.key, b.key) : 1;
      if (vb === undefined) return -1;
      return sign * (va - vb) || compareLabels(a.key, b.key);
    });
  } else {
    subsets.sort((a, b) =>
      unit.repeat.order === "count"
        ? b.allIds.length - a.allIds.length || compareLabels(a.key, b.key)
        : compareLabels(a.key, b.key)
    );
  }
  return subsets.slice(0, Math.max(1, unit.repeat.limit));
}

const collator = new Intl.Collator("en", { numeric: true });
function compareLabels(a: string, b: string) {
  return collator.compare(a, b);
}

function aggregate(
  mark: StripMark,
  rowIds: number[],
  measure: Record<number, datum> | undefined
) {
  if (mark.aggregation === "count" || !measure) return rowIds.length;
  let sum = 0;
  let count = 0;
  for (const id of rowIds) {
    const value = finiteNumber(measure[id]);
    if (value === undefined) continue;
    sum += value;
    count += 1;
  }
  if (!count) return undefined;
  return mark.aggregation === "sum" ? sum : sum / count;
}

// Parsing dates is the slow part, so each column keeps its parsed periods.
const periodCache = new WeakMap<
  Record<number, datum>,
  Map<TimeInterval, Map<number, number>>
>();

export function periodStart(time: number, interval: TimeInterval) {
  const date = new Date(time);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  switch (interval) {
    case "year":
      return Date.UTC(year, 0, 1);
    case "month":
      return Date.UTC(year, month, 1);
    case "week": {
      const start = Date.UTC(year, month, day);
      // Weeks start on Monday.
      return start - ((date.getUTCDay() + 6) % 7) * 86_400_000;
    }
    case "day":
      return Date.UTC(year, month, day);
  }
}

function nextPeriod(start: number, interval: TimeInterval) {
  const date = new Date(start);
  switch (interval) {
    case "year":
      return Date.UTC(date.getUTCFullYear() + 1, 0, 1);
    case "month":
      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1);
    case "week":
      return start + 7 * 86_400_000;
    case "day":
      return start + 86_400_000;
  }
}

function periodsOf(column: Record<number, datum>, interval: TimeInterval) {
  let byInterval = periodCache.get(column);
  if (!byInterval) {
    byInterval = new Map();
    periodCache.set(column, byInterval);
  }
  let periods = byInterval.get(interval);
  if (!periods) {
    periods = new Map();
    for (const [id, value] of Object.entries(column)) {
      const time = timestampOf(value);
      if (time !== undefined)
        periods.set(Number(id), periodStart(time, interval));
    }
    byInterval.set(interval, periods);
  }
  return periods;
}

export const periodKey = (start: number) =>
  new Date(start).toISOString().slice(0, 10);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function periodLabel(start: number, interval: TimeInterval) {
  const date = new Date(start);
  const year = date.getUTCFullYear();
  if (interval === "year") return String(year);
  if (interval === "month") return `${MONTHS[date.getUTCMonth()]} ${year}`;
  return periodKey(start);
}

/** Reads the bin key of a row for a position scale. */
function binKeyReader(
  scale: PositionScale,
  column: Record<number, datum>
): (id: number) => string | undefined {
  if (scale.interval) {
    const periods = periodsOf(column, scale.interval);
    return (id) => {
      const start = periods.get(id);
      return start === undefined ? undefined : periodKey(start);
    };
  }
  return (id) => {
    const value = column[id];
    return value === null || value === undefined || value === ""
      ? undefined
      : String(value);
  };
}

/**
 * The bins a position scale lays out for these rows: every period from the
 * first to the last, gaps included, or each distinct value in order.
 */
export function positionBins(
  scale: PositionScale,
  column: Record<number, datum>,
  ids: number[]
): PositionBin[] {
  if (scale.interval) {
    const periods = periodsOf(column, scale.interval);
    let min = Infinity;
    let max = -Infinity;
    for (const id of ids) {
      const start = periods.get(id);
      if (start === undefined) continue;
      if (start < min) min = start;
      if (start > max) max = start;
    }
    const bins: PositionBin[] = [];
    // A guard keeps a bad interval choice, such as days over decades, bounded.
    for (
      let start = min;
      start <= max && bins.length < 5000;
      start = nextPeriod(start, scale.interval)
    )
      bins.push({
        key: periodKey(start),
        label: periodLabel(start, scale.interval),
      });
    return bins;
  }
  const values = new Set<string>();
  for (const id of ids) {
    const value = column[id];
    if (value !== null && value !== undefined && value !== "")
      values.add(String(value));
  }
  return [...values]
    .sort(compareLabels)
    .map((value) => ({ key: value, label: value }));
}

/**
 * The extent a numeric scale spans for these rows, after its zero, nice, and
 * fixed-limit settings. A field with no numbers spans 0–1 so marks still
 * have somewhere to go.
 */
export function numericDomain(
  scale: NumericScale,
  column: Record<number, datum>,
  ids: number[]
): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const id of ids) {
    const value = finiteNumber(column[id]);
    if (value === undefined) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (min === Infinity) {
    min = 0;
    max = 1;
  }
  if (scale.zero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }
  if (min === max) {
    // One value: pad so the mark sits in the middle rather than on an edge.
    const pad = Math.abs(min) * 0.1 || 1;
    min -= pad;
    max += pad;
  }
  if (scale.nice) {
    const nice = scaleLinear().domain([min, max]).nice().domain();
    min = nice[0]!;
    max = nice[1]!;
  }
  if (scale.min !== undefined) min = scale.min;
  if (scale.max !== undefined) max = scale.max;
  if (min >= max) max = min + 1;
  return [min, max];
}

function numericAxis(
  scale: NumericScale,
  domain: [number, number],
  range: [number, number]
): NumericAxis {
  return { scale, domain, range };
}

/** Maps a value along a numeric axis, in artboard pixels. */
export function numericPixel(axis: NumericAxis, value: number) {
  const [d0, d1] = axis.domain;
  const [r0, r1] = axis.range;
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

/** True when the axis has a fixed limit, so marks outside it must clip. */
function fixedLimits(axis: NumericAxis) {
  return axis.scale.min !== undefined || axis.scale.max !== undefined;
}

function pathNodes(
  unit: UnitElement,
  mark: PathMark,
  subset: Subset,
  axes: { x: NumericAxis; y: NumericAxis },
  frame: Bounds,
  data: CompositionData
): SceneNode[] {
  const xs = data.column(axes.x.scale.field);
  const ys = data.column(axes.y.scale.field);
  const rows = orderedRows(subset.liveIds, data.column(mark.orderField));
  const segments: PathNode["segments"] = [];
  let current: PathNode["segments"][number] = [];
  const skipped: number[] = [];
  for (const row of rows) {
    const x = finiteNumber(xs[row.id]);
    const y = finiteNumber(ys[row.id]);
    if (row.order === undefined || x === undefined || y === undefined) {
      skipped.push(row.id);
      if (current.length) segments.push(current);
      current = [];
      continue;
    }
    current.push({
      x: numericPixel(axes.x, x),
      y: numericPixel(axes.y, y),
      rowId: row.id,
    });
  }
  if (current.length) segments.push(current);
  if (!segments.length) return [];
  const clip = fixedLimits(axes.x) || fixedLimits(axes.y) ? frame : undefined;
  return [
    {
      type: "path",
      key: `${unit.id}:${subset.key}:${mark.id}`,
      elementId: unit.id,
      instanceKey: subset.key,
      segments,
      stroke: mark.stroke,
      strokeWidth: mark.strokeWidth,
      clip,
      path: {
        instanceKey: subset.key,
        markId: mark.id,
        orderField: mark.orderField,
        rowIds: rows.map((row) => row.id),
        skipped,
        segments: segments.length,
      },
    },
  ];
}

function pointNodes(
  unit: UnitElement,
  mark: PointMark,
  subset: Subset,
  axes: { x: NumericAxis; y: NumericAxis },
  frame: Bounds,
  data: CompositionData
): SceneNode[] {
  const xs = data.column(axes.x.scale.field);
  const ys = data.column(axes.y.scale.field);
  const labels = mark.labelField ? data.column(mark.labelField) : undefined;
  const rows = orderedRows(
    subset.liveIds,
    mark.orderField ? data.column(mark.orderField) : undefined
  );
  const clip = fixedLimits(axes.x) || fixedLimits(axes.y) ? frame : undefined;
  const nodes: SceneNode[] = [];
  let drawn = 0;
  for (const row of pickShown(rows, mark.show ?? "all", xs, ys)) {
    const x = finiteNumber(xs[row.id]);
    const y = finiteNumber(ys[row.id]);
    if (x === undefined || y === undefined) continue;
    const cx = numericPixel(axes.x, x);
    const cy = numericPixel(axes.y, y);
    const key = `${unit.id}:${subset.key}:${mark.id}:${row.id}`;
    const glyph: GlyphDatum = {
      instanceKey: subset.key,
      markId: mark.id,
      bin: { key: row.label, label: row.label },
      value: y,
      rowIds: [row.id],
      point: {
        x,
        y,
        xField: axes.x.scale.field,
        yField: axes.y.scale.field,
      },
    };
    nodes.push({
      type: "circle",
      key,
      elementId: unit.id,
      instanceKey: subset.key,
      cx,
      cy,
      r: mark.radius,
      fill: mark.fill,
      clip,
      glyph,
    });
    if (labels && mark.labelEvery > 0 && drawn % mark.labelEvery === 0) {
      const raw = labels[row.id];
      const text = raw === null || raw === undefined ? "" : String(raw).trim();
      if (text)
        nodes.push({
          type: "text",
          key: `${key}:label`,
          elementId: unit.id,
          instanceKey: subset.key,
          x: cx + mark.radius + 3,
          lines: [{ text, y: cy - mark.radius - 1 }],
          fontSize: 10,
          fontWeight: 400,
          fill: MUTED_INK,
          anchor: "start",
        });
    }
    drawn += 1;
  }
  return nodes;
}

/**
 * The rows a point mark draws: every row with both coordinates, or only the
 * first or last in order, or the lowest or highest by y. Ties on y keep the
 * earliest row.
 */
function pickShown(
  rows: ReturnType<typeof orderedRows>,
  show: NonNullable<PointMark["show"]>,
  xs: Record<number, datum>,
  ys: Record<number, datum>
) {
  const drawable = rows.filter(
    (row) =>
      finiteNumber(xs[row.id]) !== undefined &&
      finiteNumber(ys[row.id]) !== undefined
  );
  if (show === "all" || !drawable.length) return drawable;
  if (show === "first") return [drawable[0]!];
  if (show === "last") return [drawable[drawable.length - 1]!];
  let picked = drawable[0]!;
  for (const row of drawable) {
    const y = finiteNumber(ys[row.id])!;
    const best = finiteNumber(ys[picked.id])!;
    if (show === "max" ? y > best : y < best) picked = row;
  }
  return [picked];
}

/** Faint horizontal rules at the y ticks, under the marks. */
function numericGridNodes(
  unit: UnitElement,
  instanceKey: string,
  xy: { x: NumericAxis; y: NumericAxis },
  frame: Bounds
): SceneNode[] {
  return tickValues(xy.y, frame.height, 36).map((value) => {
    const y = numericPixel(xy.y, value);
    return {
      type: "line",
      key: `${unit.id}:${instanceKey}:grid:${value}`,
      elementId: unit.id,
      x1: frame.x,
      x2: frame.x + frame.width,
      y1: y,
      y2: y,
      stroke: GRID,
      strokeWidth: 1,
    };
  });
}

/** Tick values along a numeric axis, about one per `spacing` pixels. */
function tickValues(axis: NumericAxis, length: number, spacing: number) {
  const count = Math.max(2, Math.floor(length / spacing));
  return scaleLinear().domain(axis.domain).ticks(count);
}

const tickFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** Tick labels under and beside a numeric frame. */
function numericAxisNodes(
  unit: UnitElement,
  instanceKey: string,
  xy: { x: NumericAxis; y: NumericAxis },
  frame: Bounds
): SceneNode[] {
  const label = (
    text: string,
    x: number,
    y: number,
    anchor: "start" | "middle" | "end",
    key: string
  ): SceneNode => ({
    type: "text",
    key: `${unit.id}:${instanceKey}:axis:${key}`,
    elementId: unit.id,
    x,
    lines: [{ text, y }],
    fontSize: 10,
    fontWeight: 400,
    fill: MUTED_INK,
    anchor,
  });
  const nodes = tickValues(xy.x, frame.width, 72).map((value) =>
    label(
      tickFormat.format(value),
      numericPixel(xy.x, value),
      frame.y + frame.height + 14,
      "middle",
      `x:${value}`
    )
  );
  for (const value of tickValues(xy.y, frame.height, 36))
    nodes.push(
      label(
        tickFormat.format(value),
        frame.x - 6,
        numericPixel(xy.y, value) + 3.5,
        "end",
        `y:${value}`
      )
    );
  return nodes;
}

/** Maps a value to 0–1 along a value scale with this maximum. */
export function valueShare(scale: ValueScale, value: number, max: number) {
  if (max <= 0 || value <= 0) return 0;
  const transform =
    scale.transform === "sqrt"
      ? Math.sqrt
      : scale.transform === "log"
        ? Math.log1p
        : (input: number) => input;
  return Math.min(1, transform(value) / transform(max));
}

export function valueColor(scale: ValueScale, share: number) {
  // Even the smallest value stays visible against the paper.
  return scaleLinear<string>().domain([0, 1]).range(scale.colors).clamp(true)(
    0.1 + 0.9 * share
  );
}

function glyphNodes(
  unit: UnitElement,
  mark: StripMark,
  scale: ValueScale,
  frame: Bounds,
  bins: PositionBin[],
  glyphs: GlyphDatum[],
  max: number
): SceneNode[] {
  if (!bins.length) return [];
  const band = frame.width / bins.length;
  const index = new Map(bins.map((bin, position) => [bin.key, position]));
  const inset = Math.min(mark.inset, band * 0.5);
  return glyphs.flatMap((glyph): SceneNode[] => {
    const position = index.get(glyph.bin.key);
    if (position === undefined) return [];
    const share = valueShare(scale, glyph.value, max);
    const left = frame.x + position * band;
    const fill =
      mark.encoding === "color" ? valueColor(scale, share) : mark.fill;
    const key = `${unit.id}:${glyph.instanceKey}:${mark.id}:${glyph.bin.key}`;
    const base = {
      key,
      elementId: unit.id,
      instanceKey: glyph.instanceKey,
      glyph,
      fill,
    };
    const width = Math.max(0.5, band - inset);
    if (mark.shape === "rect") {
      if (mark.encoding === "height") {
        const height = frame.height * share;
        return [
          {
            ...base,
            type: "rect",
            x: left + inset / 2,
            y: frame.y + frame.height - height,
            width,
            height,
          },
        ];
      }
      if (mark.encoding === "size") {
        const side = Math.min(width, frame.height) * share;
        return [
          {
            ...base,
            type: "rect",
            x: left + band / 2 - side / 2,
            y: frame.y + frame.height / 2 - side / 2,
            width: side,
            height: side,
          },
        ];
      }
      return [
        {
          ...base,
          type: "rect",
          x: left + inset / 2,
          y: frame.y,
          width,
          height: frame.height,
        },
      ];
    }
    const radius = Math.max(0.5, Math.min(width, frame.height) / 2);
    const cx = left + band / 2;
    if (mark.encoding === "height") {
      const r = Math.max(1.5, Math.min(radius, 4));
      return [
        {
          ...base,
          type: "circle",
          cx,
          cy: frame.y + frame.height - r - (frame.height - 2 * r) * share,
          r,
        },
      ];
    }
    return [
      {
        ...base,
        type: "circle",
        cx,
        cy: frame.y + frame.height / 2,
        r: mark.encoding === "size" ? radius * share : radius,
      },
    ];
  });
}

/** Labels along a frame's bottom, thinned so they do not collide. */
function axisNodes(
  unit: UnitElement,
  instanceKey: string,
  scale: PositionScale,
  bins: PositionBin[],
  frame: Bounds
): SceneNode[] {
  if (!bins.length) return [];
  const band = frame.width / bins.length;
  const y = frame.y + frame.height + 12;
  const label = (text: string, x: number, key: string): SceneNode => ({
    type: "text",
    key: `${unit.id}:${instanceKey}:axis:${key}`,
    elementId: unit.id,
    x,
    lines: [{ text, y }],
    fontSize: 10,
    fontWeight: 400,
    fill: MUTED_INK,
    anchor: "start",
  });
  // Months across years label each January with its year.
  if (scale.interval === "month" && bins.length > 12) {
    return bins.flatMap((bin, index) =>
      bin.label.startsWith("Jan ") || index === 0
        ? [label(bin.label.slice(4), frame.x + index * band, bin.key)]
        : []
    );
  }
  const step = Math.max(1, Math.ceil(56 / band));
  return bins.flatMap((bin, index) =>
    index % step === 0
      ? [label(bin.label, frame.x + index * band, bin.key)]
      : []
  );
}
