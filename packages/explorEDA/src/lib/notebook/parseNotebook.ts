/**
 * Splits a notebook (`.eda.md`) into prose and `eda` blocks. A notebook is
 * Markdown: a fenced block whose info string starts with `eda` holds
 * dashboard text, and everything else is prose. Line numbers are the
 * file's, starting at 1, so a block's diagnostics point into the file.
 */

export const NOTEBOOK_EXTENSION = ".eda.md";

/** True for a path that names a notebook. */
export function isNotebookPath(path: string) {
  return path.toLowerCase().endsWith(NOTEBOOK_EXTENSION);
}

/** The notebook's name from its file: `notes/forecast.eda.md` → "forecast". */
export function notebookNameFromPath(path: string) {
  return path
    .split("/")
    .at(-1)!
    .replace(/\.eda\.md$/i, "");
}

export interface NotebookProse {
  kind: "prose";
  text: string;
  startLine: number;
  endLine: number;
}

export interface NotebookBlock {
  kind: "block";
  /** The block's position among the notebook's blocks, from 0. */
  index: number;
  /** The block's dashboard text, without its fences. */
  text: string;
  /** The opening fence's line. */
  fenceLine: number;
  /** The first line of dashboard text; one past `endLine` when empty. */
  startLine: number;
  /** The last line of dashboard text. */
  endLine: number;
  /** The closing fence's line; undefined when the file ends first. */
  closeLine?: number;
}

export type NotebookSegment = NotebookProse | NotebookBlock;

export interface ParsedNotebook {
  segments: NotebookSegment[];
  blocks: NotebookBlock[];
  /** The file's lines, without line endings. */
  lines: string[];
}

const OPEN = /^ {0,3}(`{3,}|~{3,})\s*([^`\s]*)/;

function closes(line: string, fence: string) {
  const match = /^ {0,3}(`{3,}|~{3,})\s*$/.exec(line);
  return (
    !!match && match[1]![0] === fence[0] && match[1]!.length >= fence.length
  );
}

export function parseNotebook(text: string): ParsedNotebook {
  const lines = text.split(/\r?\n/);
  const segments: NotebookSegment[] = [];
  const blocks: NotebookBlock[] = [];
  let prose: string[] = [];
  let proseStart = 1;

  const flushProse = (endLine: number) => {
    // Blank lines between blocks are spacing, not prose.
    if (prose.some((line) => line.trim())) {
      segments.push({
        kind: "prose",
        text: prose.join("\n"),
        startLine: proseStart,
        endLine,
      });
    }
    prose = [];
    proseStart = endLine + 1;
  };

  let index = 0;
  while (index < lines.length) {
    const line = lines[index]!;
    const open = OPEN.exec(line);
    if (!open) {
      prose.push(line);
      index++;
      continue;
    }
    const fence = open[1]!;
    // Find the close; a fence that never closes runs to the end of the file.
    let close = index + 1;
    while (close < lines.length && !closes(lines[close]!, fence)) {
      close++;
    }
    const closed = close < lines.length;
    if (open[2]!.toLowerCase() !== "eda") {
      // Other code blocks are prose, fences and all.
      const end = closed ? close : lines.length - 1;
      prose.push(...lines.slice(index, end + 1));
      index = end + 1;
      continue;
    }
    flushProse(index);
    const fenceLine = index + 1;
    const body = lines.slice(index + 1, close);
    const block: NotebookBlock = {
      kind: "block",
      index: blocks.length,
      text: body.join("\n"),
      fenceLine,
      startLine: fenceLine + 1,
      endLine: fenceLine + body.length,
      ...(closed ? { closeLine: close + 1 } : {}),
    };
    blocks.push(block);
    segments.push(block);
    index = close + 1;
    proseStart = index + 1;
  }
  flushProse(lines.length);
  return { segments, blocks, lines };
}
