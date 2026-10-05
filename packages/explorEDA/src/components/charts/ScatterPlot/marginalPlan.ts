import { bisectRight } from "d3-array";
import type { IdType } from "@/providers/DataLayerProvider";
import type { Filter } from "@/types/FilterTypes";
import { buildScale } from "../Axis/axisPlan";
import type { ScatterPlotSettings } from "./definition";
import type { ScatterPlan } from "./scatterPlan";

/** Depth of each marginal histogram band, in pixels. */
export const MARGINAL_SIZE = 32;
/** Space between a band and the plot. */
export const MARGINAL_GAP = 4;
export const DEFAULT_MARGINAL_BINS = 20;

export interface MarginalBin {
  id: string;
  axis: "x" | "y";
  field: string;
  label: string;
  bounds: [number, number];
  last: boolean;
  sourceIds: IdType[];
  /** Rows in the bin that also pass this chart's own selection. */
  selected: number;
  x: number;
  y: number;
  width: number;
  height: number;
  selectedLength: number;
}

export interface MarginalPlan {
  bins: MarginalBin[];
  binCount: number;
  max: { x: number; y: number };
  /** True when this chart has its own selection, so bins split in two. */
  split: boolean;
  /** A categorical axis gets no histogram. */
  skipped: ("x" | "y")[];
}

/**
 * X and Y histograms of the plotted pairs. Edges divide the full-source axis
 * domain into equal intervals, so they stay put during filtering and resizing.
 */
export function planMarginals(
  settings: ScatterPlotSettings,
  plan: ScatterPlan
): MarginalPlan | undefined {
  if (!settings.marginals) return undefined;
  const binCount = settings.marginals.bins ?? DEFAULT_MARGINAL_BINS;
  const split = settings.filters.length > 0;
  const bins: MarginalBin[] = [];
  const max = { x: 0, y: 0 };
  const skipped: MarginalPlan["skipped"] = [];
  for (const axis of ["x", "y"] as const) {
    const descriptor = axis === "x" ? plan.xScale : plan.yScale;
    if (descriptor.type === "band") {
      skipped.push(axis);
      continue;
    }
    const scale = buildScale(descriptor) as (value: number) => number;
    const [low, high] = descriptor.domain as [number, number];
    const edges = Array.from({ length: binCount + 1 }, (_, i) =>
      i === binCount ? high : low + ((high - low) * i) / binCount
    );
    const members = Array.from({ length: binCount }, () => ({
      ids: [] as IdType[],
      selected: 0,
    }));
    for (const point of plan.points) {
      const value = Number(axis === "x" ? point.xValue : point.yValue);
      // Interior edges belong to the bin on their right; the last edge closes.
      const index = Math.max(
        0,
        Math.min(binCount - 1, bisectRight(edges, value) - 1)
      );
      members[index]!.ids.push(point.sourceId);
      if (point.passesOwnFilter) members[index]!.selected++;
    }
    const axisMax = Math.max(1, ...members.map((item) => item.ids.length));
    max[axis] = axisMax;
    const field = axis === "x" ? plan.xField : plan.yField;
    const label = axis === "x" ? plan.xDisplay : plan.yDisplay;
    members.forEach((member, index) => {
      if (!member.ids.length) return;
      const a = scale(edges[index]!);
      const b = scale(edges[index + 1]!);
      const length = (member.ids.length / axisMax) * MARGINAL_SIZE;
      const selectedLength = (member.selected / axisMax) * MARGINAL_SIZE;
      const start = Math.min(a, b) + 0.5;
      const span = Math.max(0.5, Math.abs(b - a) - 1);
      bins.push({
        id: `marginal:${axis}:${index}`,
        axis,
        field,
        label,
        bounds: [edges[index]!, edges[index + 1]!],
        last: index === binCount - 1,
        sourceIds: member.ids,
        selected: member.selected,
        selectedLength,
        ...(axis === "x"
          ? {
              x: start,
              width: span,
              y: -MARGINAL_GAP - length,
              height: length,
            }
          : {
              x: plan.plotWidth + MARGINAL_GAP,
              width: length,
              y: start,
              height: span,
            }),
      });
    });
  }
  return { bins, binCount, max, split, skipped };
}

/** Clicking a bin filters this chart's axis field to its range, or clears it. */
export function marginalBinFilters(
  settings: ScatterPlotSettings,
  bin: MarginalBin
): Filter[] {
  const others = settings.filters.filter(
    (filter) => !(filter.field === bin.field && filter.type === "range")
  );
  const current = settings.filters.find(
    (filter) => filter.field === bin.field && filter.type === "range"
  );
  const same =
    current?.type === "range" &&
    current.min === bin.bounds[0] &&
    current.max === bin.bounds[1];
  return same
    ? others
    : [
        ...others,
        {
          type: "range",
          field: bin.field,
          min: bin.bounds[0],
          max: bin.bounds[1],
        },
      ];
}

export interface MarginalTrace {
  kind: "marginal-bin";
  id: string;
  revision: string;
  bin: MarginalBin;
  marginals: MarginalPlan;
}
