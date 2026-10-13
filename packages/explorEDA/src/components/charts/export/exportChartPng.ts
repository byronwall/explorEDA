import type { ChartSettings } from "@/types/ChartTypes";
import { ChartExportError, captureChartPanel } from "./chartImage";
import type { ChartImage } from "./rasterizePanel";

export interface ExportChartPngOptions {
  /** Image pixels per CSS pixel. Defaults to 2. */
  pixelRatio?: number;
}

/**
 * Finds a mounted chart panel: in this workspace's grid first, then in an
 * open details view, which renders outside the grid.
 */
function mountedPanel(root: HTMLElement | null, chartId: string) {
  const selector = `.eda-panel[data-chart-panel="${CSS.escape(chartId)}"]`;
  return (
    root?.querySelector<HTMLElement>(selector) ??
    Array.from(document.querySelectorAll("[role='dialog']"))
      .map((dialog) => dialog.querySelector<HTMLElement>(selector))
      .find(Boolean) ??
    null
  );
}

/**
 * A chart's PNG as drawn, the same image Download image saves. The chart must
 * be rendered; one scrolled out of the grid's view still counts.
 */
export function exportWorkspaceChartPng(
  root: HTMLElement | null,
  charts: ChartSettings[],
  chartId: string,
  options?: ExportChartPngOptions
): Promise<ChartImage> {
  const chart = charts.find((item) => item.id === chartId);
  if (!chart) {
    return Promise.reject(
      new ChartExportError(`No chart with id "${chartId}".`)
    );
  }
  const panel = mountedPanel(root, chartId);
  if (!panel) {
    return Promise.reject(new ChartExportError("Chart is not rendered."));
  }
  return captureChartPanel(panel, chart, options);
}
