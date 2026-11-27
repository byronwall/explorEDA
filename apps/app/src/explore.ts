import {
  readAnalysisText,
  type AnalysisProject,
  type AnalysisSourceRow,
  type AnalysisView,
} from "exploreda";

/** The ID of the unsaved view that explores a source. */
export const exploreId = (sourceId: string) => `explore:${sourceId}`;

/**
 * What changed in an explored source's unsaved view: its charts, filters,
 * inputs, and inspection. It holds only while the source's query is as it
 * was, so `query` keeps that query's text to compare.
 */
export interface ExploreDraft {
  source: string;
  query: string;
  view: Partial<AnalysisView>;
}

/** The source's own query as text, to tell when it changed. */
export const ownQuery = (project: AnalysisProject, sourceId: string) =>
  JSON.stringify(project.queries.find((query) => query.id === sourceId));

/**
 * Dashboard text for exploring one source: the summary of every field
 * beside every row. Every source has a query of its own ID that reads it.
 */
export function exploreText(sourceId: string, name: string) {
  return `eda query=${sourceId}
dashboard ${JSON.stringify(name)}
summary @fields title=Fields
table @rows title=Rows
layout {
  10: fields:6 rows:6
}
`;
}

/** Which analyses read a source, in a few words. */
export function usedByText(names: string[] = []) {
  if (!names.length) return "not in an analysis yet";
  if (names.length <= 2) return `used by ${names.join(" and ")}`;
  return `used by ${names[0]} and ${names.length - 1} more`;
}

/** A name no analysis has yet: the source's name, then "Orders 2" and on. */
export function savedName(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  let name = base;
  for (let n = 2; used.has(name); n += 1) name = `${base} ${n}`;
  return name;
}

/** The unsaved view a click on a source opens, or undefined without one. */
export function exploreView(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  sourceId: string
): AnalysisView | undefined {
  const source = project.sources.find((item) => item.id === sourceId);
  if (!source || !project.queries.some((query) => query.id === sourceId)) {
    return undefined;
  }
  const text = exploreText(sourceId, source.name);
  const read = (from: typeof tables) =>
    readAnalysisText(text, { project, tables: from, defaultQueryId: sourceId })
      .views[0]?.settings;
  let settings = read(tables);
  // A table with no rows still lists its declared fields: they come from
  // one empty row, while the view itself reads the real rows.
  if (
    settings &&
    !settings.charts.some((chart) => chart.type === "data-table") &&
    source.fields.length
  ) {
    const empty = Object.fromEntries(
      source.fields.map((field) => [field.id, null])
    );
    settings = read({ ...tables, [sourceId]: [empty] }) ?? settings;
  }
  return settings
    ? {
        id: exploreId(sourceId),
        name: source.name,
        queryId: sourceId,
        settings,
      }
    : undefined;
}
