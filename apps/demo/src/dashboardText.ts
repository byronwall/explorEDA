import { compileDocument, type DslCompileResult } from "exploreda";
import type { DatumObject } from "./LandingPage";

/** What the last Apply built, kept so its warnings stay findable. */
export interface AppliedText {
  text: string;
  result: DslCompileResult;
}

export function compileDashboardText(text: string, rows: DatumObject[]) {
  return compileDocument(text, { rows });
}

/** One line per outcome: what was built and what it cost. */
export function describeResult(result: DslCompileResult) {
  const built = result.charts.length;
  const skipped = result.skippedCharts.length;
  const problems = result.diagnostics.length;
  const parts = [`${built} chart${built === 1 ? "" : "s"}`];
  if (skipped) {
    parts.push(`${skipped} skipped`);
  }
  if (problems) {
    parts.push(`${problems} problem${problems === 1 ? "" : "s"}`);
  }
  return parts.join(" · ");
}
