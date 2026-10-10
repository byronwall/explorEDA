import { applyFilter } from "@/hooks/applyFilter";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { makeColorScale } from "@/lib/colorScaleMath";
import { finiteNumber } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import type { Filter, RangeFilter, ValueFilter } from "@/types/FilterTypes";
import { scaleLinear } from "d3-scale";
import type {
  ParallelAxisSettings,
  ParallelCoordinatesSettings,
} from "./definition";

export type ParallelAxisKind = "numeric" | "categorical";

export interface ParallelSnapshot {
  revision: string;
  /** Every source row. Axis domains use them so axes hold still while other charts filter. */
  allIds: number[];
  /** Rows after other filters. */
  liveIds: number[];
  columns: Record<string, Record<number, datum>>;
  kinds: Record<string, ParallelAxisKind>;
  colorData?: Record<number, datum>;
  colorScale?: ColorScaleType;
}

export interface ParallelTick {
  y: number;
  label: string;
}

export interface ParallelCategory {
  key: string;
  value: datum;
  label: string;
  /** Band center in plot coordinates. */
  center: number;
  /** Rows with this value across all source rows. */
  total: number;
  selected: boolean;
}

export interface ParallelBrush {
  y0: number;
  y1: number;
  text: string;
  filter: RangeFilter | ValueFilter;
}

export interface ParallelAxis {
  id: string;
  field: string;
  label: string;
  kind: ParallelAxisKind;
  index: number;
  x: number;
  inverted: boolean;
  /** Numeric domain after rounding to tick values. Categorical axes use [0, n]. */
  domain: [number, number];
  domainNote: string;
  categories: ParallelCategory[];
  bandHeight: number;
  ticks: ParallelTick[];
  brush?: ParallelBrush;
  /** Live rows without a usable value on this axis. */
  missing: number;
  /** Live rows that pass this axis's own selection. */
  matching?: number;
}

export interface ParallelLine {
  id: number;
  /** Vertical position on each axis, in axis order. */
  ys: number[];
  color: string;
  selected: boolean;
}

export interface ParallelPlan {
  revision: string;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
  axes: ParallelAxis[];
  lines: ParallelLine[];
  /** Live rows left out because at least one axis has no usable value. */
  omittedIds: number[];
  liveCount: number;
  selectedCount: number;
  hasSelection: boolean;
  /** Axes dropped because they have too many distinct values to read. */
  rejected: { field: string; label: string; count: number }[];
  lineOpacity: number;
  lineWidth: number;
  scopeNote: string;
}

export interface ParallelPlanInput {
  settings: ParallelCoordinatesSettings;
  width: number;
  height: number;
  snapshot: ParallelSnapshot;
  getFieldLabel: (field: string) => string;
  formatFieldValue?: (field: string, value: datum) => string;
}

export const AXIS_HEADER_HEIGHT = 46;
export const STATUS_HEIGHT = 22;
export const MAX_AXIS_CATEGORIES = 40;
const DEFAULT_LINE_COLOR = "#3479a8";
const JITTER_SHARE = 0.56;
const MAX_JITTER = 14;

