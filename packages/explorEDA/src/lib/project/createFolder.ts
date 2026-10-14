/**
 * Text for files a person creates in a project: a source for a data file,
 * and a new analysis. Adding a source appends one line to the project text,
 * so the rest of the file keeps its author's layout.
 */
import { encodeScalar } from "@/lib/dsl/paths";
import { analysisNameFromPath } from "./folder";

/** A name made safe for an ID or a file: lowercase words joined by `-`. */
export function slugify(text: string, fallback = "untitled") {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

/** `base`, or `base-2`, `base-3`… when it is taken. */
export function uniqueName(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  let name = base;
  for (let n = 2; used.has(name); n += 1) {
    name = `${base}-${n}`;
  }
  return name;
}

/** A source ID for a data file, such as `data/Sales 2024.csv` → `sales-2024`. */
export function sourceIdForFile(path: string, taken: Iterable<string>) {
  return uniqueName(slugify(path.split("/").at(-1)!, "data"), taken);
}

/** A file for a new analysis named `name`, at the folder's top level. */
export function analysisPathFor(name: string, taken: Iterable<string>) {
  const used = new Set([...taken].map((path) => path.toLowerCase()));
  const base = slugify(name, "analysis");
  let path = `${base}.eda`;
  for (let n = 2; used.has(path); n += 1) {
    path = `${base}-${n}.eda`;
  }
  return path;
}

/**
 * Project text with a source for a data file added. Its fields and key come
 * from the data, so the declaration is one line.
 */
export function addSourceText(
  existing: string | undefined,
  {
    projectId,
    sourceId,
    path,
  }: { projectId: string; sourceId: string; path: string }
) {
  const line = `source @${sourceId} path=${encodeScalar(path)}\n`;
  if (existing === undefined) {
    return `project @${slugify(projectId, "project")}\n\n${line}`;
  }
  const body = existing.endsWith("\n") ? existing : `${existing}\n`;
  return `${body}\n${line}`;
}

/**
 * A new analysis that charts one query. `starter` opens it on a summary of
 * every field and the rows themselves, so charting a data file shows the
 * data at once.
 */
export function newAnalysisText(
  queryId: string,
  path: string,
  name?: string,
  { starter = false }: { starter?: boolean } = {}
) {
  const title = name ?? analysisNameFromPath(path);
  const head = `eda query=${queryId}\ndashboard ${JSON.stringify(title)}\n`;
  return starter
    ? `${head}
summary @fields title=Fields
table @rows title=Rows
layout {
  5: fields
  5: rows
}
`
    : head;
}
