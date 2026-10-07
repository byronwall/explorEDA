import type { SavedDataStructure } from "@/types/SavedDataStructure";
import {
  compileDocument,
  viewHeaders,
  type DslChartResult,
  type DslCompileOptions,
  type DslDiagnostic,
} from "./compile";
import { exportParts, type DslExportOptions } from "./export";
import { parseDocument } from "./parse";
import { encodeScalar } from "./paths";

/** One saved view: a name and the dashboard it shows. */
export interface DslView {
  name: string;
  settings: SavedDataStructure;
}

export interface DslViewResult extends DslView {
  /** The `view` line, or undefined for text without one. */
  line?: number;
  charts: DslChartResult[];
  skippedCharts: DslChartResult[];
}

export interface DslViewsResult {
  /** The `dashboard name=` value, which names the whole set of views. */
  name: string;
  views: DslViewResult[];
  /** Every problem once, even when it touches several views. */
  diagnostics: DslDiagnostic[];
  charts: DslChartResult[];
  skippedCharts: DslChartResult[];
  complete: boolean;
}

export interface DslViewsExportOptions extends DslExportOptions {
  /** Names the set of views. Defaults to the first view's name. */
  name?: string;
}

/** The parts of a saved view that every view shares. */
const SHARED_KEYS = [
  "calculations",
  "colorScales",
  "fieldSettings",
  "aggregates",
] as const;

function sharedSignature(settings: SavedDataStructure) {
  return JSON.stringify(
    SHARED_KEYS.map((key) =>
      key === "fieldSettings" ? (settings[key] ?? {}) : (settings[key] ?? [])
    )
  );
}

/**
 * Builds every view from text. Text without `view` lines is one view. Shared
 * definitions (fields, calculations, color scales, grouped summaries) hold
 * for every view; the grid, the Rows view, and charts belong to the `view`
 * section they sit in.
 */
export function compileViews(
  text: string,
  options: DslCompileOptions
): DslViewsResult {
  const { declarations } = parseDocument(text);
  const headers = viewHeaders(declarations);
  const dashboard = declarations.find((item) => item.keyword === "dashboard");
  const named = dashboard?.pairs.find((pair) => pair.key === "name")?.value
    .items[0]?.text;

  const views = (headers.length ? headers : [undefined]).map(
    (header, index) => {
      const result = compileDocument(text, options, {
        view: header ? index : undefined,
      });
      return {
        name: result.settings.metadata.name,
        line: header?.span.line,
        settings: result.settings,
        charts: result.charts,
        skippedCharts: result.skippedCharts,
        diagnostics: result.diagnostics,
      };
    }
  );

  // A chart's color= adds a scale to its own view only. Scales are shared,
  // so every view gets each one; generated IDs match across views.
  const scales = new Map(
    views
      .flatMap((view) => view.settings.colorScales)
      .map((scale) => [scale.id, scale])
  );
  for (const view of views) {
    view.settings.colorScales = [...scales.values()];
  }

  // Shared lines are checked once per view; report each problem once.
  const seen = new Set<string>();
  const diagnostics = views
    .flatMap((view) => view.diagnostics)
    .filter((item) => {
      const key = `${item.line}:${item.column}:${item.message}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.line - b.line || a.column - b.column);

  return {
    name: named ?? options.name ?? views[0]!.name,
    views: views.map(({ diagnostics: _, ...view }) => view),
    diagnostics,
    charts: views.flatMap((view) => view.charts),
    skippedCharts: views.flatMap((view) => view.skippedCharts),
    complete: diagnostics.length === 0,
  };
}

/**
 * Writes a set of views as one text that rebuilds all of them. Shared
 * definitions come first, once; then each view's own lines follow its
 * `view "Name"` line.
 */
export function exportViews(
  views: DslView[],
  options: DslViewsExportOptions
): { text: string; omitted: string[] } {
  const first = views[0];
  if (!first) {
    return { text: "", omitted: [] };
  }
  const omitted: string[] = [];
  const signature = sharedSignature(first.settings);
  const parts = views.map((view) => {
    if (sharedSignature(view.settings) !== signature) {
      omitted.push(
        `${view.name}: its own fields, calculations, color scales, or grouped summaries; the text gives it those of ${first.name}`
      );
    }
    // Every view writes against the shared definitions of the first one.
    const result = exportParts(
      {
        ...view.settings,
        ...Object.fromEntries(
          SHARED_KEYS.map((key) => [key, first.settings[key]])
        ),
      },
      options
    );
    omitted.push(...result.omitted.map((item) => `${view.name}: ${item}`));
    return result;
  });

  // A grid every view shares is written once; a view's own grid overrides it.
  const grids = new Set(parts.map((part) => part.view[0]?.join("\n") ?? ""));
  const sharedGrid = grids.size === 1 ? (parts[0]!.view[0] ?? []) : [];
  const name = options.name ?? first.name;
  const blocks = [
    [`dashboard name=${JSON.stringify(name)}`, ...sharedGrid],
    ...parts[0]!.shared,
    ...parts.map((part, index) => [
      `view ${encodeScalar(views[index]!.name)}`,
      ...(sharedGrid.length ? part.view.slice(1) : part.view).flat(),
    ]),
  ].filter((block) => block.length);
  return {
    text: `${blocks.map((block) => block.join("\n")).join("\n\n")}\n`,
    omitted,
  };
}