/** A stable 0–1 value per row and field, so jitter never reshuffles on redraw. */
export function stableJitter(id: number, field: string) {
  let hash = 2166136261 ^ id;
  for (let index = 0; index < field.length; index += 1) {
    hash = Math.imul(hash ^ field.charCodeAt(index), 16777619);
  }
  hash = Math.imul(hash ^ (hash >>> 15), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

/** Decimal places that keep a value precise to about one pixel. */
function precisionFor(span: number, pixels: number) {
  const step = span / Math.max(1, pixels);
  return step > 0 ? Math.max(0, Math.min(8, -Math.floor(Math.log10(step)))) : 2;
}

const roundTo = (value: number, digits: number) =>
  Number(value.toFixed(digits));

function axisFilter(filters: Filter[], field: string) {
  return filters.find(
    (filter): filter is RangeFilter | ValueFilter =>
      filter.field === field &&
      (filter.type === "range" || filter.type === "value")
  );
}

export function planParallelCoordinates({
  settings,
  width,
  height,
  snapshot,
  getFieldLabel,
  formatFieldValue,
}: ParallelPlanInput): ParallelPlan {
  const format = (field: string, value: datum) =>
    value != null && typeof value !== "string" && formatFieldValue
      ? formatFieldValue(field, value)
      : categoryLabel(value);

  // Categorical axes need a readable number of bands.
  const rejected: ParallelPlan["rejected"] = [];
  const categoryLists = new Map<
    string,
    Map<string, { value: datum; total: number }>
  >();
  const usable: ParallelAxisSettings[] = [];
  for (const axis of settings.axes) {
    if (!axis.field) {
      continue;
    }
    const kind = snapshot.kinds[axis.field] ?? "numeric";
    if (kind === "categorical") {
      const data = snapshot.columns[axis.field] ?? {};
      const counts = new Map<string, { value: datum; total: number }>();
      for (const id of snapshot.allIds) {
        const value = categoryValue(data[id]);
        if (value === null) {
          continue;
        }
        const key = categoryKey(value);
        const item = counts.get(key);
        if (item) {
          item.total += 1;
        } else {
          counts.set(key, { value, total: 1 });
        }
      }
      if (counts.size > MAX_AXIS_CATEGORIES) {
        rejected.push({
          field: axis.field,
          label: getFieldLabel(axis.field),
          count: counts.size,
        });
        continue;
      }
      categoryLists.set(axis.field, counts);
    }
    usable.push(axis);
  }

  const longestTick = 7;
  const margin = {
    top: settings.margin.top + AXIS_HEADER_HEIGHT,
    right: settings.margin.right + 34,
    bottom: settings.margin.bottom + STATUS_HEIGHT + 6,
    left: settings.margin.left + longestTick * 6 + 6,
  };
  const plotWidth = Math.max(0, width - margin.left - margin.right);
  const plotHeight = Math.max(0, height - margin.top - margin.bottom);
  const spacing = usable.length > 1 ? plotWidth / (usable.length - 1) : 0;
  const tickCount = Math.max(2, Math.min(8, Math.floor(plotHeight / 36)));
  // Narrow axes get short numbers such as 6.5K instead of cut-off labels.
  const compact =
    usable.length > 1 && spacing < 90
      ? new Intl.NumberFormat("en-US", {
          notation: "compact",
          maximumFractionDigits: 1,
        })
      : undefined;

  const axes: ParallelAxis[] = usable.map((axisSettings, index) => {
    const field = axisSettings.field;
    const kind = snapshot.kinds[field] ?? "numeric";
    const data = snapshot.columns[field] ?? {};
    const filter = axisFilter(settings.filters, field);
    const base = {
      id: `axis:${field}`,
      field,
      label: getFieldLabel(field),
      kind,
      index,
      x: usable.length > 1 ? index * spacing : plotWidth / 2,
      inverted: axisSettings.inverted,
      missing: 0,
    };

    if (kind === "categorical") {
      const counts = categoryLists.get(field)!;
      const ordered = [...counts]
        .map(([key, item]) => ({
          key,
          ...item,
          label: format(field, item.value),
        }))
        .sort((a, b) =>
          typeof a.value === "number" && typeof b.value === "number"
            ? a.value - b.value
            : a.label.localeCompare(b.label, undefined, { numeric: true })
        );
      const bandHeight = plotHeight / Math.max(1, ordered.length);
      const categories = ordered.map((item, order) => {
        const slot = axisSettings.inverted ? ordered.length - 1 - order : order;
        return {
          key: item.key,
          value: item.value,
          label: item.label,
          total: item.total,
          center: (slot + 0.5) * bandHeight,
          selected: filter?.type === "value" && applyFilter(item.value, filter),
        };
      });
      const picked = categories.filter((category) => category.selected);
      const brush: ParallelBrush | undefined =
        filter?.type === "value" && picked.length
          ? {
              y0:
                Math.min(...picked.map((item) => item.center)) - bandHeight / 2,
              y1:
                Math.max(...picked.map((item) => item.center)) + bandHeight / 2,
              text:
                picked.length === 1
                  ? picked[0]!.label
                  : `${picked.length} values`,
              filter,
            }
          : undefined;
      return {
        ...base,
        domain: [0, ordered.length] as [number, number],
        domainNote: `${ordered.length} values across all ${snapshot.allIds.length.toLocaleString()} rows`,
        categories,
        bandHeight,
        ticks: categories.map((category) => ({
          y: category.center,
          label: category.label,
        })),
        brush,
      };
    }

    let low = Infinity;
    let high = -Infinity;
    let counted = 0;
    for (const id of snapshot.allIds) {
      const value = finiteNumber(data[id]);
      if (value === undefined) {
        continue;
      }
      counted += 1;
      if (value < low) {
        low = value;
      }
      if (value > high) {
        high = value;
      }
    }
    if (!counted) {
      low = 0;
      high = 1;
    }
    const scale = scaleLinear()
      .domain([low, high])
      .range(axisSettings.inverted ? [0, plotHeight] : [plotHeight, 0]);
    if (low !== high) {
      scale.nice(tickCount);
    }
    const [domainLow, domainHigh] = scale.domain() as [number, number];
    const tickFormat = scale.tickFormat(tickCount);
    const ticks =
      low === high
        ? [{ y: plotHeight / 2, label: format(field, low) }]
        : scale.ticks(tickCount).map((value) => ({
            y: scale(value),
            label: compact
              ? compact.format(value)
              : formatFieldValue
                ? format(field, value)
                : tickFormat(value),
          }));
    let brush: ParallelBrush | undefined;
    if (filter?.type === "range") {
      const min = filter.min ?? domainLow;
      const max = filter.max ?? domainHigh;
      const y = (value: number) =>
        low === high
          ? plotHeight / 2
          : scale(Math.min(domainHigh, Math.max(domainLow, value)));
      brush = {
        y0: Math.min(y(min), y(max)),
        y1: Math.max(y(min), y(max)),
        text: `${filter.min === undefined ? "…" : format(field, filter.min)} – ${filter.max === undefined ? "…" : format(field, filter.max)}`,
        filter,
      };
    }
    return {
      ...base,
      domain: [domainLow, domainHigh] as [number, number],
      domainNote: counted
        ? `${counted.toLocaleString()} values across all ${snapshot.allIds.length.toLocaleString()} rows, rounded to ticks`
        : "No numeric values",
      categories: [],
      bandHeight: 0,
      ticks,
      brush,
    };
  });

  const positionOf = (axis: ParallelAxis, id: number): number | undefined => {
    const value = snapshot.columns[axis.field]?.[id];
    if (axis.kind === "categorical") {
      const key = categoryKey(categoryValue(value));
      const category = axis.categories.find((item) => item.key === key);
      if (!category) {
        return undefined;
      }
      const spread = Math.min(axis.bandHeight * JITTER_SHARE, MAX_JITTER * 2);
      return category.center + (stableJitter(id, axis.field) - 0.5) * spread;
    }
    const number = finiteNumber(value);
    return number === undefined ? undefined : axisY(axis, plotHeight, number);
  };

  const resolveColor = snapshot.colorScale
    ? makeColorScale(snapshot.colorScale)
    : null;
  const colorFor = (id: number) => {
    if (!settings.colorField || !resolveColor) {
      return DEFAULT_LINE_COLOR;
    }
    try {
      return resolveColor(snapshot.colorData?.[id]);
    } catch {
      return DEFAULT_LINE_COLOR;
    }
  };

  const ownFilters = settings.filters.map((filter) => ({
    filter,
    data:
      snapshot.columns[filter.field] ??
      (filter.field === settings.colorField ? (snapshot.colorData ?? {}) : {}),
  }));
  const hasSelection = ownFilters.length > 0;
  const lines: ParallelLine[] = [];
  const omittedIds: number[] = [];
  const missing = axes.map(() => 0);
  const matching = axes.map(() => 0);
  let selectedCount = 0;
  for (const id of snapshot.liveIds) {
    const ys: number[] = [];
    let complete = true;
    axes.forEach((axis, index) => {
      const y = positionOf(axis, id);
      if (y === undefined) {
        missing[index]! += 1;
        complete = false;
      } else {
        ys.push(y);
      }
      if (
        axis.brush &&
        applyFilter(snapshot.columns[axis.field]?.[id], axis.brush.filter)
      ) {
        matching[index]! += 1;
      }
    });
    if (!complete) {
      omittedIds.push(id);
      continue;
    }
    const selected =
      !hasSelection ||
      ownFilters.every(({ filter, data }) => applyFilter(data[id], filter));
    if (selected) {
      selectedCount += 1;
    }
    lines.push({ id, ys, color: colorFor(id), selected });
  }
  axes.forEach((axis, index) => {
    axis.missing = missing[index]!;
    if (axis.brush) {
      axis.matching = matching[index];
    }
  });

  return {
    revision: snapshot.revision,
    width,
    height,
    margin,
    plotWidth,
    plotHeight,
    axes,
    lines,
    omittedIds,
    liveCount: snapshot.liveIds.length,
    selectedCount,
    hasSelection,
    rejected,
    lineOpacity: settings.lineOpacity,
    lineWidth: settings.lineWidth,
    scopeNote:
      "Lines are rows after other filters. Axis ranges cover all rows, so they hold still while you filter.",
  };
}

/** Vertical position of a number on a numeric axis. */
export function axisY(axis: ParallelAxis, plotHeight: number, value: number) {
  const [low, high] = axis.domain;
  if (low === high) {
    return plotHeight / 2;
  }
  const t = (value - low) / (high - low);
  return axis.inverted ? t * plotHeight : (1 - t) * plotHeight;
}

/** The value at a vertical position on a numeric axis. */
export function axisValue(axis: ParallelAxis, plotHeight: number, y: number) {
  const [low, high] = axis.domain;
  const t = Math.min(1, Math.max(0, y / Math.max(1, plotHeight)));
  return low + (axis.inverted ? t : 1 - t) * (high - low);
}

/** Turns a dragged span into a saved selection in data units, or undefined for none. */
export function brushToFilter(
  axis: ParallelAxis,
  plotHeight: number,
  y0: number,
  y1: number
): RangeFilter | ValueFilter | undefined {
  const top = Math.max(0, Math.min(y0, y1));
  const bottom = Math.min(plotHeight, Math.max(y0, y1));
  if (axis.kind === "categorical") {
    const values = axis.categories
      .filter((category) => category.center >= top && category.center <= bottom)
      .map((category) => category.value);
    return values.length
      ? { type: "value", field: axis.field, values }
      : undefined;
  }
  const digits = precisionFor(axis.domain[1] - axis.domain[0], plotHeight);
  const a = roundTo(axisValue(axis, plotHeight, top), digits);
  const b = roundTo(axisValue(axis, plotHeight, bottom), digits);
  return {
    type: "range",
    field: axis.field,
    min: Math.min(a, b),
    max: Math.max(a, b),
  };
}

/** Replaces one axis's selection, keeping every other filter. */
export function withAxisFilter(
  filters: Filter[],
  field: string,
  next: Filter | undefined
): Filter[] {
  const rest = filters.filter(
    (filter) =>
      filter.field !== field ||
      (filter.type !== "range" && filter.type !== "value")
  );
  return next ? [...rest, next] : rest;
}

/**
 * Selects one value on a categorical axis, or clears the axis when that value
 * is already its whole selection. With `add`, toggles the value within the
 * axis's selection.
 */
export function toggleAxisCategory(
  filters: Filter[],
  axis: ParallelAxis,
  category: ParallelCategory,
  add = false
): Filter[] {
  const current = axis.categories.filter((item) => item.selected);
  const isOnly = current.length === 1 && current[0]!.key === category.key;
  const next = add
    ? category.selected
      ? current.filter((item) => item.key !== category.key)
      : [...current, category]
    : isOnly
      ? []
      : [category];
  return withAxisFilter(
    filters,
    axis.field,
    next.length
      ? {
          type: "value",
          field: axis.field,
          values: next.map((item) => item.value),
        }
      : undefined
  );
}

/** Moves one axis to a new index; the selection and other axes stay as they are. */
export function moveAxis<T>(axes: T[], from: number, to: number): T[] {
  const target = Math.max(0, Math.min(axes.length - 1, to));
  if (from === target || from < 0 || from >= axes.length) {
    return axes;
  }
  const next = axes.slice();
  const [moved] = next.splice(from, 1);
  next.splice(target, 0, moved!);
  return next;
}

/** The drawn line nearest a point in plot coordinates, within `radius` pixels. */
export function findNearestLine(
  plan: ParallelPlan,
  x: number,
  y: number,
  radius = 6
): ParallelLine | undefined {
  const { axes } = plan;
  if (axes.length < 2) {
    return undefined;
  }
  let segment = axes.findIndex(
    (axis, index) => index < axes.length - 1 && x <= axes[index + 1]!.x
  );
  if (segment < 0) {
    segment = axes.length - 2;
  }
  const left = axes[segment]!;
  const right = axes[segment + 1]!;
  const t = Math.min(
    1,
    Math.max(0, (x - left.x) / Math.max(1, right.x - left.x))
  );
  let best: ParallelLine | undefined;
  let bestDistance = radius;
  for (const line of plan.lines) {
    const ly =
      line.ys[segment]! + (line.ys[segment + 1]! - line.ys[segment]!) * t;
    // Prefer selected lines over dimmed context when they are equally close.
    const distance = Math.abs(ly - y) - (line.selected ? 0.5 : 0);
    if (distance < bestDistance) {
      best = line;
      bestDistance = distance;
    }
  }
  return best;
}
