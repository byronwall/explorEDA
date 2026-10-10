import { memo } from "react";
import { PlotChartPanel } from "./PlotChartPanel";

type PanelProps = Parameters<typeof PlotChartPanel>[0];

/**
 * Equal when every value prop is the same object. Callbacks are skipped: the
 * grid recreates them each render, and they close over the chart's settings
 * and store actions only, so equal settings mean equal callbacks. A callback
 * that reads anything else must be stable (useCallback) or this goes stale.
 * A new value prop is compared without any change here.
 */
export function sameGridPanelProps(before: PanelProps, after: PanelProps) {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const a = before[key as keyof PanelProps];
    const b = after[key as keyof PanelProps];
    if (typeof a === "function" && typeof b === "function") continue;
    if (!Object.is(a, b)) return false;
  }
  return true;
}

/**
 * A chart panel in the workspace grid. An edit to one chart re-renders only
 * that panel, as long as the panel's own hooks subscribe narrowly; see
 * docs/performance-checks.md.
 */
export const GridChartPanel = memo(PlotChartPanel, sameGridPanelProps);
