import { heatFill } from "../heatScale";
import { buildScale, type AxisTypography } from "../Axis/axisPlan";
import { finiteNumber } from "@/lib/valueParsing";
import type { datum, Filter } from "@/types/FilterTypes";
import type { ScatterPlotSettings } from "./definition";
import { binIndex } from "./marginalPlan";
import { planScatter, type ScatterSnapshot } from "./scatterPlan";
import type { ScatterTrace } from "./scatterTrace";

export const DENSITY_FOOTER = 56;
export interface DensityBin {
  id: string;
  xIndex: number;
  yIndex: number;
  xBounds: [number, number];
  yBounds: [number, number];
  xLast: boolean;
  yLast: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  sourceIds: number[];
  rowIds: number[];
  matching: number;
  selected: boolean;
  dimmed: boolean;
  fill: string;
}

/** Bin fill from the theme's heat ramp, so density follows theme and mode. */
export const densityColor = (fraction: number) =>
  heatFill(0.2 + 0.8 * Math.max(0, Math.min(1, fraction)), "sequential");

/**
 * Equal numeric intervals keep exact membership independent of panel pixels.
 * A log axis bins in equal ratios, so bins keep an even width on screen.
 */
export function densityEdges(
  domain: [number, number],
  count: number,
  log = false
) {
  const [low, high] = domain;
  return Array.from({ length: count + 1 }, (_, i) =>
    i === count
      ? high
      : log
        ? low * (high / low) ** (i / count)
        : low + ((high - low) * i) / count
  );
}

export function planDensity(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  width: number,
  height: number,
  typography?: AxisTypography
) {
  const scatterSettings = {
    ...settings,
    sizeField: undefined,
    colorField: undefined,
    colorScaleId: undefined,
  };
  const scatter = planScatter(
    scatterSettings,
    snapshot,
    width,
    Math.max(1, height - DENSITY_FOOTER),
    typography
  );
  const xBins = settings.density?.xBins ?? 20;
  const yBins = settings.density?.yBins ?? 16;
  const cells: DensityBin[] = [];
  const base = { scatter, scatterSettings, snapshot, xBins, yBins, cells };
  if (scatter.xScale.type === "band" || scatter.yScale.type === "band") {
    return {
      ...base,
      max: 1,
      sourceMax: 0,
      notice: "Choose numeric X and Y fields for density bins.",
      omittedIds: [] as number[],
    };
  }
  const xEdges = densityEdges(
    scatter.xScale.domain,
    xBins,
    scatter.xScale.type === "log"
  );
  const yEdges = densityEdges(
    scatter.yScale.domain,
    yBins,
    scatter.yScale.type === "log"
  );
  // The axes' own scales, so a log axis places its cells where its ticks are.
  const xScale = buildScale(scatter.xScale) as (value: number) => number;
  const yScale = buildScale(scatter.yScale) as (value: number) => number;
  const allBins = new Map<string, number[]>();
  // Rows in this panel whose pair sits past an axis bound, so no bin holds it.
  const panel = new Set(scatter.rowSets.facet);
  const outside: number[] = [];
  for (const id of snapshot.allIds) {
    const x = finiteNumber(snapshot.xData[id]);
    const y = finiteNumber(snapshot.yData[id]);
    if (x === undefined || y === undefined) continue;
    if (!Number.isFinite(xScale(x)) || !Number.isFinite(yScale(y))) continue;
    const xi = binIndex(xEdges, x);
    const yi = binIndex(yEdges, y);
    if (xi === undefined || yi === undefined) {
      if (panel.has(id)) outside.push(id);
      continue;
    }
    const key = `${xi}:${yi}`;
    const ids = allBins.get(key) ?? [];
    ids.push(id);
    allBins.set(key, ids);
  }
  const sourceMax = Math.max(
    0,
    ...[...allBins.values()].map((ids) => ids.length)
  );
  const max = settings.density?.colorMax ?? Math.max(1, sourceMax);
  const facet = snapshot.facetIds ? new Set(snapshot.facetIds) : undefined;
  const live = new Set(snapshot.chartIds);
  const filtered = new Set(snapshot.filteredIds);
  for (let yi = yBins - 1; yi >= 0; yi--) {
    for (let xi = 0; xi < xBins; xi++) {
      const sourceIds = (allBins.get(`${xi}:${yi}`) ?? []).filter(
        (id) => !facet || facet.has(id)
      );
      if (!sourceIds.length) continue;
      const rowIds = sourceIds.filter((id) => live.has(id));
      const matching = rowIds.filter((id) => filtered.has(id)).length;
      const xBounds: [number, number] = [xEdges[xi]!, xEdges[xi + 1]!];
      const yBounds: [number, number] = [yEdges[yi]!, yEdges[yi + 1]!];
      const x = xScale(xBounds[0]);
      const y = yScale(yBounds[1]);
      cells.push({
        id: `density:${xi}:${yi}`,
        xIndex: xi,
        yIndex: yi,
        xBounds,
        yBounds,
        xLast: xi === xBins - 1,
        yLast: yi === yBins - 1,
        x,
        y,
        width: xScale(xBounds[1]) - x,
        height: yScale(yBounds[0]) - y,
        sourceIds,
        rowIds,
        matching,
        selected:
          settings.filters.length > 0 &&
          rowIds.length > 0 &&
          matching === rowIds.length,
        dimmed: settings.filters.length > 0 && matching === 0,
        fill: rowIds.length ? densityColor(rowIds.length / max) : "none",
      });
    }
  }
  return {
    ...base,
    max,
    sourceMax,
    notice: undefined as string | undefined,
    omittedIds: [
      ...scatter.exclusions.map((item) => item.sourceId),
      ...outside,
    ],
  };
}

export type DensityPlan = ReturnType<typeof planDensity>;
export function densityBinFilters(
  settings: ScatterPlotSettings,
  bin: DensityBin
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

export interface DensityTrace {
  kind: "density-bin" | "density-omissions" | "density-row";
  id: string;
  revision: string;
  plan: DensityPlan;
  bin?: DensityBin;
  row?: Extract<ScatterTrace, { kind: "point" }>;
  rawRows: Record<string, datum>[];
}
