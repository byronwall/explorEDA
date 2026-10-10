import { quantileSorted } from "d3-array";
import { scaleLinear, scaleLog, scaleTime } from "d3-scale";
import { finiteNumber, timestampOf } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";
import {
  findOverride,
  isFocused,
  MUTED_INK,
  MUTED_MARK,
  INK,
  type CompositionDefinition,
  type BandMark,
  type DensityMark,
  type FrameWindow,
  type InsetFrame,
  type InstanceOverride,
  type MarkDefinition,
  type NumericScale,
  type PathMark,
  STACK_COLORS,
  type PointMark,
  type PositionScale,
  type StackMark,
  type WaffleMark,
  type StripMark,
  type SummaryMark,
  type TimeInterval,
  type UnitElement,
  type ValueScale,
} from "./compositionTypes";
import type {
  AreaNode,
  Bounds,
  PathNode,
  SceneNode,
  TextNode,
} from "./resolveComposition";
import { evaluateCalc, type CalcResult } from "./calculations";
import { dodgePositions } from "./labelDodge";
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
  /** The largest repeat total per stack mark, set while a unit resolves. */
  stackMaxTotal?: Map<string, number>;
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
  /** The field holds dates, read as timestamps; ticks format as dates. */
  dates?: boolean;
}

/** A numeric scale's reading of a value: a number, or a date as its timestamp. */
export function readNumber(value: datum): number | undefined {
  return finiteNumber(value) ?? timestampOf(value);
}

/** True when a column's first readable value is a date rather than a number. */
export function isDateColumn(column: Record<number, datum>, ids: number[]) {
  for (const id of ids) {
    const value = column[id];
    if (value === null || value === undefined || value === "") continue;
    if (finiteNumber(value) !== undefined) return false;
    return timestampOf(value) !== undefined;
  }
  return false;
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
  /** The bin has rows but none has a value; the glyph is a missing cell. */
  missing?: boolean;
  /** Numeric coordinates, for point marks. */
  point?: {
    x: number;
    y: number;
    xField: string;
    yField: string;
    /** The series the point belongs to, when the mark splits by a field. */
    series?: string;
    /** The color field's value, when the mark colors by one. */
    category?: string;
  };
  /** The segment's share of its repeat's total, for stack marks; the glyph's value is that share. */
  stack?: {
    count: number;
    total: number;
    /** Cumulative bounds as shares of the total, from the bottom. */
    lower: number;
    upper: number;
    categoryField: string;
    aggregation: "count" | "sum";
    measureField?: string;
    /** Every category in the denominator, with its count. */
    contributors: { category: string; count: number }[];
  };
  /** The cell's place in a waffle; the glyph's value is the rows the cell stands for. */
  waffle?: {
    /** This cell's number within its category, from one. */
    cell: number;
    /** Cells drawn for the category in this repeat. */
    cells: number;
    /** Rows of the category in this repeat, and all rows of the repeat. */
    count: number;
    total: number;
    /** Rows per cell, or the share of the total per cell when normalized. */
    each: number;
    normalize: boolean;
    categoryField: string;
  };
  /** The group's quartiles, for summary marks; the glyph's value is the median. */
  summary?: SummaryStats & {
    groupField: string;
    measureField: string;
    /** The repeat's change in median from its first group to its last. */
    change?: number;
    changeText: string;
  };
}

/** Unweighted quartiles of one group's measure. */
export interface SummaryStats {
  q1: number;
  median: number;
  q3: number;
  count: number;
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
  /** The series this path belongs to, when the mark splits by a field. */
  series?: string;
  /** Whether the path is in the mark's focus, or muted behind it. */
  focused?: boolean;
  /** The value of the mark's color field on the path's first row. */
  category?: string;
}

/** What one band stands for: its bounds, rows in order, and gaps. */
export interface BandDatum {
  instanceKey: string;
  markId: string;
  orderField: string;
  lowerField: string;
  upperField: string;
  rowIds: number[];
  skipped: number[];
  segments: number;
  /** For a stacked area: the category and its share at each x. */
  stack?: {
    category: string;
    categoryField: string;
    aggregation: "count" | "sum";
    measureField?: string;
    /** Every category in the denominators, in stacking order. */
    categories: string[];
    points: { x: number; count: number; total: number; share: number }[];
  };
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
  mark: PointMark | PathMark | BandMark;
  x: NumericScale;
  y: NumericScale;
};
type ResolvedSummary = {
  type: "summary";
  mark: SummaryMark;
  y: NumericScale;
  value?: ValueScale;
};
type ResolvedStack = { type: "stack"; mark: StackMark; x?: NumericScale };
type ResolvedWaffle = { type: "waffle"; mark: WaffleMark };
type ResolvedDensity = { type: "density"; mark: DensityMark; x: NumericScale };
type ResolvedMark =
  | ResolvedStrip
  | ResolvedXy
  | ResolvedSummary
  | ResolvedStack
  | ResolvedWaffle
  | ResolvedDensity;

