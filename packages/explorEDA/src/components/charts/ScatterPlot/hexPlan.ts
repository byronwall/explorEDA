import { finiteNumber } from "@/lib/valueParsing";
import type { IdType } from "@/providers/DataLayerProvider";
import type { Filter } from "@/types/FilterTypes";
import { buildScale } from "../Axis/axisPlan";
import type { ScatterPlotSettings } from "./definition";
import type { ScatterPlan, ScatterSnapshot } from "./scatterPlan";

export const DEFAULT_HEX_COLUMNS = 20;

/**
 * Count color: more blue mixed into the background for more rows. Light themes
 * run pale to deep blue; dark themes run dim to bright blue, so sparse
 * hexagons never glare.
 */
export const hexColor = (fraction: number) =>
  `color-mix(in oklab, var(--eda-count) ${(14 + 86 * Math.max(0, Math.min(1, fraction))).toFixed(1)}%, var(--background))`;

export interface HexBin {
  id: string;
  column: number;
  row: number;
  /** Center in plot pixels. */
  cx: number;
  cy: number;
  /** SVG points of the hexagon in plot pixels. */
  points: string;
  /** Every source row in this hexagon and facet. */
  sourceIds: IdType[];
  /** Rows that pass the other charts' filters: the count it shows. */
  rowIds: IdType[];
  /** Counted rows that also pass this chart's own selection. */
  matching: number;
  selected: boolean;
  dimmed: boolean;
  fill: string;
}

export interface HexPlan {
  columns: number;
  bins: HexBin[];
  /** Count at full color; the largest full-source hexagon unless fixed. */
  max: number;
  sourceMax: number;
  /** Rows in hexagons that pass the other charts' filters. */
  counted: number;
  notice?: string;
  hexAt: (px: number, py: number) => HexBin | undefined;
}

const SQRT3 = Math.sqrt(3);

/**
 * Pointy-top hexagons tile the unit square of the axis ranges, so a row's
 * hexagon depends only on its values and the full-source axis domains. It stays
 * fixed during filtering and resizing; on a wide panel hexagons draw wider.
 */
function hexGrid(columns: number) {
  const dx = 1 / columns;
  const r = dx / SQRT3;
  const dy = 1.5 * r;
  const locate = (u: number, v: number) => {
    // Nearest of the two candidate rows' centers.
    const row0 = Math.floor(v / dy);
    let best: [number, number] = [0, 0];
    let bestDistance = Infinity;
    for (const row of [row0, row0 + 1]) {
      const offset = row % 2 ? dx / 2 : 0;
      const column = Math.round((u - offset) / dx);
      const cu = column * dx + offset;
      const cv = row * dy;
      const distance = (u - cu) ** 2 + (v - cv) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = [column, row];
      }
    }
    return best;
  };
  const center = (column: number, row: number): [number, number] => [
    column * dx + (row % 2 ? dx / 2 : 0),
    row * dy,
  ];
  return { r, locate, center };
}

export function planHexbins(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  plan: ScatterPlan
): HexPlan | undefined {
  if (settings.display !== "hexbin") return undefined;
  const columns = settings.hexbin?.columns ?? DEFAULT_HEX_COLUMNS;
  const empty: HexPlan = {
    columns,
    bins: [],
    max: 1,
    sourceMax: 0,
    counted: 0,
    hexAt: () => undefined,
  };
  if (plan.xScale.type === "band" || plan.yScale.type === "band")
    return {
      ...empty,
      notice: "Choose numeric X and Y fields for hexagonal bins.",
    };
  const xScale = buildScale(plan.xScale) as (value: number) => number;
  const yScale = buildScale(plan.yScale) as (value: number) => number;
  const [x0, x1] = plan.xScale.range as [number, number];
  const [y0, y1] = plan.yScale.range as [number, number];
  // Normalized position: 0 at the left and bottom of the axis ranges.
  const toUnit = (x: number, y: number): [number, number] => [
    (xScale(x) - x0) / (x1 - x0),
    (yScale(y) - y0) / (y1 - y0),
  ];
  const grid = hexGrid(columns);
  const all = new Map<string, IdType[]>();
  for (const id of snapshot.allIds) {
    const x = finiteNumber(snapshot.xData[id]);
    const y = finiteNumber(snapshot.yData[id]);
    if (x === undefined || y === undefined) continue;
    const [u, v] = toUnit(x, y);
    if (!Number.isFinite(u) || !Number.isFinite(v)) continue;
    const [column, row] = grid.locate(u, v);
    const key = `${column}:${row}`;
    const ids = all.get(key) ?? [];
    ids.push(id);
    all.set(key, ids);
  }
  const sourceMax = Math.max(0, ...[...all.values()].map((ids) => ids.length));
  const max = settings.hexbin?.colorMax ?? Math.max(1, sourceMax);
  const facet = snapshot.facetIds ? new Set(snapshot.facetIds) : undefined;
  const live = new Set(snapshot.chartIds);
  const filtered = new Set(snapshot.filteredIds);
  const toPixel = (u: number, v: number) =>
    [x0 + u * (x1 - x0), y0 + v * (y1 - y0)] as const;
  const bins: HexBin[] = [];
  let counted = 0;
  for (const [key, ids] of all) {
    const sourceIds = facet ? ids.filter((id) => facet.has(id)) : ids;
    if (!sourceIds.length) continue;
    const rowIds = sourceIds.filter((id) => live.has(id));
    counted += rowIds.length;
    const matching = rowIds.filter((id) => filtered.has(id)).length;
    const [column, row] = key.split(":").map(Number) as [number, number];
    const [cu, cv] = grid.center(column, row);
    const [cx, cy] = toPixel(cu, cv);
    const points = Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i + Math.PI / 6;
      const [px, py] = toPixel(
        cu + grid.r * Math.cos(angle),
        cv + grid.r * Math.sin(angle)
      );
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).join(" ");
    bins.push({
      id: `hex:${key}`,
      column,
      row,
      cx,
      cy,
      points,
      sourceIds,
      rowIds,
      matching,
      selected:
        settings.filters.length > 0 &&
        rowIds.length > 0 &&
        matching === rowIds.length,
      dimmed: settings.filters.length > 0 && matching === 0,
      fill: rowIds.length ? hexColor(rowIds.length / max) : "none",
    });
  }
  // Read left to right, top to bottom for keyboard order.
  bins.sort((a, b) => a.cy - b.cy || a.cx - b.cx);
  const byKey = new Map(bins.map((bin) => [`${bin.column}:${bin.row}`, bin]));
  return {
    columns,
    bins,
    max,
    sourceMax,
    counted,
    hexAt: (px, py) => {
      const [column, row] = grid.locate(
        (px - x0) / (x1 - x0),
        (py - y0) / (y1 - y0)
      );
      return byKey.get(`${column}:${row}`);
    },
  };
}

/** A click selects exactly the hexagon's source rows, or clears that selection. */
export function hexBinFilters(
  settings: ScatterPlotSettings,
  bin: HexBin
): Filter[] {
  const filter = settings.filters[0];
  const selected =
    settings.filters.length === 1 &&
    filter?.type === "value" &&
    filter.field === "__ID" &&
    filter.values.length === bin.sourceIds.length &&
    bin.sourceIds.every((id) => filter.values.includes(id));
  return selected
    ? []
    : [{ type: "value", field: "__ID", values: bin.sourceIds }];
}

export interface HexTrace {
  kind: "hex-bin";
  id: string;
  revision: string;
  bin: HexBin;
  hex: HexPlan;
  xLabel: string;
  yLabel: string;
  /** Data-space center of the hexagon. */
  center: [number, number];
}
