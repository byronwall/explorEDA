import { compileViews, readNotebookText } from "exploreda";
import { compileProjectText, evaluateAnalysisQuery } from "exploreda/analysis";
import type { DeclaredFieldType } from "exploreda/readers";
import { parseTable } from "../demos/analyses/loadAnalysis";
import catalog from "../../public/daily-viz/catalog.json";
import datasets from "../../public/daily-viz/datasets.json";

export type DailyEntry = (typeof catalog)[number];
export const dailyEntries = catalog;
export const dailyDatasets = datasets;
export const kindLabels: Record<string, string> = {
  notebook: "Notebook",
  composition: "Composition",
  dashboard: "Dashboard",
};
export const dailyPath = (entry: DailyEntry) => `/daily/${entry.proposed_slug}`;
export const assetPath = (file: string) => `/daily-viz/${file}`;

/** Markdown links keep their project-folder meaning when shown at a page URL. */
export function articleLinks(text: string, file: string) {
  return text.replace(/\]\(([^)]+)\)/g, (match, href: string) => {
    if (/^(?:[a-z]+:|\/|#)/i.test(href)) return match;
    const url = new URL(href, `https://exploreda.dev${assetPath(file)}`);
    return `](${url.pathname}${url.hash})`;
  });
}

async function read(file: string, signal?: AbortSignal) {
  const response = await fetch(assetPath(file), { signal });
  if (!response.ok)
    throw new Error(`Could not load ${file} (${response.status}).`);
  return response.text();
}

/** Reads the same project contracts, local data, and text used by the folder viewer. */
export async function loadDailyEntry(entry: DailyEntry, signal?: AbortSignal) {
  const [text, projectText] = await Promise.all([
    read(entry.entry_path, signal),
    read(entry.project_path, signal),
  ]);
  const compiled = compileProjectText(projectText);
  if (compiled.diagnostics.length)
    throw new Error(compiled.diagnostics[0]!.message);
  const folder = entry.project_path.slice(
    0,
    entry.project_path.lastIndexOf("/") + 1
  );
  const tables = Object.fromEntries(
    await Promise.all(
      Object.entries(compiled.paths).map(async ([id, file]) => [
        id,
        await parseTable(await read(folder + file, signal)),
      ])
    )
  );
  const query = evaluateAnalysisQuery(compiled.project, tables, entry.query_id);
  if (query.diagnostics.length) throw new Error(query.diagnostics[0]!.message);
  const rows = query.rows.map((row) => row.data);
  const fieldTypes: Record<string, DeclaredFieldType> = {};
  for (const field of query.fields) {
    if (field.type && field.type !== "unknown")
      fieldTypes[field.id] = field.type;
  }
  const result =
    entry.kind === "notebook"
      ? readNotebookText(text, { project: compiled.project, tables })
      : compileViews(text, { rows });
  if (result.diagnostics.length)
    throw new Error(result.diagnostics[0]!.message);
  const companion = entry.companion_path
    ? await read(entry.companion_path, signal)
    : "";
  return {
    text: articleLinks(text, entry.entry_path),
    rows,
    fieldTypes,
    companion: entry.companion_path
      ? articleLinks(companion, entry.companion_path).replace(/^# .+\n/, "")
      : "",
    settings: "views" in result ? result.views[0]!.settings : result.settings,
  };
}
