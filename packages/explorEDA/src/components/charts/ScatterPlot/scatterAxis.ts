import { scaleBand, type ScaleBand, type ScaleLinear } from "d3-scale";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import { detectColumnType } from "@/components/SummaryTable/utils/dataTypeDetection";
import {
  categoryIncludes,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import { finiteNumber, isMissingValue } from "@/lib/numeric";
import { applyFilter } from "@/hooks/applyFilter";
import type { IdType } from "@/providers/DataLayerProvider";
import type { AxisSettings, datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { numericScale } from "../Axis/numericScale";

/** Space between bands, as a share of each band's step. */
export const BAND_PADDING = 0.2;
/** Share of a band's width that jittered points spread across. */
export const JITTER_SHARE = 0.8;
/** Share of the data span added on each side of a numeric domain. */
export const DOMAIN_PADDING = 0.1;

export interface ScatterCategory {
  /** Unique band key, also the tick value. */
  label: string;
  value: datum;
}

export type ScatterAxisScale =
  | {
      kind: "numeric";
      type: "linear" | "symlog";
      scale: ScaleLinear<number, number>;
      bounds: [number, number];
      domain: [number, number];
    }
  | {
      kind: "band";
      type: "band";
      scale: ScaleBand<string>;
      categories: ScatterCategory[];
    };

// d3's symlog transform with its default constant of 1.
const symlog = (value: number) =>
  Math.sign(value) * Math.log1p(Math.abs(value));
const symexp = (value: number) =>
  Math.sign(value) * Math.expm1(Math.abs(value));

/**
 * Pads a data extent by 10% of its on-screen span on each side, so points at
 * the minimum and maximum sit fully inside the plot. A constant field gets half
 * a unit on each side instead of an empty domain.
 */
export function paddedDomain(
  [min, max]: [number, number],
  scaleType: "linear" | "symlog"
): [number, number] {
  const to = scaleType === "symlog" ? symlog : (value: number) => value;
  const from = scaleType === "symlog" ? symexp : (value: number) => value;
  const low = to(min);
  const high = to(max);
  const pad = high > low ? (high - low) * DOMAIN_PADDING : 0.5;
  return [from(low - pad), from(high + pad)];
}

function bounds(ids: IdType[], data: Record<IdType, datum>): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const id of ids) {
    const value = finiteNumber(data[id]);
    if (value === undefined) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return min === Infinity ? [0, 1] : [min, max];
}

/**
 * Numeric fields get a numeric axis. Any other field with values gets one
 * band per category, missing values included. A field with no values keeps a
 * numeric axis so its rows show as exclusions.
 */
export function scatterAxisKind(
  ids: IdType[],
  data: Record<IdType, datum>,
  dataType?: DataType
): "numeric" | "band" {
  const hasValues = ids.some((id) => !isMissingValue(data[id]));
  if (!hasValues) return "numeric";
  const type = dataType ?? detectColumnType(ids.map((id) => data[id]));
  return type === "numeric" ? "numeric" : "band";
}

const labelOrder = new Intl.Collator(undefined, { numeric: true });

function categories(ids: IdType[], data: Record<IdType, datum>) {
  const byLabel = new Map<string, datum>();
  for (const id of ids) {
    const value = categoryValue(data[id]);
    byLabel.set(categoryLabel(value), value);
  }
  return [...byLabel]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) =>
      a.value == null
        ? 1
        : b.value == null
          ? -1
          : labelOrder.compare(a.label, b.label)
    );
}

/** Builds one scatter axis. Every domain comes from all source rows. */
export function planScatterAxis({
  ids,
  data,
  dataType,
  axis,
  range,
}: {
  ids: IdType[];
  data: Record<IdType, datum>;
  dataType?: DataType;
  axis: AxisSettings;
  range: [number, number];
}): ScatterAxisScale {
  if (scatterAxisKind(ids, data, dataType) === "band") {
    const items = categories(ids, data);
    return {
      kind: "band",
      type: "band",
      categories: items,
      scale: scaleBand<string>()
        .domain(items.map((item) => item.label))
        .range(range)
        .padding(BAND_PADDING),
    };
  }
  const type = axis.scaleType === "symlog" ? "symlog" : "linear";
  const extent = bounds(ids, data);
  const domain = paddedDomain(extent, type);
  return {
    kind: "numeric",
    type,
    bounds: extent,
    domain,
    scale: numericScale(axis).domain(domain).range(range),
  };
}

