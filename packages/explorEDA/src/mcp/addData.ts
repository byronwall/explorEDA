/**
 * `add_data`: an agent starts a project from data. It copies a local CSV
 * or JSON file in, writes rows it was given, or fetches a CSV or JSON
 * address, then adds a source for the file to the project text.
 */
import { promises as fs } from "node:fs";
import { addSourceText, sourceIdForFile } from "@/lib/project/createFolder";
import {
  isAbsolutePath,
  normalizeProjectPath,
  type ProjectFiles,
} from "@/lib/project/files";
import {
  HIDDEN_PROJECT_FILE,
  PROJECT_FILE,
  projectLayout,
} from "@/lib/project/folder";
import { compileProjectText } from "@/lib/dsl/project";
import { isDataFile, parseTable } from "@/lib/project/tables";
import {
  fields,
  ToolError,
  type FieldsResult,
  type ToolOptions,
} from "./tools";

/** The largest file add_data takes, as the app's upload limit. */
export const MAX_DATA_BYTES = 100 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const FETCH_TIMEOUT_MS = 30_000;

export interface AddDataInput {
  /** Where the file goes in the folder, such as data/sales.csv. */
  path: string;
  /** An absolute path to a CSV or JSON file to copy in. */
  from?: string;
  /** CSV text, JSON text, or an array of rows. */
  rows?: string | unknown[];
  /** An http or https address of a CSV or JSON file. */
  url?: string;
  /** The source's ID; by default, from the file's name. */
  source?: string;
}

export interface AddDataResult {
  saved: string;
  source: string;
  projectPath: string;
  rows: number;
  fields: FieldsResult["queries"][number]["fields"];
  howToUse: string;
}

const megabytes = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

/** Reads a response body, refusing it once it passes the size limit. */
async function readLimited(response: Response, url: string) {
  const declared = Number(response.headers.get("content-length"));
  if (declared > MAX_DATA_BYTES) {
    throw new ToolError(
      `${url} is ${megabytes(declared)}, over the ${megabytes(MAX_DATA_BYTES)} limit.`,
      "Fetch a smaller file, or filter it before adding it."
    );
  }
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_DATA_BYTES) {
      await reader.cancel();
      throw new ToolError(
        `${url} is over the ${megabytes(MAX_DATA_BYTES)} limit.`,
        "Fetch a smaller file, or filter it before adding it."
      );
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Fetches a CSV or JSON address, following at most a few redirects. */
async function fetchText(address: string, timeoutMs = FETCH_TIMEOUT_MS) {
  let url: URL;
  try {
    url = new URL(address);
  } catch {
    throw new ToolError(
      `${address} isn't an address.`,
      "Send an http or https URL."
    );
  }
  const signal = AbortSignal.timeout(timeoutMs);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new ToolError(
        `${url.href} isn't http or https.`,
        "Send an http or https URL."
      );
    }
    let response: Response;
    try {
      response = await fetch(url, { redirect: "manual", signal });
    } catch (error) {
      const reason =
        error instanceof Error && error.name === "TimeoutError"
          ? `didn't answer within ${timeoutMs / 1000} s`
          : `couldn't be reached (${error instanceof Error ? error.message : String(error)})`;
      throw new ToolError(
        `${url.href} ${reason}.`,
        "Check the address, or download the file and add it with from=."
      );
    }
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    if (!response.ok) {
      throw new ToolError(
        `${url.href} answered ${response.status}.`,
        "Check the address."
      );
    }
    const type = response.headers.get("content-type") ?? "";
    if (/html/i.test(type)) {
      throw new ToolError(
        `${url.href} is a web page (${type}), not CSV or JSON.`,
        "Send the address of the data file itself, such as a raw or download link."
      );
    }
    return { text: await readLimited(response, url.href), from: url.href };
  }
  throw new ToolError(
    `${address} redirects more than ${MAX_REDIRECTS} times.`,
    "Send the final address."
  );
}

/** The file's rows, or a ToolError saying why it isn't CSV or JSON rows. */
function rowsOf(path: string, text: string, from: string) {
  if (/^\s*<(!doctype|html)/i.test(text)) {
    throw new ToolError(
      `${from} is a web page, not CSV or JSON.`,
      "Send the data file itself."
    );
  }
  let rows;
  try {
    rows = parseTable(path, text);
  } catch (error) {
    throw new ToolError(
      `${from} isn't ${path.endsWith(".json") ? "a JSON array of rows" : "CSV"}: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`,
      path.endsWith(".json")
        ? "Send a JSON array of objects, or name the file .csv for CSV text."
        : "Send comma-separated text with a header row, or name the file .json for JSON."
    );
  }
  if (!rows.length) {
    throw new ToolError(
      `${from} has no rows.`,
      "Send a header row and at least one row."
    );
  }
  return rows;
}

