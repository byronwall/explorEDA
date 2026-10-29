import { applyFilter } from "@/hooks/applyFilter";
import {
  finiteNumber,
  finiteNumbers,
  isMissingValue,
} from "@/lib/valueParsing";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import type { Filter } from "@/types/FilterTypes";
import { numericBins } from "./bins";
import type { BarChartSettings } from "./definition";
import { locate, widthEdges } from "./histogramBins";
import {
  specStatus,
  type SpecLimits,
  type SpecStatus,
} from "@/lib/specification";

export type TailSide = "below" | "above";

/** One interval of an engineering histogram and the rows in it. */
export interface HistogramBin {
  /** A bin index, or the coverage tail past the first or last edge. */
  key: number | TailSide;
  start: number;
  end: number;
  /** Whether the bin keeps its upper edge: only the last does. */
  closed: boolean;
  /** Context rows with a finite measurement in this interval. */
  ids: IdType[];
  /** How many of them the chart's own selection keeps. */
  selected: number;
  /** Count over every source row, for the Y domain and faint totals. */
  sourceCount: number;
}

export interface HistogramPlan {
  edges: number[];
  /** Why the authored bins can't be drawn; auto bins stand in. */
  problem?: string;
  bins: HistogramBin[];
  /** Coverage tails: finite values strictly past the first or last edge. */
  tails: Partial<Record<TailSide, HistogramBin>>;
  /** Context rows without a value, and with a value that is not a number. */
  missing: IdType[];
  invalid: IdType[];
  /** Finite measurements in context, tails included. */
  n: number;
  /** Selection on the measurement field, or undefined without one. */
  selection?: { filters: Filter[]; ids: IdType[] };
  /**
   * Context rows by specification status, when the chart has a limit. A
   * one-sided limit leaves the absent side's list empty.
   */
  spec?: { limits: SpecLimits } & Record<SpecStatus, IdType[]>;
}

/** The chart's own filters on its measurement field. */
export function measurementFilters(settings: BarChartSettings) {
  return settings.filters.filter((filter) => filter.field === settings.field);
}

/** The edges a histogram draws: authored when valid, else auto bins. */
export function histogramEdges(
  settings: BarChartSettings,
  source: readonly number[]
): { edges: number[]; problem?: string } {
  const binning = settings.histogram?.binning;
  if (binning?.mode === "width") {
    const result = widthEdges(binning);
    if ("edges" in result) return { edges: result.edges };
    return { edges: autoEdges(settings, source), problem: result.problem };
  }
  return { edges: autoEdges(settings, source) };
}

function autoEdges(settings: BarChartSettings, source: readonly number[]) {
  const bins = numericBins([...source], [], settings.binCount || 20);
  return bins.length ? [bins[0]!.start, ...bins.map((bin) => bin.end)] : [];
}

/**
 * Plans an engineering histogram from one snapshot. Source values set the
 * edges and the Y domain; context rows set the counts. Every count is the
 * length of an ID list, so marks, summaries, and traces agree exactly.
 */
export function planHistogram(
  settings: BarChartSettings,
  allValues: readonly datum[],
  liveIds: readonly IdType[],
  fieldData: Record<IdType, datum>
): HistogramPlan {
  const source = finiteNumbers(allValues);
  const { edges, problem } = histogramEdges(settings, source);
  const own = measurementFilters(settings);
  const width =
    edges.length > 1 ? (edges.at(-1)! - edges[0]!) / (edges.length - 1) : 1;
  const bins: HistogramBin[] = edges.slice(0, -1).map((start, index) => ({
    key: index,
    start,
    end: edges[index + 1]!,
    closed: index === edges.length - 2,
    ids: [],
    selected: 0,
    sourceCount: 0,
  }));
  const tails = {
    below: {
      key: "below" as const,
      start: edges[0]! - width,
      end: edges[0]!,
      closed: false,
      ids: [] as IdType[],
      selected: 0,
      sourceCount: 0,
    },
    above: {
      key: "above" as const,
      start: edges.at(-1)!,
      end: edges.at(-1)! + width,
      closed: false,
      ids: [] as IdType[],
      selected: 0,
      sourceCount: 0,
    },
  };
  const slot = (value: number) => {
    const at = locate(edges, value);
    return typeof at === "number" ? bins[at]! : tails[at];
  };
  if (edges.length > 1) for (const value of source) slot(value).sourceCount++;

  const missing: IdType[] = [];
  const invalid: IdType[] = [];
  const selected: IdType[] = [];
  const limits = settings.histogram?.spec;
  const spec =
    limits && (limits.lower !== undefined || limits.upper !== undefined)
      ? {
          limits,
          below: [] as IdType[],
          within: [] as IdType[],
          above: [] as IdType[],
        }
      : undefined;
  let n = 0;
  for (const id of liveIds) {
    const raw = fieldData[id];
    const value = finiteNumber(raw);
    if (value === undefined) {
      (isMissingValue(raw) ? missing : invalid).push(id);
      continue;
    }
    n++;
    if (spec) spec[specStatus(value, spec.limits)!].push(id);
    if (edges.length < 2) continue;
    const bin = slot(value);
    bin.ids.push(id);
    if (own.length && own.every((filter) => applyFilter(raw, filter, limits))) {
      bin.selected++;
      selected.push(id);
    }
  }
  // A tail shows when any source value lies past the edges, so filtering
  // elsewhere never moves the axis.
  const shown = (tail: HistogramBin) =>
    tail.sourceCount > 0 || tail.ids.length > 0 ? tail : undefined;
  return {
    edges,
    problem,
    bins: edges.length > 1 ? bins : [],
    tails:
      edges.length > 1
        ? { below: shown(tails.below), above: shown(tails.above) }
        : {},
    missing,
    invalid,
    n,
    selection: own.length ? { filters: own, ids: selected } : undefined,
    spec,
  };
}

/**
 * The range filter that selects a bin exactly: its lower edge in, its upper
 * edge out unless it is the last bin. A tail is strictly past its edge.
 */
export function binSelection(
  bin: Pick<HistogramBin, "key" | "start" | "end" | "closed">
): { min?: number; max?: number; minExclusive?: true; maxExclusive?: true } {
  if (bin.key === "below") return { max: bin.end, maxExclusive: true };
  if (bin.key === "above") return { min: bin.start, minExclusive: true };
  return bin.closed
    ? { min: bin.start, max: bin.end }
    : { min: bin.start, max: bin.end, maxExclusive: true };
}

/** True when two range predicates keep exactly the same values. */
export function samePredicate(
  a: {
    min?: number;
    max?: number;
    minExclusive?: boolean;
    maxExclusive?: boolean;
  },
  b: typeof a
) {
  return (
    a.min === b.min &&
    a.max === b.max &&
    !a.minExclusive === !b.minExclusive &&
    !a.maxExclusive === !b.maxExclusive
  );
}
