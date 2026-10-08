import { scaleLinear } from "d3-scale";
import { dateTimestamp } from "@/lib/dateTime";
import { finiteNumber } from "@/lib/numeric";
import type { datum } from "@/types/ChartTypes";
import {
  findOverride,
  MUTED_INK,
  INK,
  type CompositionDefinition,
  type InstanceOverride,
  type MarkDefinition,
  type PositionScale,
  type TimeInterval,
  type UnitElement,
  type ValueScale,
} from "./compositionTypes";
import type { Bounds, SceneNode } from "./resolveComposition";
import { evaluateCalc, type CalcResult } from "./calculations";

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
  /** Bins of the first mark's position scale, for guides and anchors. */
  position?: { scale: PositionScale; bins: PositionBin[] };
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
  bin: PositionBin;
  value: number;
  rowIds: number[];
}

export interface ResolvedUnit {
  nodes: SceneNode[];
  bounds: Bounds;
  instances: ResolvedInstance[];
}

const MISSING = "Missing";

/** Rows of one repeat. */
interface Subset {
  key: string;
  label: string;
  allIds: number[];
  liveIds: number[];
}

export function resolveUnit(
  definition: CompositionDefinition,
  unit: UnitElement,
  data: CompositionData
): ResolvedUnit {
  const subsets = repeatSubsets(unit, data);
  const marks = unit.marks
    .map((mark) => ({
      mark,
      position: definition.scales.find(
        (scale): scale is PositionScale =>
          scale.kind === "position" && scale.id === mark.positionScaleId
      ),
      value: definition.scales.find(
        (scale): scale is ValueScale =>
          scale.kind === "value" && scale.id === mark.valueScaleId
      ),
    }))
    .filter(
      (
        item
      ): item is {
        mark: MarkDefinition;
        position: PositionScale;
        value: ValueScale;
      } => Boolean(item.position && item.value)
    );

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

  // First pass: aggregate each mark per subset and bin.
  const aggregated = subsets.map((subset) =>
    marks.map(({ mark, position }) => {
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
      const id = marks[markIndex]!.value.id;
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
          { text: labelValue.text, y: frame.y + frame.height / 2 + labelSize * 0.35 },
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
    aggregated[index]!.forEach(({ bins, glyphs }, markIndex) => {
      const { mark, value } = marks[markIndex]!;
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
    if (opacity < 1)
      for (let index = firstNode; index < nodes.length; index += 1)
        nodes[index] = { ...nodes[index]!, opacity };
    if (unit.axis && (axisPerUnit || index === subsets.length - 1)) {
      const first = marks[0];
      if (first) {
        const bins = binsFor(first.position, subset);
        nodes.push(
          ...axisNodes(unit, subset.key, first.position, bins, frame)
        );
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
        height:
          labelHeight +
          unit.frame.height +
          (unit.axis && (axisPerUnit || index === subsets.length - 1)
            ? axisHeight
            : 0),
      },
      frame,
      rowCount: subset.allIds.length,
      liveCount: subset.liveIds.length,
      allIds: subset.allIds,
      liveIds: subset.liveIds,
      position: marks[0] && {
        scale: marks[0].position,
        bins: binsFor(marks[0].position, subset),
      },
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

/** Splits rows by the repeat field, in the rule's order, up to its limit. */
export function repeatSubsets(
  unit: UnitElement,
  data: CompositionData
): Subset[] {
  const field = unit.repeat.field;
  if (!field)
    return [{ key: "all", label: "", allIds: data.allIds, liveIds: data.liveIds }];
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
  subsets.sort((a, b) =>
    unit.repeat.order === "count"
      ? b.allIds.length - a.allIds.length || compareLabels(a.key, b.key)
      : compareLabels(a.key, b.key)
  );
  return subsets.slice(0, Math.max(1, unit.repeat.limit));
}

const collator = new Intl.Collator("en", { numeric: true });
function compareLabels(a: string, b: string) {
  return collator.compare(a, b);
}

function aggregate(
  mark: MarkDefinition,
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

function timestamp(value: datum) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = dateTimestamp(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

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
      const time = timestamp(value);
      if (time !== undefined) periods.set(Number(id), periodStart(time, interval));
    }
    byInterval.set(interval, periods);
  }
  return periods;
}

export const periodKey = (start: number) => new Date(start).toISOString().slice(0, 10);

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
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
      bins.push({ key: periodKey(start), label: periodLabel(start, scale.interval) });
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
  return scaleLinear<string>()
    .domain([0, 1])
    .range(scale.colors)
    .clamp(true)(0.1 + 0.9 * share);
}

function glyphNodes(
  unit: UnitElement,
  mark: MarkDefinition,
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
