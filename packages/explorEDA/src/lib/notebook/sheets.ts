/**
 * A notebook's sheets. A notebook with two or more `#` headings is a book
 * of sheets, one per heading, read one at a time; the text before the first
 * heading is the lede, shown above them all. A notebook with one `#` heading
 * has a title, not sheets, so every notebook written so far is unchanged.
 *
 * Sheets share the notebook's data, definitions, and compile: a calculation
 * on one sheet charts on any other. They split the reading, not the model.
 */
import type {
  NotebookProse,
  NotebookSegment,
  ParsedNotebook,
} from "./parseNotebook";

export interface NotebookSheet {
  /** The heading's text, without its `#`. */
  title: string;
  /** The title as a URL-safe id, unique within the notebook. */
  id: string;
  /** The file line of the `#` heading. */
  line: number;
  /**
   * The sheet's prose and blocks, in order. The first prose segment starts
   * with the heading line, so editing it renames the sheet.
   */
  segments: NotebookSegment[];
}

export interface NotebookSheets {
  /** Prose and blocks before the first sheet; empty without sheets. */
  lede: NotebookSegment[];
  /** The sheets in order, or one unnamed sheet holding the whole notebook. */
  sheets: NotebookSheet[];
}

const HEADING = /^#\s+(\S.*)$/;
const FENCE = /^\s*(```|~~~)/;

/** A sheet title as a URL-safe id: "The storm week" → "the-storm-week". */
export function sheetId(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "") || "sheet"
  );
}

/** Each `#` heading outside a fenced block, with its file line. */
function headings(prose: NotebookProse) {
  const found: { title: string; offset: number }[] = [];
  let fenced = false;
  prose.text.split(/\r?\n/).forEach((line, offset) => {
    if (FENCE.test(line)) fenced = !fenced;
    const match = !fenced && HEADING.exec(line);
    if (match) found.push({ title: match[1]!.trim(), offset });
  });
  return found;
}

/** The lines `from` to `to` (inclusive, from 0) of a prose segment as one. */
function slice(prose: NotebookProse, from: number, to: number): NotebookProse {
  const lines = prose.text.split(/\r?\n/).slice(from, to + 1);
  return {
    kind: "prose",
    text: lines.join("\n"),
    startLine: prose.startLine + from,
    endLine: prose.startLine + to,
  };
}

/** Splits a notebook into its sheets; see the file comment. */
export function notebookSheets(notebook: ParsedNotebook): NotebookSheets {
  const count = notebook.segments.reduce(
    (sum, segment) =>
      segment.kind === "prose" ? sum + headings(segment).length : sum,
    0
  );
  if (count < 2) {
    return {
      lede: [],
      sheets: [{ title: "", id: "", line: 0, segments: notebook.segments }],
    };
  }
  const lede: NotebookSegment[] = [];
  const sheets: NotebookSheet[] = [];
  const ids = new Set<string>();
  const push = (segment: NotebookSegment) =>
    (sheets.at(-1)?.segments ?? lede).push(segment);
  for (const segment of notebook.segments) {
    if (segment.kind !== "prose") {
      push(segment);
      continue;
    }
    const found = headings(segment);
    if (!found.length) {
      push(segment);
      continue;
    }
    const lastLine = segment.text.split(/\r?\n/).length - 1;
    // Text before the first heading belongs to the sheet before it.
    if (found[0]!.offset > 0) {
      const before = slice(segment, 0, found[0]!.offset - 1);
      if (before.text.trim()) push(before);
    }
    found.forEach((heading, index) => {
      const end = found[index + 1]?.offset ?? lastLine + 1;
      let id = sheetId(heading.title);
      for (let n = 2; ids.has(id); n++) id = `${sheetId(heading.title)}-${n}`;
      ids.add(id);
      sheets.push({
        title: heading.title,
        id,
        line: segment.startLine + heading.offset,
        segments: [slice(segment, heading.offset, end - 1)],
      });
    });
  }
  return { lede, sheets };
}

/** The text of a sheet's first prose segment without its heading line. */
export function withoutHeading(text: string) {
  return text.replace(/^#\s+.*(?:\r?\n|$)/, "");
}
