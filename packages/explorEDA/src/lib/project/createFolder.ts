/**
 * Text for files a person creates in a project: a source for a data file,
 * and a new analysis. Adding a source appends one line to the project text,
 * so the rest of the file keeps its author's layout.
 */
import { encodeScalar } from "@/lib/dsl/paths";
import {
  connectionLine,
  type ConnectionDefinition,
  type DatabaseSource,
} from "@/lib/dsl/project";
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

/** A source ID for a table, such as `public.Order Lines` → `order-lines`. */
export function sourceIdForTable(table: string, taken: Iterable<string>) {
  return uniqueName(slugify(table.split(".").at(-1)!, "table"), taken);
}

/**
 * Project text with a connection added, after the connections it already
 * has, or after its `project` line. The first creates the project text.
 */
export function addConnectionText(
  existing: string | undefined,
  {
    projectId,
    connection,
  }: { projectId: string; connection: ConnectionDefinition }
) {
  const line = connectionLine(connection);
  if (existing === undefined) {
    return `project @${slugify(projectId, "project")}\n\n${line}\n`;
  }
  const lines = existing.split("\n");
  let lastConnection = -1;
  lines.forEach((item, index) => {
    if (/^connection\s/.test(item)) {
      lastConnection = index;
    }
  });
  if (lastConnection >= 0) {
    lines.splice(lastConnection + 1, 0, line);
    return lines.join("\n");
  }
  const project = lines.findIndex((item) => /^project\s/.test(item));
  lines.splice(project + 1, 0, "", line);
  return lines.join("\n");
}

/**
 * Project text with a source that reads a database: a table, or a query.
 * Its fields, types, and key come from the read, so it is one line.
 */
export function addDatabaseSourceText(
  existing: string | undefined,
  {
    projectId,
    sourceId,
    database,
  }: { projectId: string; sourceId: string; database: DatabaseSource }
) {
  const line = [
    `source @${sourceId}`,
    `db=${encodeScalar(database.connection)}`,
    ...(database.table === undefined
      ? []
      : [`table=${encodeScalar(database.table)}`]),
    ...(database.sql === undefined
      ? []
      : [`sql=${JSON.stringify(database.sql)}`]),
    ...(database.limit === undefined ? [] : [`limit=${database.limit}`]),
  ].join(" ");
  if (existing === undefined) {
    return `project @${slugify(projectId, "project")}\n\n${line}\n`;
  }
  const body = existing.endsWith("\n") ? existing : `${existing}\n`;
  return `${body}\n${line}\n`;
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
 * every field, so charting a data file shows the data at once; the rows
 * open in their own drawer.
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
layout {
  5: fields
}
`
    : head;
}
