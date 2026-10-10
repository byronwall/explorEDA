import type { ThemeColors } from "@/lib/themePalettes";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { defaultCategoricalColors, makeColorScale } from "@/lib/colorScaleMath";
import { finiteNumber, numericExclusionReason } from "@/lib/numeric";
import type { datum } from "@/types/ChartTypes";
import type { ColorScaleType } from "@/types/ColorScaleTypes";
import type { RangeFilter } from "@/types/FilterTypes";
import { scaleLinear, scaleLog } from "d3-scale";
import type { EcdfSettings } from "./definition";

export interface EcdfSnapshot {
  revision: string;
  /** Every source row. The x range uses them so it holds still while filtering. */
  allIds: number[];
  /** Rows after other filters. */
  liveIds: number[];
  values: Record<number, datum>;
  groupData?: Record<number, datum>;
  colorScale?: ColorScaleType;
  /** Fallback colors from the workspace theme. */
  themeColors?: ThemeColors;
}

/** One distinct observed value. Equal values share a step. */
export interface EcdfStep {
  x: number;
  /** Rows with a value at or below x. */
  atOrBelow: number;
  /** Rows with a value at or above x. */
  atOrAbove: number;
  /** Source rows with exactly this value. */
  ids: number[];
}

export interface EcdfCurve {
  key: string;
  label: string;
  value: datum;
  color: string;
  overall: boolean;
  /** Rows with a valid value: the denominator for every share. */
  count: number;
  steps: EcdfStep[];
  path: string;
  /** Where the curve crosses each marked level. */
  quantiles: { level: number; x: number; px: number; py: number }[];
}

export interface EcdfPlan {
  revision: string;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
  field: string;
  fieldLabel: string;
  groupLabel?: string;
  direction: EcdfSettings["direction"];
  log: boolean;
  /** True when log was asked for but a value is zero or negative. */
  logUnavailable: boolean;
  domain: [number, number];
  xTicks: { x: number; label: string }[];
  yTicks: { y: number; label: string }[];
  curves: EcdfCurve[];
  /** Every distinct live value, sorted. Pointer and keys snap to these. */
  values: number[];
  /** Live rows without a usable value, by reason. */
  excluded: { reason: string; count: number }[];
  liveCount: number;
  validCount: number;
  /** Groups past the limit, merged into one Other curve. */
  otherGroups: number;
  selection?: { filter: RangeFilter; x0: number; x1: number };
  scopeNote: string;
  px: (value: number) => number;
  py: (share: number) => number;
}

export interface EcdfPlanInput {
  settings: EcdfSettings;
  width: number;
  height: number;
  snapshot: EcdfSnapshot;
  getFieldLabel: (field: string) => string;
  formatFieldValue?: (field: string, value: datum) => string;
}

export const MAX_ECDF_GROUPS = 10;
const QUANTILE_LEVELS = [0.5, 0.9];
const ONE_COLOR = "#3479a8";
const OTHER_COLOR = "#8a94a3";

