import { coverageFeatures } from "@/demos/coverage";

/**
 * What the docs must cover. Chart types come from the chart registry and
 * modes and features from the coverage manifest, so a new one needs a page
 * before the demo builds. Flows and surfaces are listed here.
 */
export const FLOWS = {
  "flow:import": "Load a CSV, JSON, or project file",
  "flow:summary-to-chart": "Go from the field summary to a chart",
  "flow:filter": "Filter across linked charts",
  "flow:trace": "Trace a mark back to its rows",
  "flow:in-place-edit": "Edit titles and axes in place",
  "flow:calculated-fields": "Add calculated fields",
  "flow:dashboard-text": "Write a dashboard as text",
  "flow:saved-views": "Save views and undo changes",
  "flow:projects": "Join tables in a project",
  "flow:export": "Export charts and data",
  "flow:host-embedding": "Embed the workspace in an app",
} as const;

export const SURFACES = {
  "surface:toolbar": "Workspace toolbar",
  "surface:field-list": "Field list",
  "surface:chart-header": "Chart header",
  "surface:settings-popover": "Chart settings",
  "surface:details-dialog": "Chart details",
  "surface:rows-drawer": "Rows drawer",
  "surface:side-panels": "Side panels",
  "surface:filter-chips": "Filter bar",
} as const;

export type FlowTarget = keyof typeof FLOWS;
export type SurfaceTarget = keyof typeof SURFACES;

/** A chart type a page covers, written as its coverage feature id. */
export type ChartTarget = `chart:${string}`;

export type DocsTarget = string;

/** Every target the docs must cover, given the registered chart types. */
export function allTargets(registeredTypes: readonly string[]): DocsTarget[] {
  const targets = new Set<DocsTarget>();
  for (const type of registeredTypes) {
    targets.add(`chart:${type}`);
  }
  for (const feature of coverageFeatures) {
    if (feature.required) {
      targets.add(feature.id);
    }
  }
  for (const target of Object.keys(FLOWS)) {
    targets.add(target);
  }
  for (const target of Object.keys(SURFACES)) {
    targets.add(target);
  }
  return [...targets].sort();
}
