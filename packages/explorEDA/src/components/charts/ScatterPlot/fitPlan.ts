import { finiteNumber } from "@/lib/numeric";
import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { formatFieldValue, hasFieldDisplayFormat } from "@/lib/fieldSettings";
import type { IdType } from "@/providers/DataLayerProvider";
import type { datum } from "@/types/ChartTypes";
import { buildScale } from "../Axis/axisPlan";
import type {
  ScatterPlotSettings,
  ScatterRegressionSettings,
} from "./definition";
import {
  fitEquation,
  fitRegression,
  formatR2,
  type FitOutcome,
  type RegressionMethod,
} from "./regression";
import type { ScatterPlan, ScatterSnapshot } from "./scatterPlan";

export const DEFAULT_FIT_COLOR = "#3479a8";
export const OVERALL_FIT_COLOR = "var(--foreground)";

export const METHOD_NAMES: Record<RegressionMethod, string> = {
  linear: "Linear",
  polynomial: "Polynomial",
  loess: "LOESS",
};

export interface ScatterFit {
  /** "fit:overall" or "fit:group:<category key>". */
  id: string;
  kind: "group" | "overall";
  label: string;
  color: string;
  outcome: FitOutcome;
  /** Rows in this group and facet that pass the other filters. */
  eligible: number;
  /** Eligible rows left out because X or Y is not a finite number. */
  missingX: number;
  missingY: number;
  sourceIds: IdType[];
}

export interface ScatterFitPlan {
  method: RegressionMethod;
  settings: ScatterRegressionSettings;
  /** Why no fit can run for this chart, such as a categorical axis. */
  notice?: string;
  fits: ScatterFit[];
  groupField?: string;
  /** Group fits share one color when the color scale is numeric. */
  groupNote?: string;
  facet?: { label: string; rows: number };
}

/** Collapses a row list into a short, order-sensitive signature. */
function hashIds(ids: IdType[]) {
  let hash = 2166136261;
  for (const id of ids) {
    hash ^= Number(id);
    hash = Math.imul(hash, 16777619);
  }
  return `${ids.length}:${hash >>> 0}`;
}

/**
 * Everything a fit depends on. This chart's own brush is not part of it, so a
 * selection never refits; other filters change the eligible rows and do.
 */
export function fitInputKey(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  plan: ScatterPlan
) {
  const [dataRevision] = snapshot.revision.split(":");
  return JSON.stringify([
    dataRevision,
    settings.regression,
    settings.summary,
    settings.xField,
    settings.yField,
    settings.colorField,
    settings.colorScaleId,
    plan.xScale.type,
    plan.yScale.type,
    plan.legend?.items.map((item) => [item.id, item.color]),
    hashIds(plan.rowSets.facet),
  ]);
}

export function facetLabel(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot
) {
  const first = snapshot.facetIds?.[0];
  if (!settings.facet.enabled || first === undefined) return undefined;
  const value = (field: string, data?: Record<IdType, datum>) =>
    `${field} ${categoryLabel(categoryValue(data?.[first]))}`;
  return [
    value(settings.facet.rowVariable, snapshot.facetRowData),
    settings.facet.type === "grid" &&
      value(settings.facet.columnVariable, snapshot.facetColumnData),
  ]
    .filter(Boolean)
    .join(" · ");
}

export interface ScatterFitGroup {
  id: string;
  key?: string;
  label: string;
  color: string;
  ids: IdType[];
}

/**
 * The analysis population: rows in this facet that pass the other charts'
 * filters, split by categorical color in legend order.
 */
export function groupScatterRows(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  plan: ScatterPlan
) {
  const categorical = plan.legend?.type === "categorical";
  const groups = new Map<string, ScatterFitGroup>();
  if (categorical) {
    for (const item of plan.legend!.items)
      groups.set(item.id, {
        id: `group:${item.id}`,
        key: item.id,
        label: item.label,
        color: item.color,
        ids: [],
      });
  }
  const all = plan.rowSets.facet;
  if (categorical)
    for (const id of all) {
      const key = categoryKey(snapshot.colorData[id]);
      let group = groups.get(key);
      if (!group) {
        const value = categoryValue(snapshot.colorData[id]);
        group = {
          id: `group:${key}`,
          key,
          label: hasFieldDisplayFormat(
            snapshot.fieldSettings[settings.colorField!]
          )
            ? formatFieldValue(
                settings.colorField!,
                value,
                snapshot.fieldSettings[settings.colorField!]
              )
            : categoryLabel(value),
          color: DEFAULT_FIT_COLOR,
          ids: [],
        };
        groups.set(key, group);
      }
      group.ids.push(id);
    }
  return { categorical, groups: [...groups.values()], all };
}

/**
 * Fits each color group, and optionally all groups together, from the rows in
 * this facet that pass the other filters.
 */