/** Number of sorted values at or below `x`. */
function countAtOrBelow(sorted: number[], x: number) {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (sorted[mid]! <= x) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

/** Number of sorted values strictly below `x`. */
function countBelow(sorted: number[], x: number) {
  let low = 0;
  let high = sorted.length;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (sorted[mid]! < x) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}

export function buildSteps(
  entries: { id: number; value: number }[]
): EcdfStep[] {
  const sorted = entries
    .slice()
    .sort((a, b) => a.value - b.value || a.id - b.id);
  const steps: EcdfStep[] = [];
  sorted.forEach((entry, index) => {
    const last = steps[steps.length - 1];
    if (last && last.x === entry.value) {
      last.ids.push(entry.id);
      last.atOrBelow = index + 1;
    } else {
      steps.push({
        x: entry.value,
        atOrBelow: index + 1,
        atOrAbove: sorted.length - index,
        ids: [entry.id],
      });
    }
  });
  return steps;
}

/** The share a curve reads at x, in the chart's direction. */
export function shareAt(
  curve: EcdfCurve,
  x: number,
  direction: EcdfSettings["direction"]
) {
  if (!curve.count) {
    return 0;
  }
  const xs = curve.steps.map((step) => step.x);
  if (direction === "below") {
    const index = countAtOrBelow(xs, x) - 1;
    return index < 0 ? 0 : curve.steps[index]!.atOrBelow / curve.count;
  }
  const index = countBelow(xs, x);
  return index >= curve.steps.length
    ? 0
    : curve.steps[index]!.atOrAbove / curve.count;
}

/** Rows of a curve whose value falls inside an inclusive range. */
export function countInRange(curve: EcdfCurve, min?: number, max?: number) {
  return curve.steps.reduce(
    (total, step) =>
      (min === undefined || step.x >= min) &&
      (max === undefined || step.x <= max)
        ? total + step.ids.length
        : total,
    0
  );
}

/** Source rows of a curve at or past x, in the chart's direction. */
export function idsThrough(
  curve: EcdfCurve,
  x: number,
  direction: EcdfSettings["direction"]
) {
  return curve.steps
    .filter((step) => (direction === "below" ? step.x <= x : step.x >= x))
    .flatMap((step) => step.ids);
}

function crossing(
  steps: EcdfStep[],
  count: number,
  level: number,
  direction: EcdfSettings["direction"]
) {
  if (!count) {
    return undefined;
  }
  if (direction === "below") {
    return steps.find((step) => step.atOrBelow / count >= level)?.x;
  }
  let found: number | undefined;
  for (const step of steps) {
    if (step.atOrAbove / count >= level) {
      found = step.x;
    }
  }
  return found;
}

export function planEcdf({
  settings,
  width,
  height,
  snapshot,
  getFieldLabel,
  formatFieldValue,
}: EcdfPlanInput): EcdfPlan {
  const field = settings.field;
  const direction = settings.direction;
  const format = (value: number) =>
    formatFieldValue
      ? formatFieldValue(field, value)
      : value.toLocaleString("en-US", { maximumFractionDigits: 3 });

  // The x range covers every row so the axis holds still while other charts filter.
  let low = Infinity;
  let high = -Infinity;
  for (const id of snapshot.allIds) {
    const value = finiteNumber(snapshot.values[id]);
    if (value === undefined) {
      continue;
    }
    if (value < low) {
      low = value;
    }
    if (value > high) {
      high = value;
    }
  }
  if (low === Infinity) {
    low = 0;
    high = 1;
  }
  const logUnavailable = settings.logX && low <= 0;
  const log = settings.logX && !logUnavailable;

  // Live values by group.
  const excludedReasons = new Map<string, number>();
  const groups = new Map<
    string,
    { value: datum; entries: { id: number; value: number }[] }
  >();
  const all: { id: number; value: number }[] = [];
  for (const id of snapshot.liveIds) {
    const raw = snapshot.values[id];
    const reason = numericExclusionReason(raw);
    if (reason) {
      excludedReasons.set(reason, (excludedReasons.get(reason) ?? 0) + 1);
      continue;
    }
    const entry = { id, value: Number(raw) };
    all.push(entry);
    if (!settings.colorField) {
      continue;
    }
    const groupValue = categoryValue(snapshot.groupData?.[id]);
    const key = categoryKey(groupValue);
    const group = groups.get(key);
    if (group) {
      group.entries.push(entry);
    } else {
      groups.set(key, { value: groupValue, entries: [entry] });
    }
  }

  // Quantile names sit in a right gutter so they never cross a curve, and
  // a status line sits under the axis title.
  const margin = {
    top: settings.margin.top + 6,
    right: settings.margin.right + (settings.showQuantiles ? 34 : 0),
    bottom: settings.margin.bottom + 58,
    left: settings.margin.left + 40,
  };
  const plotWidth = Math.max(0, width - margin.left - margin.right);
  const plotHeight = Math.max(0, height - margin.top - margin.bottom);
  const xTickCount = Math.max(2, Math.min(10, Math.floor(plotWidth / 80)));
  const scale = log
    ? scaleLog().domain([low, high]).range([0, plotWidth])
    : scaleLinear().domain([low, high]).range([0, plotWidth]);
  if (!log && low !== high) {
    scale.nice(xTickCount);
  }
  const domain = scale.domain() as [number, number];
  const px = (value: number) =>
    low === high
      ? plotWidth / 2
      : Math.max(0, Math.min(plotWidth, scale(value)));
  const py = (share: number) => (1 - share) * plotHeight;
  const ticks = low === high ? [low] : scale.ticks(xTickCount);
  // Log ticks include every minor step; keep the ones that will not collide.
  const tickEvery = Math.max(1, Math.ceil(ticks.length / xTickCount));
  const xTicks = ticks
    .filter((_, index) => !log || index % tickEvery === 0)
    .map((value) => ({ x: px(value), label: format(value) }));
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((share) => ({
    y: py(share),
    label: `${Math.round(share * 100)}%`,
  }));

  // Colors follow the shared color scale when the chart has one.
  const resolve = snapshot.colorScale
    ? makeColorScale(snapshot.colorScale)
    : null;
  const ranked = [...groups].sort(
    (a, b) =>
      b[1].entries.length - a[1].entries.length ||
      categoryLabel(a[1].value).localeCompare(categoryLabel(b[1].value))
  );
  const shown = ranked.slice(0, MAX_ECDF_GROUPS);
  const rest = ranked.slice(MAX_ECDF_GROUPS);
  const groupFormat = (value: datum) =>
    value != null &&
    typeof value !== "string" &&
    formatFieldValue &&
    settings.colorField
      ? formatFieldValue(settings.colorField, value)
      : categoryLabel(value);

  const makeCurve = (
    key: string,
    label: string,
    value: datum,
    color: string,
    entries: { id: number; value: number }[],
    overall = false
  ): EcdfCurve => {
    const steps = buildSteps(entries);
    const count = entries.length;
    let path = "";
    if (steps.length) {
      const start = px(domain[0]);
      const end = px(domain[1]);
      if (direction === "below") {
        path = `M${start},${py(0)}H${px(steps[0]!.x)}`;
        steps.forEach((step, index) => {
          path += `V${py(step.atOrBelow / count)}`;
          const next = steps[index + 1];
          path += `H${next ? px(next.x) : end}`;
        });
      } else {
        path = `M${start},${py(1)}H${px(steps[0]!.x)}`;
        steps.forEach((step, index) => {
          const next = steps[index + 1];
          path += `V${py(next ? next.atOrAbove / count : 0)}`;
          if (next) {
            path += `H${px(next.x)}`;
          }
        });
        path += `H${end}`;
      }
    }
    return {
      key,
      label,
      value,
      color,
      overall,
      count,
      steps,
      path,
      quantiles: settings.showQuantiles
        ? QUANTILE_LEVELS.flatMap((level) => {
            const x = crossing(steps, count, level, direction);
            return x === undefined
              ? []
              : [{ level, x, px: px(x), py: py(level) }];
          })
        : [],
    };
  };

  const curves: EcdfCurve[] = [];
  if (settings.colorField) {
    shown.forEach(([key, group], index) => {
      const fallback =
        snapshot.themeColors?.categorical ?? defaultCategoricalColors;
      let color = fallback[index % fallback.length]!;
      if (resolve) {
        try {
          color = resolve(group.value);
        } catch {
          // Keep the palette color.
        }
      }
      curves.push(
        makeCurve(
          key,
          groupFormat(group.value),
          group.value,
          color,
          group.entries
        )
      );
    });
    if (rest.length) {
      curves.push(
        makeCurve(
          "__other__",
          `Other (${rest.length})`,
          null,
          OTHER_COLOR,
          rest.flatMap(([, group]) => group.entries)
        )
      );
    }
    if (settings.showOverall) {
      curves.push(
        makeCurve("__all__", "All rows", null, "var(--foreground)", all, true)
      );
    }
  } else {
    curves.push(
      makeCurve("__all__", getFieldLabel(field), null, ONE_COLOR, all, true)
    );
  }

  const filter = settings.filters.find(
    (item): item is RangeFilter => item.type === "range" && item.field === field
  );
  const values = [...new Set(all.map((entry) => entry.value))].sort(
    (a, b) => a - b
  );

  return {
    revision: snapshot.revision,
    width,
    height,
    margin,
    plotWidth,
    plotHeight,
    field,
    fieldLabel: getFieldLabel(field),
    groupLabel: settings.colorField
      ? getFieldLabel(settings.colorField)
      : undefined,
    direction,
    log,
    logUnavailable,
    domain,
    xTicks,
    yTicks,
    curves,
    values,
    excluded: [...excludedReasons].map(([reason, count]) => ({
      reason,
      count,
    })),
    liveCount: snapshot.liveIds.length,
    validCount: all.length,
    otherGroups: rest.length,
    selection: filter
      ? {
          filter,
          x0: filter.min === undefined ? 0 : px(filter.min),
          x1: filter.max === undefined ? plotWidth : px(filter.max),
        }
      : undefined,
    scopeNote:
      "Rows after other filters. Each curve's shares use its own rows with a valid value, so curves of different sizes compare fairly.",
    px,
    py,
  };
}

/** The observed value nearest a horizontal position. */
export function snapToValue(plan: EcdfPlan, x: number): number | undefined {
  let best: number | undefined;
  let distance = Infinity;
  for (const value of plan.values) {
    const gap = Math.abs(plan.px(value) - x);
    if (gap < distance) {
      best = value;
      distance = gap;
    }
  }
  return best;
}

/** A click picks a threshold; a drag picks an inclusive span between two observed values. */
export function thresholdFilter(
  field: string,
  direction: EcdfSettings["direction"],
  from: number,
  to?: number
): RangeFilter {
  if (to !== undefined && to !== from) {
    return {
      type: "range",
      field,
      min: Math.min(from, to),
      max: Math.max(from, to),
    };
  }
  return direction === "below"
    ? { type: "range", field, max: from }
    : { type: "range", field, min: from };
}
