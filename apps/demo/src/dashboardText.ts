import {
  compileViews,
  type DslViewsResult,
  type GeometryAsset,
} from "exploreda";
import type { DatumObject } from "./LandingPage";

/** What the last Apply built, kept so its warnings stay findable. */
export interface AppliedText {
  text: string;
  result: DslViewsResult;
}

export function compileDashboardText(
  text: string,
  rows: DatumObject[],
  geometryAssets?: GeometryAsset[]
) {
  return compileViews(text, { rows, geometryAssets });
}

/** True when the text names its views, so Apply replaces every view. */
export function describesViews(result: DslViewsResult) {
  return result.views.some((view) => view.line !== undefined);
}

/** One line per outcome: what was built and what it cost. */
export function describeResult(result: DslViewsResult) {
  const built = result.charts.length;
  const skipped = result.skippedCharts.length;
  const problems = result.diagnostics.length;
  const parts = [`${built} chart${built === 1 ? "" : "s"}`];
  if (describesViews(result)) {
    const count = result.views.length;
    parts.unshift(`${count} view${count === 1 ? "" : "s"}`);
  }
  if (skipped) {
    parts.push(`${skipped} skipped`);
  }
  if (problems) {
    parts.push(`${problems} problem${problems === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}
