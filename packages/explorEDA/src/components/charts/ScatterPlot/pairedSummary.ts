import { finiteNumber } from "@/lib/valueParsing";
import type { ScatterPlotSettings } from "./definition";
import { facetLabel, groupScatterRows, type ScatterFitGroup } from "./fitPlan";
import type { ScatterPlan, ScatterSnapshot } from "./scatterPlan";

/** Descriptive statistics of paired X and Y values, with n − 1 denominators. */
export interface PairedStats {
  id: string;
  label: string;
  color: string;
  kind: "pooled" | "group";
  /** Rows in this group and facet that pass the other filters. */
  eligible: number;
  pairs: number;
  missingX: number;
  missingY: number;
  meanX?: number;
  meanY?: number;
  sdX?: number;
  sdY?: number;
  /** Sample covariance matrix [[var X, cov], [cov, var Y]]. */
  covariance?: [[number, number], [number, number]];
  /** Pearson correlation; undefined when either field is constant. */
  r?: number;
  /** Why a statistic is missing. */
  note?: string;
}

export function pairedStats(
  group: ScatterFitGroup,
  snapshot: ScatterSnapshot,
  kind: PairedStats["kind"]
): PairedStats {
  const xs: number[] = [];
  const ys: number[] = [];
  let missingX = 0;
  let missingY = 0;
  for (const id of group.ids) {
    const x = finiteNumber(snapshot.xData[id]);
    const y = finiteNumber(snapshot.yData[id]);
    if (x === undefined) missingX++;
    else if (y === undefined) missingY++;
    else {
      xs.push(x);
      ys.push(y);
    }
  }
  const n = xs.length;
  const base: PairedStats = {
    id: group.id,
    label: group.label,
    color: group.color,
    kind,
    eligible: group.ids.length,
    pairs: n,
    missingX,
    missingY,
  };
  if (n === 0) return { ...base, note: "No row has numeric X and Y." };
  let mx = 0;
  let my = 0;
  for (let i = 0; i < n; i++) {
    mx += xs[i]!;
    my += ys[i]!;
  }
  mx /= n;
  my /= n;
  if (n < 2)
    return {
      ...base,
      meanX: mx,
      meanY: my,
      note: "Spread and correlation need at least 2 pairs.",
    };
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx;
    const dy = ys[i]! - my;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const varX = sxx / (n - 1);
  const varY = syy / (n - 1);
  const cov = sxy / (n - 1);
  return {
    ...base,
    meanX: mx,
    meanY: my,
    sdX: Math.sqrt(varX),
    sdY: Math.sqrt(varY),
    covariance: [
      [varX, cov],
      [cov, varY],
    ],
    r: sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : undefined,
    note:
      sxx > 0 && syy > 0
        ? undefined
        : "Correlation is undefined because a field is constant.",
  };
}

export interface PairedSummaryPlan {
  /** Why no summary exists, such as a categorical axis. */
  notice?: string;
  pooled?: PairedStats;
  groups: PairedStats[];
  groupField?: string;
  facet?: string;
}

/** Pooled and per-group summaries for one facet's eligible rows. */
export function planPairedSummary(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  plan: ScatterPlan
): PairedSummaryPlan | undefined {
  if (!settings.summary) return undefined;
  const facet = facetLabel(settings, snapshot);
  if (plan.xScale.type === "band" || plan.yScale.type === "band")
    return {
      notice: `Paired summaries need numeric X and Y fields. ${
        plan.xScale.type === "band" ? plan.xDisplay : plan.yDisplay
      } is categorical.`,
      groups: [],
      facet,
    };
  const { categorical, groups, all } = groupScatterRows(
    settings,
    snapshot,
    plan
  );
  const groupField = categorical ? settings.colorField : undefined;
  return {
    pooled: pairedStats(
      { id: "summary:pooled", label: "All rows", color: "", ids: all },
      snapshot,
      "pooled"
    ),
    groups: groupField
      ? groups
          .filter((group) => group.ids.length)
          .map((group) => pairedStats(group, snapshot, "group"))
      : [],
    groupField,
    facet,
  };
}