export function planScatterFits(
  settings: ScatterPlotSettings,
  snapshot: ScatterSnapshot,
  plan: ScatterPlan
): ScatterFitPlan | undefined {
  const regression = settings.regression;
  if (!regression) return undefined;
  const method = regression.method;
  const base: ScatterFitPlan = {
    method,
    settings: regression,
    fits: [],
    facet: snapshot.facetIds
      ? {
          label: facetLabel(settings, snapshot) ?? "This facet",
          rows: plan.rowSets.facet.length,
        }
      : undefined,
  };
  if (plan.xScale.type === "band" || plan.yScale.type === "band")
    return {
      ...base,
      notice: `${METHOD_NAMES[method]} fits need numeric X and Y fields. ${
        plan.xScale.type === "band" ? plan.xDisplay : plan.yDisplay
      } is categorical.`,
    };

  const { categorical, groups, all } = groupScatterRows(
    settings,
    snapshot,
    plan
  );

  const fit = (
    id: string,
    kind: ScatterFit["kind"],
    label: string,
    color: string,
    ids: IdType[]
  ): ScatterFit => {
    const xs: number[] = [];
    const ys: number[] = [];
    const sourceIds: IdType[] = [];
    let missingX = 0;
    let missingY = 0;
    for (const sourceId of ids) {
      const x = finiteNumber(snapshot.xData[sourceId]);
      const y = finiteNumber(snapshot.yData[sourceId]);
      if (x === undefined) missingX++;
      else if (y === undefined) missingY++;
      else {
        xs.push(x);
        ys.push(y);
        sourceIds.push(sourceId);
      }
    }
    return {
      id,
      kind,
      label,
      color,
      outcome: fitRegression(method, xs, ys, {
        ...regression,
        xLabel: plan.xDisplay,
      }),
      eligible: ids.length,
      missingX,
      missingY,
      sourceIds,
    };
  };

  const fits: ScatterFit[] = [];
  if (categorical) {
    if (regression.overall)
      fits.push(
        fit("fit:overall", "overall", "All groups", OVERALL_FIT_COLOR, all)
      );
    for (const group of groups) {
      // A group with no rows in this facet has nothing to fit or report.
      if (!group.ids.length) continue;
      fits.push(
        fit(
          `fit:group:${group.key}`,
          "group",
          group.label,
          group.color,
          group.ids
        )
      );
    }
  } else {
    fits.push(
      fit(
        "fit:overall",
        "overall",
        "All rows",
        // Over a density surface, a blue line would blend into blue counts.
        settings.colorField ||
          settings.display === "hexbin" ||
          settings.display === "contour"
          ? OVERALL_FIT_COLOR
          : DEFAULT_FIT_COLOR,
        all
      )
    );
  }
  return {
    ...base,
    fits,
    groupField: categorical ? settings.colorField : undefined,
    groupNote:
      settings.colorField && !categorical
        ? "Color uses a numeric scale, so every row fits as one group."
        : undefined,
  };
}

export interface FitMark {
  id: string;
  color: string;
  dashed: boolean;
  path: string;
  label: string;
}

/** Samples each fitted curve in data space and maps it through the axes. */
export function planFitMarks(
  fits: ScatterFitPlan | undefined,
  plan: ScatterPlan
) {
  if (!fits || fits.notice) return [];
  if (plan.xScale.type === "band" || plan.yScale.type === "band") return [];
  const xScale = buildScale(plan.xScale) as (value: number) => number;
  const invertX = (
    buildScale(plan.xScale) as unknown as { invert: (px: number) => number }
  ).invert;
  const yScale = buildScale(plan.yScale) as (value: number) => number;
  const straight =
    plan.xScale.type === "linear" &&
    plan.yScale.type === "linear" &&
    fits.method === "linear";
  const marks: FitMark[] = [];
  for (const fit of fits.fits) {
    const outcome = fit.outcome;
    if (!outcome.ok) continue;
    const [x0, x1] = outcome.xRange;
    const p0 = xScale(x0);
    const p1 = xScale(x1);
    const steps = straight
      ? 1
      : Math.max(8, Math.min(96, Math.round(Math.abs(p1 - p0) / 4)));
    const points: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x =
        i === 0 ? x0 : i === steps ? x1 : invertX(p0 + ((p1 - p0) * i) / steps);
      const px = xScale(x);
      const py = yScale(outcome.predict(x));
      if (!Number.isFinite(px) || !Number.isFinite(py)) continue;
      points.push(
        `${points.length ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`
      );
    }
    if (points.length < 2) continue;
    marks.push({
      id: fit.id,
      color: fit.color,
      dashed: fit.kind === "overall" && fits.fits.length > 1,
      path: points.join(""),
      label: `${fit.label} ${METHOD_NAMES[fits.method].toLowerCase()} fit: ${fitSummary(fit)}`,
    });
  }
  return marks;
}

/** The equation and fit quality one label shows. */
export function fitSummary(fit: ScatterFit) {
  const outcome = fit.outcome;
  if (!outcome.ok) return "unavailable";
  // A local smooth has no equation; its R² compares residuals to the mean.
  if (outcome.method === "loess")
    return [
      `LOESS span ${outcome.span}`,
      outcome.r2 !== undefined && `pseudo R² ${formatR2(outcome.r2)}`,
    ]
      .filter(Boolean)
      .join(" · ");
  return [
    fitEquation(outcome),
    outcome.r2 !== undefined && `R² ${formatR2(outcome.r2)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}