/** A stable spread in [-0.5, 0.5) for a row, so points keep their place across renders. */
export function jitter(sourceId: IdType, salt: number) {
  let hash = (Number(sourceId) * 2654435761 + salt * 40503) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507) >>> 0;
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909) >>> 0;
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296 - 0.5;
}

/** The value a row plots at and its pixel, or undefined when it has no place. */
export function scatterPosition(
  axis: ScatterAxisScale,
  raw: datum,
  sourceId: IdType,
  salt: number
): { value: datum; pixel: number } | undefined {
  if (axis.kind === "numeric") {
    const value = finiteNumber(raw);
    if (value === undefined) return undefined;
    const pixel = axis.scale(value);
    return Number.isFinite(pixel) ? { value, pixel } : undefined;
  }
  const value = categoryValue(raw);
  const start = axis.scale(categoryLabel(value));
  if (start === undefined) return undefined;
  const width = axis.scale.bandwidth();
  return {
    value,
    pixel: start + width / 2 + jitter(sourceId, salt) * width * JITTER_SHARE,
  };
}

/** Whether a row passes this chart's own filters on one axis field. */
export function passesAxisFilters(
  axis: ScatterAxisScale,
  filters: Filter[],
  field: string,
  value: datum
) {
  // A band axis brushes categories and a numeric axis brushes a range.
  const type = axis.kind === "band" ? "value" : "range";
  return filters
    .filter((filter) => filter.field === field && filter.type === type)
    .every((filter) => applyFilter(value, filter));
}

/** Each band's full step, so every pixel on the axis belongs to one category. */
function bandCells(axis: Extract<ScatterAxisScale, { kind: "band" }>) {
  const gap = axis.scale.step() - axis.scale.bandwidth();
  return axis.categories.map((category) => {
    const start = axis.scale(category.label) ?? 0;
    return {
      category,
      start: start - gap / 2,
      end: start + axis.scale.bandwidth() + gap / 2,
    };
  });
}

/** The pixel span a brush covers for this axis's own filter. */
export function filterSpan(
  axis: ScatterAxisScale,
  filters: Filter[],
  field: string
): [number, number] | undefined {
  if (axis.kind === "numeric") {
    const filter = filters.find(
      (item) => item.type === "range" && item.field === field
    );
    if (
      filter?.type !== "range" ||
      filter.min === undefined ||
      filter.max === undefined
    )
      return undefined;
    const a = axis.scale(filter.min);
    const b = axis.scale(filter.max);
    return [Math.min(a, b), Math.max(a, b)];
  }
  const filter = filters.find(
    (item) => item.type === "value" && item.field === field
  );
  if (filter?.type !== "value") return undefined;
  const cells = bandCells(axis).filter((cell) =>
    categoryIncludes(filter.values, cell.category.value)
  );
  if (!cells.length) return undefined;
  return [
    Math.min(...cells.map((cell) => cell.start)),
    Math.max(...cells.map((cell) => cell.end)),
  ];
}

/** Pixels a brush edge may cross into a band without selecting it. */
const BAND_EDGE_TOLERANCE = 0.5;

/** Turns a brushed pixel span into a filter: a value range, or the bands it touches. */
export function spanFilter(
  axis: ScatterAxisScale,
  field: string,
  [a, b]: [number, number]
): Filter {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  if (axis.kind === "numeric") {
    const x = axis.scale.invert(low);
    const y = axis.scale.invert(high);
    return {
      type: "range",
      field,
      min: Math.min(x, y),
      max: Math.max(x, y),
    };
  }
  return {
    type: "value",
    field,
    values: bandCells(axis)
      .filter(
        (cell) =>
          high > cell.start + BAND_EDGE_TOLERANCE &&
          low < cell.end - BAND_EDGE_TOLERANCE
      )
      .map((cell) => cell.category.value),
  };
}
