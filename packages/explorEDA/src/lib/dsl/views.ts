import type { SavedDataStructure } from "@/types/SavedDataStructure";
import {
  compileDocument,
  viewHeaders,
  type DslChartResult,
  type DslCompileOptions,
  type DslDiagnostic,
} from "./compile";
import {
  exportParts,
  type DslChartPart,
  type DslExportOptions,
  type DslExportParts,
} from "./export";
import { block } from "./print";
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
  options: DslCompileOptions,
  /** Options for one view, such as rows from that view's own query. */
  optionsFor?: (view: number) => DslCompileOptions
): DslViewsResult {
  const { declarations } = parseDocument(text);
  const headers = viewHeaders(declarations);
  const dashboard = declarations.find((item) => item.keyword === "dashboard");
  const named = (
    dashboard?.positional[0]?.value ??
    dashboard?.pairs.find((pair) => pair.key === "name")?.value
  )?.items[0]?.text;

  const views = (headers.length ? headers : [undefined]).map(
    (header, index) => {
      const result = compileDocument(text, optionsFor?.(index) ?? options, {
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
 * definitions come first, once; then each view's own lines sit in its
 * `view "Name" { }` body.
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
  const gridOf = (part: DslExportParts) =>
    (part.view[0] ?? []).filter((line) => line.startsWith("grid"));
  const grids = new Set(parts.map((part) => gridOf(part).join("\n")));
  const sharedGrid = grids.size === 1 ? gridOf(parts[0]!) : [];
  const name = options.name ?? first.name;

  // A chart in several views is defined once above them; each view names it
  // in order, with only the settings and child lines it changes.
  const variants = new Map<string, DslChartPart[]>();
  for (const part of parts) {
    for (const chart of part.charts) {
      variants.set(chart.id, [...(variants.get(chart.id) ?? []), chart]);
    }
  }
  const shared = new Map<string, { tokens: Set<string>; children: boolean }>();
  for (const [id, list] of variants) {
    if (list.length < 2 || new Set(list.map((item) => item.head)).size > 1) {
      continue;
    }
    const tokens = new Set(
      list[0]!.tokens.filter((token) =>
        list.every((item) => item.tokens.includes(token))
      )
    );
    const children = list.every(
      (item) => item.children.join("\n") === list[0]!.children.join("\n")
    );
    shared.set(id, { tokens, children });
  }
  const library: string[] = [];
  const defined = new Set<string>();
  for (const part of parts) {
    for (const chart of part.charts) {
      const entry = shared.get(chart.id);
      if (!entry || defined.has(chart.id)) continue;
      defined.add(chart.id);
      library.push(
        ...block(
          chart.head,
          chart.tokens.filter((token) => entry.tokens.has(token)),
          entry.children ? chart.children : []
        )
      );
    }
  }
  const viewCharts = (part: DslExportParts) =>
    part.charts.flatMap((chart) => {
      const entry = shared.get(chart.id);
      if (!entry) {
        return block(chart.head, chart.tokens, chart.children);
      }
      return block(
        /^[\w-]+$/.test(chart.name) ? chart.name : JSON.stringify(chart.name),
        chart.tokens.filter((token) => !entry.tokens.has(token)),
        entry.children ? [] : chart.children
      );
    });

  const blocks = [
    [`dashboard ${JSON.stringify(name)}`, ...sharedGrid],
    ...parts[0]!.shared,
    library,
    ...parts.map((part, index) => [
      `view ${encodeScalar(views[index]!.name)} {`,
      ...[
        ...(part.view[0] ?? []).filter(
          (line) => !sharedGrid.length || !line.startsWith("grid")
        ),
        ...part.context,
        ...viewCharts(part),
        ...part.layout,
      ].map((line) => `  ${line}`),
      "}",
    ]),
  ].filter((block) => block.length);
  return {
    text: `${blocks.map((block) => block.join("\n")).join("\n\n")}\n`,
    omitted,
  };
}