/** One group of a summary mark in one repeat. */
interface SummaryGroup {
  key: string;
  rowIds: number[];
  stats?: SummaryStats;
}

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
    } else if (mark.type === "stack") {
      const x = mark.xScaleId ? scale(mark.xScaleId) : undefined;
      marks.push({
        type: "stack",
        mark,
        x: x?.kind === "numeric" ? x : undefined,
      });
    } else if (mark.type === "waffle") {
      marks.push({ type: "waffle", mark });
    } else if (mark.type === "density") {
      const x = scale(mark.xScaleId);
      if (x?.kind === "numeric") marks.push({ type: "density", mark, x });
    } else if (mark.type === "summary") {
      const y = scale(mark.yScaleId);
      const value = scale(mark.valueScaleId ?? "");
      if (y?.kind === "numeric")
        marks.push({
          type: "summary",
          mark,
          y,
          value: value?.kind === "value" ? value : undefined,
        });
    } else {
      const x = scale(mark.xScaleId);
      // A point or path without a y scale sits on the frame's middle line.
      const y =
        mark.type !== "band" && mark.yScaleId === undefined
          ? MIDDLE_SCALE
          : scale(mark.yScaleId ?? "");
      if (x?.kind === "numeric" && y?.kind === "numeric")
        marks.push({ type: "xy", mark, x, y });
    }
  }
  const strips = marks.filter(
    (item): item is ResolvedStrip => item.type === "strip"
  );
  const xys = marks.filter((item): item is ResolvedXy => item.type === "xy");
  const summaries = marks.filter(
    (item): item is ResolvedSummary => item.type === "summary"
  );
  const stacks = marks.filter(
    (item): item is ResolvedStack => item.type === "stack"
  );
  const waffles = marks.filter(
    (item): item is ResolvedWaffle => item.type === "waffle"
  );
  // Stacks and waffles share one category order and color across every repeat.
  const stacked = stacks.map(({ mark }) => stackCategories(mark, data));
  const waffled = waffles.map(({ mark }) =>
    stackCategories({ ...mark, aggregation: "count" }, data)
  );
  if (stacks.length) {
    const maxTotals = new Map<string, number>();
    for (const { mark } of stacks) {
      const column = data.column(mark.categoryField);
      const measure = mark.measureField
        ? data.column(mark.measureField)
        : undefined;
      const xColumn = mark.xScaleId
        ? data.column(
            (
              definition.scales.find((item) => item.id === mark.xScaleId) as
                | NumericScale
                | undefined
            )?.field ?? ""
          )
        : undefined;
      const categories = stackCategories(mark, data);
      for (const subset of subsets) {
        // Across x, the largest total at any x, or the whole extent of a
        // wiggling stream; otherwise the repeat's total.
        if (xColumn && mark.baseline === "wiggle" && !mark.normalize) {
          const columns = stackColumns(
            mark,
            subset.liveIds,
            categories,
            xColumn,
            column,
            measure
          );
          const offsets = streamOffsets(columns, categories);
          const extent = Math.max(
            0,
            ...columns.map((item, index) => offsets[index]! + item.total)
          );
          maxTotals.set(mark.id, Math.max(maxTotals.get(mark.id) ?? 0, extent));
          continue;
        }
        const groups = xColumn
          ? groupByCategory(xColumn, subset.liveIds)
          : new Map([["all", subset.liveIds]]);
        for (const ids of groups.values()) {
          let total = 0;
          for (const rowIds of groupByCategory(column, ids).values())
            total += stackValue(mark, rowIds, measure);
          maxTotals.set(mark.id, Math.max(maxTotals.get(mark.id) ?? 0, total));
        }
      }
    }
    data = { ...data, stackMaxTotal: maxTotals };
  }

  // Summaries first: their quartiles set the y domain and the change colors.
  const summarized = subsets.map((subset) =>
    summaries.map(({ mark }) => summarizeGroups(mark, subset, data))
  );
  const changeOf = (groups: SummaryGroup[]) => {
    const first = groups.find((group) => group.stats)?.stats;
    const last = [...groups].reverse().find((group) => group.stats)?.stats;
    if (!first || !last || first === last || first.median === 0)
      return undefined;
    return (last.median - first.median) / first.median;
  };
  const sharedChange = new Map<string, number>();
  summarized.forEach((perMark) =>
    perMark.forEach((groups, markIndex) => {
      const value = summaries[markIndex]!.value;
      const change = changeOf(groups);
      if (value && change !== undefined)
        sharedChange.set(
          value.id,
          Math.max(sharedChange.get(value.id) ?? 0, Math.abs(change))
        );
    })
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
  // A numeric scale spans every field drawn on it: its own, plus the bounds
  // of any band bound to it, so a fan's widest interval stays in the frame.
  const scaleFields = new Map<string, string[]>();
  for (const item of xys) {
    if (item.mark.type !== "band") continue;
    const fields = scaleFields.get(item.y.id) ?? [item.y.field];
    fields.push(item.mark.lowerField, item.mark.upperField);
    scaleFields.set(item.y.id, fields);
  }
  const columnsOf = (scale: NumericScale) =>
    (scaleFields.get(scale.id) ?? [scale.field]).map((field) =>
      data.column(field)
    );
  const dateScales = new Set<string>();
  for (const scale of definition.scales)
    if (
      scale.kind === "numeric" &&
      isDateColumn(data.column(scale.field), data.allIds)
    )
      dateScales.add(scale.id);
  const axisFor = (
    scale: NumericScale,
    subset: Subset,
    range: [number, number],
    window?: FrameWindow
  ) =>
    numericAxis(
      scale,
      domainFor(scale, subset, window),
      range,
      dateScales.has(scale.id)
    );
  // A scale bound to a summary spans the quartiles drawn, not the raw rows.
  const quartileExtent = (scale: NumericScale, subsetIndex?: number) => {
    const values: number[] = [];
    summarized.forEach((perMark, index) => {
      if (subsetIndex !== undefined && index !== subsetIndex) return;
      perMark.forEach((groups, markIndex) => {
        if (summaries[markIndex]!.y.id !== scale.id) return;
        for (const group of groups)
          if (group.stats) values.push(group.stats.q1, group.stats.q3);
      });
    });
    return values;
  };
  const sharedDomains = new Map<string, [number, number]>();
  const windowedDomains = new Map<string, [number, number]>();
  const domainFor = (
    scale: NumericScale,
    subset: Subset,
    window?: FrameWindow
  ): [number, number] => {
    if (scale.id === MIDDLE_SCALE.id) return [0, 1] as [number, number];
    if (window) {
      // A windowed frame spans its window on the window's field, and the
      // rows inside the window on every other field.
      const inside = windowTest(window, data);
      const ids = (
        scale.domain === "instance" ? subset.allIds : data.allIds
      ).filter(inside);
      const key = `${scale.id}|${scale.domain === "instance" ? subset.key : ""}|${window.field}|${window.min ?? ""}|${window.max ?? ""}`;
      let domain = windowedDomains.get(key);
      if (!domain) {
        domain = numericDomain(scale, columnsOf(scale), ids);
        if (scale.field === window.field) {
          const min = window.min?.trim() ? readNumber(window.min) : undefined;
          const max = window.max?.trim() ? readNumber(window.max) : undefined;
          if (min !== undefined) domain[0] = min;
          if (max !== undefined) domain[1] = max;
          if (domain[0] >= domain[1]) domain[1] = domain[0] + 1;
        }
        windowedDomains.set(key, domain);
      }
      return domain;
    }
    const bound = summaries.some((item) => item.y.id === scale.id);
    if (scale.domain === "instance")
      return bound
        ? numericDomainOf(scale, quartileExtent(scale, subsets.indexOf(subset)))
        : numericDomain(scale, columnsOf(scale), subset.allIds);
    let domain = sharedDomains.get(scale.id);
    if (!domain) {
      domain = bound
        ? numericDomainOf(scale, quartileExtent(scale))
        : numericDomain(scale, columnsOf(scale), data.allIds);
      sharedDomains.set(scale.id, domain);
    }
    return domain;
  };

  const densities = marks.filter(
    (item): item is ResolvedDensity => item.type === "density"
  );
  // Densities first: each repeat's curve on the shared grid, and the tallest.
  const densityCurves = subsets.map((subset) =>
    densities.map(({ mark, x }) =>
      densityCurve(mark, x, subset, data, domainFor(x, subset))
    )
  );
  const densityMax = new Map<string, number>();
  densityCurves.forEach((perMark) =>
    perMark.forEach((curve, markIndex) => {
      const id = densities[markIndex]!.mark.id;
      densityMax.set(id, Math.max(densityMax.get(id) ?? 0, curve.peak));
    })
  );
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
        if (value === undefined) {
          // Rows without a value: a missing cell when the mark draws one.
          if (mark.missing)
            glyphs.push({
              instanceKey: subset.key,
              markId: mark.id,
              bin,
              value: 0,
              rowIds,
              missing: true,
            });
          return;
        }
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
        if (!glyph.missing)
          sharedMax.set(
            id,
            Math.max(sharedMax.get(id) ?? 0, Math.abs(glyph.value))
          );
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
  // Tiles read each subset's cell from a field; the unaddressed queue below.
  const tiles =
    unit.repeat.arrangement === "tiles"
      ? tileAddresses(subsets, unit.repeat.tileField, data)
      : undefined;

  const sliceStarts: number[] = [];
  subsets.forEach((subset, index) => {
    sliceStarts[index] = nodes.length;
    const cell = tiles?.get(subset.key) ?? {
      row: Math.floor(index / columns),
      column: index % columns,
    };
    const { column, row } = cell;
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
    const mainInsetIds = new Set((unit.insets ?? []).map((inset) => inset.id));
    const firstXy =
      xys.find(
        (item) => !item.mark.frameId || !mainInsetIds.has(item.mark.frameId)
      ) ?? xys[0];
    const spread = stacks.find((item) => item.x);
    const xy = firstXy
      ? {
          x: axisFor(
            firstXy.x,
            subset,
            [frame.x, frame.x + frame.width],
            unit.window
          ),
          y: axisFor(
            firstXy.y,
            subset,
            [frame.y + frame.height, frame.y],
            unit.window
          ),
        }
      : densities[0]
        ? {
            x: axisFor(
              densities[0].x,
              subset,
              [frame.x, frame.x + frame.width],
              unit.window
            ),
            y: numericAxis(
              DENSITY_SCALE,
              [0, 1],
              [frame.y + frame.height, frame.y]
            ),
          }
        : spread?.x
          ? {
              x: axisFor(spread.x, subset, [frame.x, frame.x + frame.width]),
              // A stacked area's y is the share of each x's total, or the
              // total. A stream's values float off zero, so it has no y ticks.
              y: numericAxis(
                spread.mark.normalize
                  ? SHARE_SCALE
                  : spread.mark.baseline && spread.mark.baseline !== "zero"
                    ? { ...TOTAL_SCALE, ticks: "none" }
                    : TOTAL_SCALE,
                spread.mark.normalize
                  ? [0, 1]
                  : [0, data.stackMaxTotal?.get(spread.mark.id) ?? 1],
                [frame.y + frame.height, frame.y]
              ),
            }
          : undefined;
    const drawAxis = unit.axis && (axisPerUnit || index === subsets.length - 1);
    // Grid lines sit under the marks.
    if (xy && unit.axis)
      nodes.push(...numericGridNodes(unit, subset.key, xy, frame));

    aggregated[index]!.forEach(({ bins, glyphs }, markIndex) => {
      const { mark, value } = strips[markIndex]!;
      const instanceMax =
        value.domain === "instance"
          ? Math.max(
              0,
              ...glyphs.map((glyph) =>
                glyph.missing ? 0 : Math.abs(glyph.value)
              )
            )
          : (sharedMax.get(value.id) ?? 0);
      // An accent recolors this repeat's marks, keeping the template's ramp.
      const accented = override?.accent
        ? {
            mark: { ...mark, fill: override.accent },
            value: {
              ...value,
              colors: [value.colors[0]!, override.accent],
              stops: undefined,
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
    // Each frame draws the marks assigned to it from the rows in its window.
    const drawFrame = (
      frameBounds: Bounds,
      window: FrameWindow | undefined,
      marksHere: ResolvedXy[]
    ) => {
      const inside = window ? windowTest(window, data) : undefined;
      const frameData = inside
        ? { ...data, liveIds: data.liveIds.filter(inside) }
        : data;
      const frameSubset = inside
        ? { ...subset, liveIds: subset.liveIds.filter(inside) }
        : subset;
      for (const item of marksHere) {
        const axes = {
          x: axisFor(
            item.x,
            subset,
            [frameBounds.x, frameBounds.x + frameBounds.width],
            window
          ),
          y: axisFor(
            item.y,
            subset,
            [frameBounds.y + frameBounds.height, frameBounds.y],
            window
          ),
        };
        const accent = override?.accent;
        const drawn =
          item.mark.type === "band"
            ? bandNodes(
                unit,
                accent ? { ...item.mark, fill: accent } : item.mark,
                frameSubset,
                axes,
                frameBounds,
                frameData
              )
            : item.mark.type === "path"
              ? pathNodes(
                  unit,
                  accent ? { ...item.mark, stroke: accent } : item.mark,
                  frameSubset,
                  axes,
                  frameBounds,
                  frameData
                )
              : pointNodes(
                  unit,
                  accent ? { ...item.mark, fill: accent } : item.mark,
                  frameSubset,
                  axes,
                  frameBounds,
                  frameData
                );
        // A windowed frame clips, so a path cut at the window's edge stays inside.
        nodes.push(
          ...(window
            ? drawn.map((node) => ({ ...node, clip: node.clip ?? frameBounds }))
            : drawn)
        );
      }
    };
    drawFrame(
      frame,
      unit.window,
      xys.filter(
        (item) => !item.mark.frameId || !mainInsetIds.has(item.mark.frameId)
      )
    );
    stacks.forEach(({ mark, x }, markIndex) => {
      const accented = override?.accent
        ? { ...mark, colors: [override.accent] }
        : mark;
      nodes.push(
        ...(x && xy
          ? stackAreaNodes(
              unit,
              accented,
              subset,
              stacked[markIndex]!,
              xy,
              frame,
              data
            )
          : stackNodes(
              unit,
              accented,
              subset,
              stacked[markIndex]!,
              frame,
              data
            ))
      );
    });
    waffles.forEach(({ mark }, markIndex) => {
      nodes.push(
        ...waffleNodes(
          unit,
          override?.accent ? { ...mark, colors: [override.accent] } : mark,
          subset,
          waffled[markIndex]!,
          frame,
          data
        )
      );
    });
    densityCurves[index]!.forEach((curve, markIndex) => {
      const { mark, x } = densities[markIndex]!;
      const axis = axisFor(
        x,
        subset,
        [frame.x, frame.x + frame.width],
        unit.window
      );
      const peak =
        mark.height === "instance"
          ? curve.peak
          : (densityMax.get(mark.id) ?? curve.peak);
      nodes.push(
        ...densityNodes(
          unit,
          override?.accent ? { ...mark, fill: override.accent } : mark,
          subset,
          curve,
          axis,
          frame,
          peak
        )
      );
    });
    summarized[index]!.forEach((groups, markIndex) => {
      const { mark, y, value } = summaries[markIndex]!;
      const axis = numericAxis(y, domainFor(y, subset), [
        frame.y + frame.height,
        frame.y,
      ]);
      const change = changeOf(groups);
      const maxChange = value ? (sharedChange.get(value.id) ?? 0) : 0;
      nodes.push(
        ...summaryNodes(
          unit,
          override?.accent ? { ...mark, fill: override.accent } : mark,
          subset,
          groups,
          axis,
          frame,
          value,
          change,
          maxChange
        )
      );
    });
    // Insets sit over the main frame's marks: paper, marks, then an outline.
    for (const inset of unit.insets ?? []) {
      const bounds: Bounds = {
        x: frame.x + inset.x,
        y: frame.y + inset.y,
        width: inset.width,
        height: inset.height,
      };
      nodes.push({
        type: "rect",
        key: `${unit.id}:${subset.key}:${inset.id}:paper`,
        elementId: unit.id,
        instanceKey: subset.key,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        fill: inset.background ?? "#ffffff",
        stroke: "#d4d7dc",
      });
      const insetXy = xys.filter((item) => item.mark.frameId === inset.id);
      if (inset.axis && insetXy[0]) {
        const axisXy = {
          x: axisFor(
            insetXy[0].x,
            subset,
            [bounds.x, bounds.x + bounds.width],
            inset.window
          ),
          y: axisFor(
            insetXy[0].y,
            subset,
            [bounds.y + bounds.height, bounds.y],
            inset.window
          ),
        };
        nodes.push(
          ...numericAxisNodes(
            unit,
            `${subset.key}:${inset.id}`,
            axisXy,
            bounds,
            8
          )
        );
      }
      drawFrame(bounds, inset.window, insetXy);
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
      } else if (stacks[0] && stacks[0].mark.normalize) {
        for (const share of [0, 0.25, 0.5, 0.75, 1])
          nodes.push({
            type: "text",
            key: `${unit.id}:${subset.key}:axis:${share}`,
            elementId: unit.id,
            x: frame.x - 5,
            lines: [
              {
                text: `${Math.round(share * 100)}%`,
                y: frame.y + frame.height * (1 - share) + 3.5,
              },
            ],
            fontSize: 9,
            fontWeight: 400,
            fill: MUTED_INK,
            anchor: "end",
          });
      } else if (summaries[0]) {
        // Group names under the frame, and the minute span beside it, so a
        // per-repeat scale still reads.
        const axis = numericAxis(
          summaries[0].y,
          domainFor(summaries[0].y, subset),
          [frame.y + frame.height, frame.y]
        );
        axis.domain.forEach((value, end) =>
          nodes.push({
            type: "text",
            key: `${unit.id}:${subset.key}:axis:y:${end}`,
            elementId: unit.id,
            x: frame.x - 5,
            lines: [
              {
                text: formatTick(axis, value),
                y: numericPixel(axis, value) + 3.5,
              },
            ],
            fontSize: 9,
            fontWeight: 400,
            fill: MUTED_INK,
            anchor: "end",
          })
        );
        const groups = summarized[index]![0]!;
        const band = frame.width / Math.max(1, groups.length);
        groups.forEach((group, position) =>
          nodes.push({
            type: "text",
            key: `${unit.id}:${subset.key}:axis:${group.key}`,
            elementId: unit.id,
            x: frame.x + (position + 0.5) * band,
            lines: [{ text: group.key, y: frame.y + frame.height + 12 }],
            fontSize: 10,
            fontWeight: 400,
            fill: MUTED_INK,
            anchor: "middle",
          })
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

  // Rows that overlap through a negative gap draw bottom first, so the
  // upper ridge sits in front of the one below it.
  const ordered =
    unit.repeat.gap < 0 && instances.length > 1
      ? instances
          .map((_, index) =>
            nodes.slice(
              sliceStarts[index],
              sliceStarts[index + 1] ?? nodes.length
            )
          )
          .reverse()
          .flat()
      : nodes;
  return { nodes: ordered, bounds: unionBounds(instances, unit), instances };
}

/**
 * Each subset's cell on a tile grid, read as "row,column" from the first row
 * that has one. Subsets without an address fill rows under the grid, so
 * nothing disappears for want of a tile.
 */
function tileAddresses(
  subsets: Subset[],
  field: string | undefined,
  data: CompositionData
): Map<string, { row: number; column: number }> {
  const cells = new Map<string, { row: number; column: number }>();
  const column = field ? data.column(field) : undefined;
  let maxRow = -1;
  let maxColumn = 0;
  const unplaced: Subset[] = [];
  for (const subset of subsets) {
    let placed = false;
    if (column)
      for (const id of subset.allIds) {
        const raw = column[id];
        if (raw === null || raw === undefined || raw === "") continue;
        const parts = String(raw)
          .split(/[,;\s]+/)
          .map(Number);
        if (
          parts.length < 2 ||
          !parts.every(Number.isInteger) ||
          parts.some((part) => part < 0)
        )
          break;
        cells.set(subset.key, { row: parts[0]!, column: parts[1]! });
        maxRow = Math.max(maxRow, parts[0]!);
        maxColumn = Math.max(maxColumn, parts[1]!);
        placed = true;
        break;
      }
    if (!placed) unplaced.push(subset);
  }
  const width = Math.max(1, maxColumn + 1);
  unplaced.forEach((subset, index) => {
    cells.set(subset.key, {
      row: maxRow + 1 + Math.floor(index / width),
      column: index % width,
    });
  });
  return cells;
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

/** A test for rows inside a frame's window, by the window field's value. */
export function windowTest(window: FrameWindow, data: CompositionData) {
  const column = data.column(window.field);
  const min = window.min?.trim() ? readNumber(window.min) : undefined;
  const max = window.max?.trim() ? readNumber(window.max) : undefined;
  return (id: number) => {
    const value = readNumber(column[id]);
    if (value === undefined) return false;
    if (min !== undefined && value < min) return false;
    if (max !== undefined && value > max) return false;
    return true;
  };
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
  const skipped = new Set(
    (unit.repeat.skip ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
  const subsets = [...groups.values()].filter(
    (subset) => !skipped.has(subset.key)
  );
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
  columns: Record<number, datum> | Record<number, datum>[],
  ids: number[]
): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const column of Array.isArray(columns) ? columns : [columns])
    for (const id of ids) {
      const value = readNumber(column[id]);
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
  if (scale.transform === "log" && min <= 0) {
    // Log spacing ignores values at or below zero; they pin to the low end.
    min = Math.min(max, 1);
  }
  if (scale.nice) {
    const nice =
      scale.transform === "log"
        ? scaleLog().domain([min, max]).nice().domain()
        : scaleLinear().domain([min, max]).nice().domain();
    min = nice[0]!;
    max = nice[1]!;
  }
  if (scale.min !== undefined) min = scale.min;
  if (scale.max !== undefined) max = scale.max;
  if (min >= max) max = min + 1;
  return [min, max];
}

/** The extent of given values, after the scale's zero, nice, and limits. */
export function numericDomainOf(
  scale: NumericScale,
  values: number[]
): [number, number] {
  const column: Record<number, datum> = {};
  values.forEach((value, index) => {
    column[index] = value;
  });
  return numericDomain(
    scale,
    column,
    values.map((_, index) => index)
  );
}

/** Groups a repeat's live rows by the cohort field and summarizes each. */
function summarizeGroups(
  mark: SummaryMark,
  subset: Subset,
  data: CompositionData
): SummaryGroup[] {
  const groupColumn = data.column(mark.groupField);
  const measure = data.column(mark.measureField);
  const byKey = new Map<string, number[]>();
  for (const id of subset.liveIds) {
    const raw = groupColumn[id];
    if (raw === null || raw === undefined || raw === "") continue;
    const key = String(raw);
    const list = byKey.get(key);
    if (list) list.push(id);
    else byKey.set(key, [id]);
  }
  return [...byKey.entries()]
    .sort((a, b) => compareLabels(a[0], b[0]))
    .map(([key, rowIds]) => {
      const values = rowIds
        .map((id) => finiteNumber(measure[id]))
        .filter((value): value is number => value !== undefined)
        .sort((a, b) => a - b);
      return {
        key,
        rowIds,
        stats: values.length
          ? {
              q1: quantileSorted(values, 0.25)!,
              median: quantileSorted(values, 0.5)!,
              q3: quantileSorted(values, 0.75)!,
              count: values.length,
            }
          : undefined,
      };
    });
}

const changeFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
  signDisplay: "exceptZero",
});

/**
 * The quartile band joined across the groups, the medians as a path, and a
 * marker per median. Markers take the change color when a value scale is
 * bound; a repeat whose change is undefined, such as a zero prior median,
 * stays neutral rather than taking a false color.
 */
function summaryNodes(
  unit: UnitElement,
  mark: SummaryMark,
  subset: Subset,
  groups: SummaryGroup[],
  axis: NumericAxis,
  frame: Bounds,
  value: ValueScale | undefined,
  change: number | undefined,
  maxChange: number
): SceneNode[] {
  if (!groups.length) return [];
  const band = frame.width / groups.length;
  const changeText =
    change === undefined ? "undefined" : changeFormat.format(change);
  const marker =
    value && change !== undefined
      ? valueColorSigned(value, change, maxChange)
      : value
        ? (value.center ?? MUTED_INK)
        : mark.fill;
  const nodes: SceneNode[] = [];
  const area: AreaNode["segments"][number] = [];
  const path: PathNode["segments"][number] = [];
  groups.forEach((group, index) => {
    if (!group.stats) return;
    const x = frame.x + (index + 0.5) * band;
    area.push({
      x,
      y0: numericPixel(axis, group.stats.q1),
      y1: numericPixel(axis, group.stats.q3),
      rowId: group.rowIds[0]!,
    });
    path.push({
      x,
      y: numericPixel(axis, group.stats.median),
      rowId: group.rowIds[0]!,
    });
  });
  const rowIds = groups.flatMap((group) => group.rowIds);
  if (area.length)
    nodes.push({
      type: "area",
      key: `${unit.id}:${subset.key}:${mark.id}:band`,
      elementId: unit.id,
      instanceKey: subset.key,
      segments: [area],
      fill: mark.fill,
      fillOpacity: mark.opacity,
      band: {
        instanceKey: subset.key,
        markId: mark.id,
        orderField: mark.groupField,
        lowerField: `first quartile of ${mark.measureField}`,
        upperField: `third quartile of ${mark.measureField}`,
        rowIds,
        skipped: [],
        segments: 1,
      },
    });
  if (path.length > 1)
    nodes.push({
      type: "path",
      key: `${unit.id}:${subset.key}:${mark.id}:median`,
      elementId: unit.id,
      instanceKey: subset.key,
      segments: [path],
      stroke: marker,
      strokeWidth: 1.5,
      path: {
        instanceKey: subset.key,
        markId: mark.id,
        orderField: mark.groupField,
        rowIds,
        skipped: [],
        segments: 1,
      },
    });
  groups.forEach((group, index) => {
    if (!group.stats) return;
    nodes.push({
      type: "circle",
      key: `${unit.id}:${subset.key}:${mark.id}:${group.key}`,
      elementId: unit.id,
      instanceKey: subset.key,
      cx: frame.x + (index + 0.5) * band,
      cy: numericPixel(axis, group.stats.median),
      r: 4,
      fill: marker,
      glyph: {
        instanceKey: subset.key,
        markId: mark.id,
        bin: { key: group.key, label: group.key },
        value: group.stats.median,
        rowIds: group.rowIds,
        summary: {
          ...group.stats,
          groupField: mark.groupField,
          measureField: mark.measureField,
          change,
          changeText,
        },
      },
    });
  });
  return nodes;
}

/**
 * A diverging color: negative values run from the center toward the low
 * color, positive toward the high color, by their share of the largest
 * absolute value. Without a center, the scale maps the absolute value.
 */
export function valueColorSigned(
  scale: ValueScale,
  value: number,
  maxAbs: number
) {
  const share = valueShare(scale, Math.abs(value), maxAbs);
  if (!scale.center) return valueColor(scale, share);
  const end =
    value < 0 ? scale.colors[0]! : scale.colors[scale.colors.length - 1]!;
  return scaleLinear<string>()
    .domain([0, 1])
    .range([scale.center, end])
    .clamp(true)(share);
}

/** The categories a stack draws, in its order, with their graphic-wide totals. */
interface StackCategory {
  key: string;
  index: number;
  total: number;
}

function stackValue(
  mark: Pick<StackMark, "aggregation">,
  rowIds: number[],
  measure: Record<number, datum> | undefined
) {
  if (mark.aggregation === "count" || !measure) return rowIds.length;
  let sum = 0;
  for (const id of rowIds) sum += finiteNumber(measure[id]) ?? 0;
  return sum;
}

/** Groups rows by category. */
function groupByCategory(
  column: Record<number, datum>,
  ids: number[]
): Map<string, number[]> {
  const groups = new Map<string, number[]>();
  for (const id of ids) {
    const raw = column[id];
    if (raw === null || raw === undefined || raw === "") continue;
    const key = String(raw);
    const list = groups.get(key);
    if (list) list.push(id);
    else groups.set(key, [id]);
  }
  return groups;
}

/**
 * The category order of a stack, shared by every repeat so colors and
 * positions line up across columns. It reads every row, so filters change
 * shares but never reorder or recolor.
 */
function stackCategories(
  mark: Pick<
    StackMark,
    "categoryField" | "aggregation" | "measureField" | "order"
  >,
  data: CompositionData
): StackCategory[] {
  const column = data.column(mark.categoryField);
  const measure = mark.measureField
    ? data.column(mark.measureField)
    : undefined;
  const groups = groupByCategory(column, data.allIds);
  const categories = [...groups.entries()].map(([key, rowIds]) => ({
    key,
    total: stackValue(mark, rowIds, measure),
  }));
  categories.sort((a, b) =>
    mark.order === "total"
      ? b.total - a.total || compareLabels(a.key, b.key)
      : compareLabels(a.key, b.key)
  );
  return categories.map((category, index) => ({ ...category, index }));
}

const shareFormat = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

/**
 * One column of stacked segments for a repeat. Shares divide each
 * category's value by the repeat's total across every category it has
 * rows for. An empty repeat draws nothing rather than invented shares.
 */
function stackNodes(
  unit: UnitElement,
  mark: StackMark,
  subset: Subset,
  categories: StackCategory[],
  frame: Bounds,
  data: CompositionData
): SceneNode[] {
  const column = data.column(mark.categoryField);
  const measure = mark.measureField
    ? data.column(mark.measureField)
    : undefined;
  const groups = groupByCategory(column, subset.liveIds);
  const counts = categories
    .map((category) => ({
      category,
      rowIds: groups.get(category.key) ?? [],
      count: stackValue(mark, groups.get(category.key) ?? [], measure),
    }))
    .filter((item) => item.rowIds.length > 0);
  const total = counts.reduce((sum, item) => sum + item.count, 0);
  if (!total) return [];
  const contributors = counts.map((item) => ({
    category: item.category.key,
    count: item.count,
  }));
  // Normalized columns fill the frame; otherwise height follows the total
  // against the largest total across the repeats.
  const columnHeight = mark.normalize
    ? frame.height
    : frame.height * (total / (data.stackMaxTotal?.get(mark.id) ?? total));
  const nodes: SceneNode[] = [];
  let lower = 0;
  for (const item of counts) {
    const share = item.count / total;
    const upper = lower + share;
    const top = frame.y + frame.height - upper * columnHeight;
    const height = Math.max(0, share * columnHeight - mark.inset);
    const fill = mark.colors[item.category.index % mark.colors.length]!;
    const key = `${unit.id}:${subset.key}:${mark.id}:${item.category.key}`;
    const glyph: GlyphDatum = {
      instanceKey: subset.key,
      markId: mark.id,
      bin: { key: item.category.key, label: item.category.key },
      value: share,
      rowIds: item.rowIds,
      stack: {
        count: item.count,
        total,
        lower,
        upper,
        categoryField: mark.categoryField,
        aggregation: mark.aggregation,
        measureField: mark.measureField,
        contributors,
      },
    };
    nodes.push({
      type: "rect",
      key,
      elementId: unit.id,
      instanceKey: subset.key,
      x: frame.x,
      y: top + mark.inset / 2,
      width: frame.width,
      height,
      fill,
      glyph,
    });
    if (height >= mark.labelMinHeight)
      nodes.push({
        type: "text",
        key: `${key}:label`,
        elementId: unit.id,
        instanceKey: subset.key,
        x: frame.x + 5,
        lines: [
          {
            text: `${item.category.key} ${shareFormat.format(share)}`,
            y: top + mark.inset / 2 + height / 2 + 3.5,
          },
        ],
        fontSize: 10,
        fontWeight: 600,
        fill: INK,
        anchor: "start",
        halo: "#ffffff",
      });
    lower = upper;
  }
  return nodes;
}

/**
 * The cells of one repeat's waffle. Each category takes a whole number of
 * cells: one per row, one per `each` rows rounded, or its share of a
 * hundred by largest remainder. Cells run along rows of `columns` from
 * the chosen corner, category after category in the shared order.
 */
function waffleNodes(
  unit: UnitElement,
  mark: WaffleMark,
  subset: Subset,
  categories: StackCategory[],
  frame: Bounds,
  data: CompositionData
): SceneNode[] {
  const groups = groupByCategory(
    data.column(mark.categoryField),
    subset.liveIds
  );
  const present = categories
    .map((category) => ({ category, rowIds: groups.get(category.key) ?? [] }))
    .filter((item) => item.rowIds.length > 0);
  const total = present.reduce((sum, item) => sum + item.rowIds.length, 0);
  if (!total) return [];
  const each = Math.max(1, Math.round(mark.each));
  let cellCounts: number[];
  if (mark.normalize) {
    // Largest remainder keeps the hundred exact.
    const exact = present.map((item) => (item.rowIds.length / total) * 100);
    cellCounts = exact.map(Math.floor);
    let left = 100 - cellCounts.reduce((sum, value) => sum + value, 0);
    const byRemainder = exact
      .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
      .sort((a, b) => b.remainder - a.remainder);
    for (const item of byRemainder) {
      if (left <= 0) break;
      cellCounts[item.index]! += 1;
      left -= 1;
    }
  } else {
    cellCounts = present.map((item) =>
      Math.max(1, Math.round(item.rowIds.length / each))
    );
  }
  const columns = Math.max(1, Math.round(mark.columns));
  const side = Math.max(
    0.5,
    (frame.width - mark.gap * (columns - 1)) / columns
  );
  const step = side + mark.gap;
  const nodes: SceneNode[] = [];
  let index = 0;
  present.forEach((item, categoryIndex) => {
    const cells = cellCounts[categoryIndex]!;
    const fill = mark.colors[item.category.index % mark.colors.length]!;
    const perCell = item.rowIds.length / cells;
    for (let cell = 0; cell < cells; cell += 1) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const y =
        mark.from === "bottom"
          ? frame.y + frame.height - side - row * step
          : frame.y + row * step;
      const rowIds = item.rowIds.slice(
        Math.floor(cell * perCell),
        Math.max(
          Math.floor(cell * perCell) + 1,
          Math.floor((cell + 1) * perCell)
        )
      );
      nodes.push({
        type: "rect",
        key: `${unit.id}:${subset.key}:${mark.id}:${item.category.key}:${cell}`,
        elementId: unit.id,
        instanceKey: subset.key,
        x: frame.x + column * step,
        y,
        width: side,
        height: side,
        fill,
        glyph: {
          instanceKey: subset.key,
          markId: mark.id,
          bin: { key: item.category.key, label: item.category.key },
          value: mark.normalize ? perCell : each,
          rowIds,
          waffle: {
            cell: cell + 1,
            cells,
            count: item.rowIds.length,
            total,
            each: mark.normalize ? 1 / 100 : each,
            normalize: mark.normalize,
            categoryField: mark.categoryField,
          },
        },
      });
      index += 1;
    }
  });
  return nodes;
}

/** The stand-in y scale of a density: no ticks, the frame's height is the peak. */
const DENSITY_SCALE: NumericScale = {
  id: "density-height",
  kind: "numeric",
  name: "Density",
  field: "",
  domain: "shared",
  zero: true,
  nice: false,
};

interface DensityCurve {
  /** Sample positions along the field, shared by every repeat. */
  xs: number[];
  /** Density at each sample. */
  ys: number[];
  peak: number;
  rowIds: number[];
  bandwidth: number;
}

/**
 * A Gaussian kernel density of the repeat's live values on a fixed grid
 * across the scale's domain, so repeats line up. The bandwidth defaults to
 * the domain's span over twelve.
 */
function densityCurve(
  mark: DensityMark,
  scale: NumericScale,
  subset: Subset,
  data: CompositionData,
  domain: [number, number]
): DensityCurve {
  const column = data.column(scale.field);
  const values: number[] = [];
  const rowIds: number[] = [];
  for (const id of subset.liveIds) {
    const value = readNumber(column[id]);
    if (value === undefined) continue;
    values.push(value);
    rowIds.push(id);
  }
  const samples = 96;
  const [lo, hi] = domain;
  const bandwidth = mark.bandwidth ?? Math.max((hi - lo) / 12, 1e-9);
  const xs = Array.from(
    { length: samples },
    (_, index) => lo + ((hi - lo) * index) / (samples - 1)
  );
  const ys = xs.map((x) => {
    if (!values.length) return 0;
    let total = 0;
    for (const value of values) {
      const z = (x - value) / bandwidth;
      total += Math.exp(-0.5 * z * z);
    }
    return total / (values.length * bandwidth * Math.sqrt(2 * Math.PI));
  });
  return { xs, ys, peak: Math.max(0, ...ys), rowIds, bandwidth };
}

/** The density as an area from the baseline, with its crest outlined. */
function densityNodes(
  unit: UnitElement,
  mark: DensityMark,
  subset: Subset,
  curve: DensityCurve,
  axis: NumericAxis,
  frame: Bounds,
  peak: number
): SceneNode[] {
  if (!curve.rowIds.length || peak <= 0) return [];
  const baseline = frame.y + frame.height;
  const run = curve.xs.map((x, index) => ({
    x: numericPixel(axis, x),
    y0: baseline,
    y1: baseline - (curve.ys[index]! / peak) * frame.height,
    rowId: curve.rowIds[0]!,
  }));
  return [
    {
      type: "area",
      key: `${unit.id}:${subset.key}:${mark.id}`,
      elementId: unit.id,
      instanceKey: subset.key,
      segments: [run],
      fill: mark.fill,
      fillOpacity: mark.opacity,
      stroke: mark.stroke,
      band: {
        instanceKey: subset.key,
        markId: mark.id,
        orderField: axis.scale.field,
        lowerField: "baseline",
        upperField: `density of ${axis.scale.field} (bandwidth ${formatOrder(curve.bandwidth)})`,
        rowIds: curve.rowIds,
        skipped: [],
        segments: 1,
      },
    },
  ];
}

const orderFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
const formatOrder = (value: number) => orderFormat.format(value);

/** The stand-in y scale of a dot row: every point at the middle line. */
export const MIDDLE_SCALE: NumericScale = {
  id: "middle-line",
  kind: "numeric",
  name: "Middle",
  field: "",
  domain: "shared",
  zero: false,
  nice: false,
};

/** Reads a row's y for an axis: the middle line, or the field's value. */
function readY(axis: NumericAxis, column: Record<number, datum>, id: number) {
  return axis.scale.id === MIDDLE_SCALE.id ? 0.5 : readNumber(column[id]);
}

/** Stand-in scales for a stacked area's y axis: shares, or totals. */
const SHARE_SCALE: NumericScale = {
  id: "stack-share",
  kind: "numeric",
  name: "Share",
  field: "share",
  domain: "shared",
  zero: true,
  nice: false,
};
const TOTAL_SCALE: NumericScale = {
  id: "stack-total",
  kind: "numeric",
  name: "Total",
  field: "total",
  domain: "shared",
  zero: true,
  nice: false,
};

/**
 * A stack spread across x: rows group by their x value, categories stack
 * at each x, and each category draws as one area from x to x in stacking
 * order. An x whose total is zero leaves a gap rather than invented shares.
 */
interface StackColumn {
  x: number;
  total: number;
  counts: Map<string, { count: number; rowIds: number[] }>;
}

/** The rows of a spread stack grouped at each x, in x order, with each category's value. */
function stackColumns(
  mark: Pick<StackMark, "aggregation">,
  ids: number[],
  categories: StackCategory[],
  xColumn: Record<number, datum>,
  categoryColumn: Record<number, datum>,
  measure: Record<number, datum> | undefined
): StackColumn[] {
  const byX = new Map<number, number[]>();
  for (const id of ids) {
    const x = readNumber(xColumn[id]);
    if (x === undefined) continue;
    const list = byX.get(x);
    if (list) list.push(id);
    else byX.set(x, [id]);
  }
  const xs = [...byX.keys()].sort((a, b) => a - b);
  return xs.map((x) => {
    const groups = groupByCategory(categoryColumn, byX.get(x)!);
    const counts = new Map<string, { count: number; rowIds: number[] }>();
    let total = 0;
    for (const category of categories) {
      const rowIds = groups.get(category.key);
      if (!rowIds) continue;
      const count = stackValue(mark, rowIds, measure);
      counts.set(category.key, { count, rowIds });
      total += count;
    }
    return { x, total, counts };
  });
}

/**
 * The wiggle baseline of a streamgraph: at each step the baseline moves so
 * the layers' weighted slopes sum to zero, after Byron and Wattenberg, then
 * the whole stream shifts so its lowest point rests on zero.
 */
export function streamOffsets(
  columns: StackColumn[],
  categories: StackCategory[]
): number[] {
  const height = (column: StackColumn, key: string) =>
    column.counts.get(key)?.count ?? 0;
  const offsets: number[] = [];
  let y = 0;
  for (let j = 0; j < columns.length; j += 1) {
    if (j > 0) {
      const previous = columns[j - 1]!;
      const current = columns[j]!;
      let s1 = 0;
      let s2 = 0;
      categories.forEach((category, i) => {
        const own = height(current, category.key);
        let s3 = (own - height(previous, category.key)) / 2;
        for (let k = 0; k < i; k += 1) {
          const key = categories[k]!.key;
          s3 += height(current, key) - height(previous, key);
        }
        s1 += own;
        s2 += s3 * own;
      });
      if (s1) y -= s2 / s1;
    }
    offsets.push(y);
  }
  const low = Math.min(0, ...offsets);
  return offsets.map((offset) => offset - low);
}

function stackAreaNodes(
  unit: UnitElement,
  mark: StackMark,
  subset: Subset,
  categories: StackCategory[],
  xy: { x: NumericAxis; y: NumericAxis },
  frame: Bounds,
  data: CompositionData
): SceneNode[] {
  const columns = stackColumns(
    mark,
    subset.liveIds,
    categories,
    data.column(xy.x.scale.field),
    data.column(mark.categoryField),
    mark.measureField ? data.column(mark.measureField) : undefined
  );
  // Where each column rests: on zero, centered on the tallest total, or on
  // the wiggle baseline. Normalized stacks always fill from zero.
  const baseline = mark.normalize ? "zero" : (mark.baseline ?? "zero");
  const offsets =
    baseline === "wiggle"
      ? streamOffsets(columns, categories)
      : columns.map((column) =>
          baseline === "center"
            ? ((data.stackMaxTotal?.get(mark.id) ?? column.total) -
                column.total) /
              2
            : 0
        );
  const nodes: SceneNode[] = [];
  const labels: TextNode[] = [];
  const names = categories.map((category) => category.key);
  for (const category of categories) {
    const segments: AreaNode["segments"] = [];
    let run: AreaNode["segments"][number] = [];
    const points: NonNullable<BandDatum["stack"]>["points"] = [];
    const rowIds: number[] = [];
    let best: { x: number; height: number; y: number } | undefined;
    columns.forEach((column, columnIndex) => {
      if (!column.total) {
        if (run.length) segments.push(run);
        run = [];
        return;
      }
      const offset = offsets[columnIndex]!;
      // Cumulative share below this category at this x.
      let below = 0;
      for (const other of categories) {
        if (other.index >= category.index) break;
        below += (column.counts.get(other.key)?.count ?? 0) / column.total;
      }
      const own = column.counts.get(category.key);
      const share = (own?.count ?? 0) / column.total;
      const scale = mark.normalize ? 1 : column.total;
      const y0 = numericPixel(xy.y, offset + below * scale);
      const y1 = numericPixel(xy.y, offset + (below + share) * scale);
      const px = numericPixel(xy.x, column.x);
      run.push({ x: px, y0, y1, rowId: own?.rowIds[0] ?? -1 });
      if (own) {
        rowIds.push(...own.rowIds);
        points.push({
          x: column.x,
          count: own.count,
          total: column.total,
          share,
        });
        const height = y0 - y1;
        if (!best || height > best.height)
          best = { x: px, height, y: (y0 + y1) / 2 };
      }
    });
    if (run.length) segments.push(run);
    if (!points.length) continue;
    const fill = mark.colors[category.index % mark.colors.length]!;
    nodes.push({
      type: "area",
      key: `${unit.id}:${subset.key}:${mark.id}:${category.key}`,
      elementId: unit.id,
      instanceKey: subset.key,
      segments,
      fill,
      fillOpacity: 1,
      curve: mark.curve === "smooth" ? "smooth" : undefined,
      band: {
        instanceKey: subset.key,
        markId: mark.id,
        orderField: xy.x.scale.field,
        lowerField: `share below ${category.key}`,
        upperField: category.key,
        rowIds,
        skipped: [],
        segments: segments.length,
        stack: {
          category: category.key,
          categoryField: mark.categoryField,
          aggregation: mark.aggregation,
          measureField: mark.measureField,
          categories: names,
          points,
        },
      },
    });
    // The label sits where the band is thickest, if it has the room.
    if (best && best.height >= mark.labelMinHeight)
      labels.push({
        type: "text",
        key: `${unit.id}:${subset.key}:${mark.id}:${category.key}:label`,
        elementId: unit.id,
        instanceKey: subset.key,
        x: Math.min(Math.max(best.x, frame.x + 4), frame.x + frame.width - 4),
        lines: [{ text: category.key, y: best.y + 3.5 }],
        fontSize: 10,
        fontWeight: 600,
        fill: INK,
        // Labels near an edge hang inward so they stay inside the frame.
        anchor:
          best.x > frame.x + frame.width * 0.8
            ? "end"
            : best.x < frame.x + frame.width * 0.2
              ? "start"
              : "middle",
        halo: "#ffffff",
      });
  }
  // Labels that hang from the same edge spread apart so none overlap.
  for (const anchor of ["start", "middle", "end"] as const) {
    const group = labels.filter((label) => label.anchor === anchor);
    if (anchor === "middle") {
      nodes.push(...group);
      continue;
    }
    const placed = dodgePositions(
      group.map((label) => label.lines[0]!.y),
      12,
      [frame.y + 8, frame.y + frame.height]
    );
    group.forEach((label, index) =>
      nodes.push({
        ...label,
        lines: [{ ...label.lines[0]!, y: placed[index]! }],
      })
    );
  }
  return nodes;
}

function numericAxis(
  scale: NumericScale,
  domain: [number, number],
  range: [number, number],
  dates = false
): NumericAxis {
  return { scale, domain, range, dates };
}

/** Maps a value along a numeric axis, in artboard pixels. */
export function numericPixel(axis: NumericAxis, value: number) {
  const [d0, d1] = axis.domain;
  const [r0, r1] = axis.range;
  if (axis.scale.transform === "log") {
    // Log spacing needs positive bounds; a value at or below zero pins to the low end.
    const lo = Math.log(Math.max(d0, Number.MIN_VALUE));
    const hi = Math.log(Math.max(d1, Number.MIN_VALUE));
    if (value <= 0 || hi === lo) return r0;
    return r0 + ((Math.log(value) - lo) / (hi - lo)) * (r1 - r0);
  }
  return r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

/** True when the axis has a fixed limit, so marks outside it must clip. */
function fixedLimits(axis: NumericAxis) {
  return axis.scale.min !== undefined || axis.scale.max !== undefined;
}

const categoryKey = (value: datum) =>
  value === null || value === undefined || value === ""
    ? MISSING
    : String(value);

/**
 * The categories a mark colors, in label order across every row of the
 * graphic, with their colors: a point mark's color field through its
 * palette, or a stack's categories through its palette. Legends read this.
 */
export function markCategories(
  mark: MarkDefinition,
  data: CompositionData
): { key: string; color: string }[] {
  if ((mark.type === "point" || mark.type === "path") && mark.colorField) {
    const column = data.column(mark.colorField);
    const keys = new Set<string>();
    for (const id of data.allIds) {
      const value = column[id];
      if (value === null || value === undefined || value === "") continue;
      keys.add(String(value));
    }
    const palette = mark.colors?.length ? mark.colors : STACK_COLORS;
    return [...keys]
      .sort(compareLabels)
      .map((key, index) => ({ key, color: palette[index % palette.length]! }));
  }
  if (mark.type === "stack")
    return stackCategories(mark, data).map((category) => ({
      key: category.key,
      color: mark.colors[category.index % mark.colors.length]!,
    }));
  if (mark.type === "waffle")
    return stackCategories({ ...mark, aggregation: "count" }, data).map(
      (category) => ({
        key: category.key,
        color: mark.colors[category.index % mark.colors.length]!,
      })
    );
  return [];
}

/** Splits a repeat's rows by a series field; one group when there is none. */
function seriesGroups(
  ids: number[],
  column: Record<number, datum> | undefined
): { series: string | undefined; ids: number[] }[] {
  if (!column) return [{ series: undefined, ids }];
  const groups = new Map<string, number[]>();
  for (const id of ids) {
    const raw = column[id];
    const key =
      raw === null || raw === undefined || raw === "" ? MISSING : String(raw);
    const list = groups.get(key);
    if (list) list.push(id);
    else groups.set(key, [id]);
  }
  return [...groups.entries()]
    .sort((a, b) => compareLabels(a[0], b[0]))
    .map(([series, list]) => ({ series, ids: list }));
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
  const order = data.column(mark.orderField);
  const clip = fixedLimits(axes.x) || fixedLimits(axes.y) ? frame : undefined;
  const groups = seriesGroups(
    mark.population === "composition" ? data.liveIds : subset.liveIds,
    mark.seriesField ? data.column(mark.seriesField) : undefined
  );
  const colorColumn = mark.colorField
    ? data.column(mark.colorField)
    : undefined;
  const categoryColors = new Map(
    markCategories(mark, data).map((item) => [item.key, item.color])
  );
  const nodes: PathNode[] = [];
  const ends: EndLabel[] = [];
  for (const group of groups) {
    const rows = orderedRows(group.ids, order);
    const segments: PathNode["segments"] = [];
    let current: PathNode["segments"][number] = [];
    const skipped: number[] = [];
    for (const row of rows) {
      const x = readNumber(xs[row.id]);
      const y = readY(axes.y, ys, row.id);
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
    if (!segments.length) continue;
    const focused = isFocused(mark.focus, group.series, subset.key);
    const first = segments[0]![0]!;
    const category = colorColumn
      ? categoryKey(colorColumn[first.rowId])
      : undefined;
    const stroke = !focused
      ? (mark.mutedStroke ?? MUTED_MARK)
      : category !== undefined
        ? (categoryColors.get(category) ?? mark.stroke)
        : mark.stroke;
    const key =
      group.series === undefined
        ? `${unit.id}:${subset.key}:${mark.id}`
        : `${unit.id}:${subset.key}:${mark.id}:${group.series}`;
    nodes.push({
      type: "path",
      key,
      elementId: unit.id,
      instanceKey: subset.key,
      segments,
      stroke,
      strokeWidth: focused
        ? mark.strokeWidth
        : Math.max(0.75, mark.strokeWidth * 0.75),
      curve: mark.curve === "smooth" ? "smooth" : undefined,
      clip,
      path: {
        instanceKey: subset.key,
        markId: mark.id,
        orderField: mark.orderField,
        rowIds: rows.map((row) => row.id),
        skipped,
        segments: segments.length,
        series: group.series,
        focused,
        category,
      },
    });
    // End labels name the series, or the repeat when there is none, or
    // the unit itself when it is not repeated.
    const labels = mark.labels ?? "none";
    if (labels === "none") continue;
    const name = group.series ?? (subset.label || unit.name);
    const value = (vertex: { rowId: number }) => {
      if (!mark.labelValue) return "";
      const y = readY(axes.y, ys, vertex.rowId);
      return y === undefined ? "" : tickFormat.format(y);
    };
    const lastRun = segments[segments.length - 1]!;
    const last = lastRun[lastRun.length - 1]!;
    if (labels === "start" || labels === "both")
      ends.push({
        key: `${key}:label:start`,
        side: "start",
        x: first.x - 6,
        y: first.y,
        text: [value(first), name].filter(Boolean).join("  "),
        focused,
      });
    if (labels === "end" || labels === "both")
      ends.push({
        key: `${key}:label:end`,
        side: "end",
        x: last.x + 6,
        y: last.y,
        text: [value(last), name].filter(Boolean).join("  "),
        focused,
      });
  }
  // Focused series draw last, so they sit over the muted ones.
  return [
    ...nodes.filter((node) => !node.path.focused),
    ...nodes.filter((node) => node.path.focused),
    ...endLabelNodes(unit, subset, ends, frame),
  ];
}

interface EndLabel {
  key: string;
  side: "start" | "end";
  x: number;
  y: number;
  text: string;
  focused: boolean;
}

/**
 * Lays each side's end labels out so none overlap: they keep their order
 * down the frame and move the least that separates them, overflowing the
 * frame when the stack is taller than it.
 */
function endLabelNodes(
  unit: UnitElement,
  subset: Subset,
  ends: EndLabel[],
  frame: Bounds
): SceneNode[] {
  const fontSize = 10;
  const spacing = Math.round(fontSize * 1.15);
  const nodes: SceneNode[] = [];
  for (const side of ["start", "end"] as const) {
    const labels = ends.filter((label) => label.side === side);
    if (!labels.length) continue;
    const placed = dodgePositions(
      labels.map((label) => label.y),
      spacing,
      [frame.y + fontSize / 2, frame.y + frame.height]
    );
    labels.forEach((label, index) =>
      nodes.push({
        type: "text",
        key: label.key,
        elementId: unit.id,
        instanceKey: subset.key,
        x: label.x,
        lines: [{ text: label.text, y: placed[index]! + fontSize * 0.35 }],
        fontSize,
        fontWeight: 400,
        fill: label.focused ? INK : MUTED_INK,
        anchor: side === "start" ? "end" : "start",
      })
    );
  }
  return nodes;
}

function bandNodes(
  unit: UnitElement,
  mark: BandMark,
  subset: Subset,
  axes: { x: NumericAxis; y: NumericAxis },
  frame: Bounds,
  data: CompositionData
): SceneNode[] {
  const xs = data.column(axes.x.scale.field);
  const lowers = data.column(mark.lowerField);
  const uppers = data.column(mark.upperField);
  const rows = orderedRows(subset.liveIds, data.column(mark.orderField));
  const segments: AreaNode["segments"] = [];
  let current: AreaNode["segments"][number] = [];
  const skipped: number[] = [];
  for (const row of rows) {
    const x = readNumber(xs[row.id]);
    const lower = finiteNumber(lowers[row.id]);
    const upper = finiteNumber(uppers[row.id]);
    if (
      row.order === undefined ||
      x === undefined ||
      lower === undefined ||
      upper === undefined
    ) {
      skipped.push(row.id);
      if (current.length) segments.push(current);
      current = [];
      continue;
    }
    current.push({
      x: numericPixel(axes.x, x),
      y0: numericPixel(axes.y, Math.min(lower, upper)),
      y1: numericPixel(axes.y, Math.max(lower, upper)),
      rowId: row.id,
    });
  }
  if (current.length) segments.push(current);
  if (!segments.length) return [];
  const clip = fixedLimits(axes.x) || fixedLimits(axes.y) ? frame : undefined;
  return [
    {
      type: "area",
      key: `${unit.id}:${subset.key}:${mark.id}`,
      elementId: unit.id,
      instanceKey: subset.key,
      segments,
      fill: mark.fill,
      fillOpacity: mark.opacity,
      clip,
      band: {
        instanceKey: subset.key,
        markId: mark.id,
        orderField: mark.orderField,
        lowerField: mark.lowerField,
        upperField: mark.upperField,
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
  const order = mark.orderField ? data.column(mark.orderField) : undefined;
  const colorColumn = mark.colorField
    ? data.column(mark.colorField)
    : undefined;
  const sizes = mark.sizeField ? data.column(mark.sizeField) : undefined;
  // The largest size across the graphic takes the full radius; area scales.
  let sizeMax = 0;
  if (sizes)
    for (const id of data.allIds)
      sizeMax = Math.max(sizeMax, finiteNumber(sizes[id]) ?? 0);
  const radiusOf = (id: number) => {
    if (!sizes || sizeMax <= 0) return mark.radius;
    const value = finiteNumber(sizes[id]) ?? 0;
    return Math.max(1, mark.radius * Math.sqrt(Math.max(0, value) / sizeMax));
  };
  const wanted = mark.labelValues
    ? new Set(
        mark.labelValues
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean)
      )
    : undefined;
  const categoryColors = new Map(
    markCategories(mark, data).map((item) => [item.key, item.color])
  );
  const clip = fixedLimits(axes.x) || fixedLimits(axes.y) ? frame : undefined;
  const nodes: SceneNode[] = [];
  let drawn = 0;
  // `show` picks within each series, so every country keeps its last point.
  const groups = seriesGroups(
    mark.population === "composition" ? data.liveIds : subset.liveIds,
    mark.seriesField ? data.column(mark.seriesField) : undefined
  );
  const shown = groups.flatMap((group) =>
    pickShown(
      orderedRows(group.ids, order),
      mark.show ?? "all",
      xs,
      ys,
      axes.y.scale.id === MIDDLE_SCALE.id
    ).map((row) => ({ row, series: group.series }))
  );
  // Focused points draw last, over the muted ones.
  shown.sort(
    (a, b) =>
      Number(isFocused(mark.focus, a.series, subset.key)) -
      Number(isFocused(mark.focus, b.series, subset.key))
  );
  for (const { row, series } of shown) {
    const focused = isFocused(mark.focus, series, subset.key);
    const x = readNumber(xs[row.id]);
    const y = readY(axes.y, ys, row.id);
    if (x === undefined || y === undefined) continue;
    const cx = numericPixel(axes.x, x);
    const cy = numericPixel(axes.y, y);
    const key = `${unit.id}:${subset.key}:${mark.id}:${row.id}`;
    const middle = axes.y.scale.id === MIDDLE_SCALE.id;
    const category = colorColumn ? categoryKey(colorColumn[row.id]) : undefined;
    const glyph: GlyphDatum = {
      instanceKey: subset.key,
      markId: mark.id,
      bin: { key: row.label, label: row.label },
      value: middle ? x : y,
      rowIds: [row.id],
      point: {
        x,
        y: middle ? x : y,
        xField: axes.x.scale.field,
        yField: middle ? axes.x.scale.field : axes.y.scale.field,
        series,
        category,
      },
    };
    const fill = !focused
      ? (mark.mutedFill ?? MUTED_MARK)
      : category !== undefined
        ? (categoryColors.get(category) ?? mark.fill)
        : mark.fill;
    nodes.push({
      type: "circle",
      key,
      elementId: unit.id,
      instanceKey: subset.key,
      cx,
      cy,
      r: radiusOf(row.id),
      fill,
      clip,
      glyph,
    });
    // Labels follow focused points only, so a muted field stays quiet.
    if (
      labels &&
      focused &&
      mark.labelEvery > 0 &&
      drawn % mark.labelEvery === 0
    ) {
      const raw = labels[row.id];
      const text = raw === null || raw === undefined ? "" : String(raw).trim();
      // Listed values label; everything else stays quiet.
      if (text && (!wanted || wanted.has(text.toLowerCase())))
        nodes.push({
          type: "text",
          key: `${key}:label`,
          elementId: unit.id,
          instanceKey: subset.key,
          x: cx + radiusOf(row.id) + 3,
          lines: [{ text, y: cy - radiusOf(row.id) - 1 }],
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
  ys: Record<number, datum>,
  middle = false
) {
  const drawable = rows.filter(
    (row) =>
      readNumber(xs[row.id]) !== undefined &&
      (middle || readNumber(ys[row.id]) !== undefined)
  );
  if (show === "all" || !drawable.length) return drawable;
  if (show === "first") return [drawable[0]!];
  if (show === "last") return [drawable[drawable.length - 1]!];
  let picked = drawable[0]!;
  for (const row of drawable) {
    // On a dot row, low and high read along x instead.
    const y = (middle ? readNumber(xs[row.id]) : readNumber(ys[row.id]))!;
    const best = (
      middle ? readNumber(xs[picked.id]) : readNumber(ys[picked.id])
    )!;
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
  if (xy.y.scale.id === MIDDLE_SCALE.id || xy.y.scale.id === DENSITY_SCALE.id)
    return [];
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
  if (axis.scale.ticks === "none") return [];
  if (axis.scale.ticks === "ends")
    return axis.domain[0] === axis.domain[1]
      ? [axis.domain[0]]
      : [axis.domain[0], axis.domain[1]];
  const count = Math.max(2, Math.floor(length / spacing));
  if (axis.dates)
    return scaleTime()
      .domain(axis.domain.map((value) => new Date(value)))
      .ticks(count)
      .map((date) => date.getTime());
  if (axis.scale.transform === "log") {
    // Across more than a decade and a half keep the 1, 2, 5 steps; across
    // more than three decades keep only the powers of ten.
    const decades = Math.log10(
      Math.max(axis.domain[1], 1) / Math.max(axis.domain[0], Number.MIN_VALUE)
    );
    const keep = decades > 3 ? [1] : decades > 1.5 ? [1, 2, 5] : undefined;
    return scaleLog()
      .domain(axis.domain)
      .ticks(count)
      .filter((value) => {
        if (!keep) return true;
        const mantissa = value / 10 ** Math.floor(Math.log10(value));
        return keep.includes(Math.round(mantissa * 100) / 100);
      });
  }
  return scaleLinear().domain(axis.domain).ticks(count);
}

const yearFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  timeZone: "UTC",
});
const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const dayFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** A date tick: the year across years, the month within a few, else the day. */
function formatDateTick(axis: NumericAxis, value: number) {
  const span = axis.domain[1] - axis.domain[0];
  const year = 365.25 * 86_400_000;
  if (span > 4 * year) return yearFormat.format(new Date(value));
  if (span > 90 * 86_400_000) return monthFormat.format(new Date(value));
  return dayFormat.format(new Date(value));
}

const tickFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const plainTickFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  useGrouping: false,
});

/** Years read as "2016", not "2,016"; other numbers keep their separators. */
function formatTick(axis: NumericAxis, value: number) {
  if (axis.scale.id === SHARE_SCALE.id) return `${Math.round(value * 100)}%`;
  if (axis.dates) return formatDateTick(axis, value);
  return /year|\byr\b/i.test(axis.scale.field) || /year/i.test(axis.scale.name)
    ? plainTickFormat.format(value)
    : tickFormat.format(value);
}

/** Tick labels under and beside a numeric frame. */
function numericAxisNodes(
  unit: UnitElement,
  instanceKey: string,
  xy: { x: NumericAxis; y: NumericAxis },
  frame: Bounds,
  fontSize = 10
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
    fontSize,
    fontWeight: 400,
    fill: MUTED_INK,
    anchor,
  });
  const nodes = tickValues(xy.x, frame.width, 72).map((value) =>
    label(
      formatTick(xy.x, value),
      numericPixel(xy.x, value),
      frame.y + frame.height + 14,
      "middle",
      `x:${value}`
    )
  );
  // A dot row has no y to label, and a density's height is relative.
  if (xy.y.scale.id === MIDDLE_SCALE.id || xy.y.scale.id === DENSITY_SCALE.id)
    return nodes;
  for (const value of tickValues(xy.y, frame.height, 36))
    nodes.push(
      label(
        formatTick(xy.y, value),
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
  const stops =
    scale.stops && scale.stops.length === scale.colors.length
      ? scale.stops
      : scale.colors.map((_, index) =>
          scale.colors.length > 1 ? index / (scale.colors.length - 1) : 0
        );
  // Even the smallest value stays visible against the paper on a plain ramp;
  // a placed multistop ramp maps shares exactly.
  const position = scale.stops ? share : 0.1 + 0.9 * share;
  return scaleLinear<string>().domain(stops).range(scale.colors).clamp(true)(
    position
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
    // A diverging scale reads the sign; other scales read the magnitude.
    const share = glyph.missing
      ? 0
      : valueShare(scale, Math.abs(glyph.value), max);
    const left = frame.x + position * band;
    const fill = glyph.missing
      ? (mark.missing ?? mark.fill)
      : mark.encoding === "color"
        ? scale.center
          ? valueColorSigned(scale, glyph.value, max)
          : valueColor(scale, share)
        : mark.fill;
    // A missing cell draws as a full, neutral cell whatever the encoding.
    const encoding = glyph.missing ? "color" : mark.encoding;
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
      if (encoding === "height") {
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
      if (encoding === "size") {
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
    if (encoding === "height") {
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
        r: encoding === "size" ? radius * share : radius,
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
