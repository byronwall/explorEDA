import { bisectRight } from "d3-array";
import { heatFill } from "../heatScale";
import type { AxisTypography } from "../Axis/axisPlan";
import { finiteNumber } from "@/lib/valueParsing";
import type { datum, Filter } from "@/types/FilterTypes";
import { numericScale } from "../Axis/numericScale";
import type { ScatterPlotSettings } from "./definition";
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

/** Equal numeric intervals keep exact membership independent of panel pixels. */
export function densityEdges(domain: [number, number], count: number) {
  return Array.from({ length: count + 1 }, (_, i) =>
    i === count ? domain[1] : domain[0] + ((domain[1] - domain[0]) * i) / count
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
  const xEdges = densityEdges(scatter.xScale.domain, xBins);
  const yEdges = densityEdges(scatter.yScale.domain, yBins);
  const xScale = numericScale(settings.xAxis)
    .domain(scatter.xScale.domain)
    .range(scatter.xScale.range);
  const yScale = numericScale(settings.yAxis)
    .domain(scatter.yScale.domain)
    .range(scatter.yScale.range);
  const allBins = new Map<string, number[]>();
  for (const id of snapshot.allIds) {
    const x = finiteNumber(snapshot.xData[id]);
    const y = finiteNumber(snapshot.yData[id]);
    if (x === undefined || y === undefined) continue;
    if (!Number.isFinite(xScale(x)) || !Number.isFinite(yScale(y))) continue;
    // Each interior edge belongs to the bin on its right. Only the final edge is closed.
    const xi = Math.max(0, Math.min(xBins - 1, bisectRight(xEdges, x) - 1));
    const yi = Math.max(0, Math.min(yBins - 1, bisectRight(yEdges, y) - 1));
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
    omittedIds: scatter.exclusions.map((item) => item.sourceId),
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