/**
 * Adds a data file and a source for it. Exactly one of `from`, `rows`, or
 * `url` gives the data. Nothing is written unless the data reads as rows.
 */
export async function addData(
  files: ProjectFiles,
  input: AddDataInput,
  options: ToolOptions & { now?: Date; timeoutMs?: number } = {}
): Promise<AddDataResult> {
  const given = (["from", "rows", "url"] as const).filter(
    (key) => input[key] !== undefined
  );
  if (given.length !== 1) {
    throw new ToolError(
      "Send exactly one of from, rows, or url.",
      "from= copies a local file, rows= writes rows you send, url= fetches a file."
    );
  }
  const path = isAbsolutePath(input.path)
    ? undefined
    : normalizeProjectPath(input.path);
  if (!path || !isDataFile(path) || path.startsWith(".exploreda/")) {
    throw new ToolError(
      `${input.path} isn't a data file path in the folder.`,
      "Name a .csv or .json file inside the folder, such as data/sales.csv."
    );
  }
  const listed = await files.list();
  if (listed.includes(path)) {
    throw new ToolError(
      `${path} already exists.`,
      "Pick a new path; add_data never replaces a file."
    );
  }

  let text: string;
  let note: string | undefined;
  if (input.from !== undefined) {
    if (!isAbsolutePath(input.from)) {
      throw new ToolError(
        `${input.from} isn't an absolute path.`,
        "Send the file's full path, such as /Users/me/sales.csv."
      );
    }
    const stat = await fs.stat(input.from).catch(() => undefined);
    if (!stat?.isFile()) {
      throw new ToolError(`${input.from} isn't a file.`);
    }
    if (stat.size > MAX_DATA_BYTES) {
      throw new ToolError(
        `${input.from} is ${megabytes(stat.size)}, over the ${megabytes(MAX_DATA_BYTES)} limit.`
      );
    }
    text = await fs.readFile(input.from, "utf8");
  } else if (input.rows !== undefined) {
    text =
      typeof input.rows === "string"
        ? input.rows
        : JSON.stringify(input.rows, null, 2);
    if (typeof input.rows !== "string" && !path.endsWith(".json")) {
      throw new ToolError(
        "Rows sent as an array are JSON.",
        `Name the file ${path.replace(/\.csv$/i, ".json")}, or send CSV text.`
      );
    }
  } else {
    const fetched = await fetchText(input.url!, options.timeoutMs);
    text = fetched.text;
    note = `# ${path} fetched from ${fetched.from} on ${(options.now ?? new Date()).toISOString().slice(0, 10)}`;
  }
  const rows = rowsOf(path, text, input.from ?? input.url ?? "rows");

  // The source goes in the project text, where the app would put it.
  const { projectPath: existing } = projectLayout(listed);
  const projectPath =
    existing ?? (options.hidden ? HIDDEN_PROJECT_FILE : PROJECT_FILE);
  const current = existing ? await files.read(existing) : undefined;
  const taken = current
    ? compileProjectText(current).project.sources.map((source) => source.id)
    : [];
  const source = input.source ?? sourceIdForFile(path, taken);
  if (taken.includes(source)) {
    throw new ToolError(
      `A source is already named ${source}.`,
      "Send another source= ID."
    );
  }
  const withSource = addSourceText(current, {
    projectId: path
      .split("/")
      .at(-1)!
      .replace(/\.\w+$/, ""),
    sourceId: source,
    path,
  });
  const projectText = note
    ? withSource.replace(/(source @\S+ path=\S+\n)$/, `${note}\n$1`)
    : withSource;

  try {
    await files.write(path, text);
    await files.write(projectPath, projectText);
  } catch (error) {
    // Leave no data file without its source.
    if ((error as { path?: string }).path === projectPath) {
      await files.remove(path).catch(() => undefined);
    }
    throw error;
  }
  const described = await fields(files, { query: source });
  return {
    saved: path,
    source,
    projectPath,
    rows: rows.length,
    fields: described.queries[0]?.fields ?? [],
    howToUse: `Chart it in an analysis that starts with eda query=${source}; its fields are named ${source}.<field>.`,
  };
}
