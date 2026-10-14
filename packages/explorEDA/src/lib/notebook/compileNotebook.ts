/**
 * Builds a notebook's results. Every block's text compiles together as one
 * dashboard, so a definition in any block applies to the whole file in any
 * order. Prose lines compile as blank lines, which keeps every line number
 * the file's own: diagnostics and chart lines point straight into the file.
 *
 * A block whose text is broken doesn't take part. When the host passes the
 * block's last valid text, that text stands in for it, so its charts and
 * definitions stay as they were until the text is fixed.
 */
import {
  compileDocument,
  type DslChartResult,
  type DslCompileOptions,
  type DslDiagnostic,
} from "@/lib/dsl";
import { parseDocument } from "@/lib/dsl/parse";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import {
  parseNotebook,
  type NotebookBlock,
  type ParsedNotebook,
} from "./parseNotebook";

export type NotebookBlockStatus = "ok" | "invalid" | "frozen";

export interface NotebookChart {
  id: string;
  /** The line of the chart's declaration in the compiled text. */
  line: number;
}

export interface NotebookBlockResult {
  index: number;
  /**
   * "invalid" when the block's text has an error; "frozen" when it does
   * and its last valid text stands in, so its results are that text's.
   */
  status: NotebookBlockStatus;
  /** The block's outputs, in the order its text declares them. */
  charts: NotebookChart[];
  /** Calculations the block defines. */
  calculations: string[];
  diagnostics: DslDiagnostic[];
}

export interface NotebookCompileOptions extends DslCompileOptions {
  /** Each block's last text that compiled without an error, by block index. */
  lastValid?: Record<number, string>;
}

export interface NotebookCompileResult {
  notebook: ParsedNotebook;
  /** Every block's definitions and outputs as one dashboard. */
  settings: SavedDataStructure;
  blocks: NotebookBlockResult[];
  /** Every diagnostic, in file lines, outside stand-in text. */
  diagnostics: DslDiagnostic[];
  charts: DslChartResult[];
  skippedCharts: DslChartResult[];
  /**
   * The text that was compiled: the file with prose blanked, then any
   * stand-in text after the file's last line.
   */
  compiledText: string;
  /** True when every block compiled without a problem. */
  complete: boolean;
}

const GENERATED_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Problems a block's own text has, before it joins the others. */
function blockProblems(block: NotebookBlock): DslDiagnostic[] {
  const offset = block.startLine - 1;
  const parsed = parseDocument(block.text);
  const diagnostics: DslDiagnostic[] = parsed.problems.map((problem) => ({
    severity: "error",
    effect: "setting-ignored",
    message: problem.message,
    suggestion: problem.suggestion,
    line: problem.span.line + offset,
    column: problem.span.column,
    length: problem.span.length,
  }));
  if (block.closeLine === undefined) {
    diagnostics.push({
      severity: "error",
      effect: "chart-skipped",
      message: "This eda block has no closing fence.",
      suggestion: "Add a line with ``` after the block's last line.",
      line: block.fenceLine,
      column: 1,
      length: 3,
    });
  }
  for (const declaration of parsed.declarations) {
    if (declaration.keyword === "view") {
      diagnostics.push({
        severity: "error",
        effect: "chart-skipped",
        message:
          "A notebook has no views; each block's charts show where the block sits.",
        suggestion: "Remove the view line and its braces.",
        line: declaration.span.line + offset,
        column: declaration.span.column,
        length: declaration.span.length,
      });
    }
  }
  return diagnostics;
}

/** The compiled text: blocks in place, prose and excluded blocks blank. */
function compiledLines(
  notebook: ParsedNotebook,
  included: (block: NotebookBlock) => boolean
) {
  const lines = notebook.lines.map(() => "");
  for (const block of notebook.blocks) {
    if (included(block)) {
      for (let line = block.startLine; line <= block.endLine; line++) {
        lines[line - 1] = notebook.lines[line - 1]!;
      }
    }
  }
  return lines;
}

function blockAt(notebook: ParsedNotebook, line: number) {
  return notebook.blocks.find(
    (block) => line >= block.fenceLine && line <= (block.closeLine ?? Infinity)
  );
}

export function compileNotebook(
  text: string,
  options: NotebookCompileOptions
): NotebookCompileResult {
  const { lastValid = {}, ...compileOptions } = options;
  const notebook = parseNotebook(text);
  const own = new Map(
    notebook.blocks.map((block) => [block.index, blockProblems(block)])
  );

  const build = (frozen: Set<number>) => {
    const lines = compiledLines(
      notebook,
      (block) =>
        !frozen.has(block.index) &&
        !own.get(block.index)!.some((item) => item.severity === "error")
    );
    // Stand-in text goes after the file, where its lines can't collide.
    const standIns = new Map<number, { start: number; end: number }>();
    for (const index of frozen) {
      const standIn = lastValid[index]!.split(/\r?\n/);
      lines.push("");
      standIns.set(index, {
        start: lines.length + 1,
        end: lines.length + standIn.length,
      });
      lines.push(...standIn);
    }
    const compiledText = lines.join("\n");
    return {
      compiledText,
      standIns,
      result: compileDocument(compiledText, compileOptions),
    };
  };

  const errorBlocks = (diagnostics: DslDiagnostic[]) => {
    const found = new Set<number>();
    for (const [index, items] of own) {
      if (items.some((item) => item.severity === "error")) {
        found.add(index);
      }
    }
    for (const item of diagnostics) {
      const block =
        item.line <= notebook.lines.length
          ? blockAt(notebook, item.line)
          : undefined;
      if (block && item.severity === "error") {
        found.add(block.index);
      }
    }
    return found;
  };

  // Blocks whose own text is broken stand in first. A block that fails only
  // because of another block's text then compiles against the stand-in, and
  // stands in itself only if it still fails.
  const canStandIn = (index: number) => lastValid[index] !== undefined;
  const frozen = new Set(
    [...own]
      .filter(
        ([index, items]) =>
          canStandIn(index) && items.some((item) => item.severity === "error")
      )
      .map(([index]) => index)
  );
  let pass = build(frozen);
  for (;;) {
    const more = [...errorBlocks(pass.result.diagnostics)].filter(
      (index) => !frozen.has(index) && canStandIn(index)
    );
    if (!more.length) {
      break;
    }
    more.forEach((index) => frozen.add(index));
    pass = build(frozen);
  }
  const broken = new Set([...errorBlocks(pass.result.diagnostics), ...frozen]);
  const { compiledText, standIns, result } = pass;

  // Which block a compiled line belongs to, stand-in text included.
  const ownerOf = (line: number) => {
    if (line > notebook.lines.length) {
      for (const [index, range] of standIns) {
        if (line >= range.start && line <= range.end) {
          return index;
        }
      }
      return undefined;
    }
    return blockAt(notebook, line)?.index;
  };

  // Charts without a name get one from their block and position, so they
  // keep their identity while other blocks change.
  const settings = structuredClone(result.settings);
  const counts = new Map<number, number>();
  const taken = new Set(
    result.charts.flatMap((chart) =>
      chart.id && !GENERATED_ID.test(chart.id) ? [chart.id] : []
    )
  );
  const charts = result.charts.map((chart, position) => {
    const owner = ownerOf(chart.line);
    const count = (counts.get(owner ?? -1) ?? 0) + 1;
    counts.set(owner ?? -1, count);
    if (chart.id && !GENERATED_ID.test(chart.id)) {
      return chart;
    }
    let id = `block${(owner ?? -1) + 1}-${count}`;
    while (taken.has(id)) {
      id = `${id}-x`;
    }
    taken.add(id);
    const saved = settings.charts[position];
    if (saved) {
      saved.id = id;
    }
    return { ...chart, id };
  });

  // A calculation defined twice is flagged at its first definition too.
  const calcLines = new Map<string, number[]>();
  const parsed = parseDocument(compiledText);
  const calculations = new Map<number, string[]>();
  for (const declaration of parsed.declarations) {
    if (declaration.keyword !== "calc" || !declaration.name) {
      continue;
    }
    const owner = ownerOf(declaration.span.line);
    if (owner !== undefined) {
      calculations.set(owner, [
        ...(calculations.get(owner) ?? []),
        declaration.name,
      ]);
    }
    calcLines.set(declaration.name, [
      ...(calcLines.get(declaration.name) ?? []),
      declaration.span.line,
    ]);
  }
  const duplicates: DslDiagnostic[] = [...calcLines].flatMap(([name, at]) =>
    at.length > 1 && at[0]! <= notebook.lines.length
      ? [
          {
            severity: "warning",
            effect: "setting-ignored",
            message: `${name} is also calculated on line ${at[1]}; this one is used.`,
            suggestion: "Rename or remove one of them.",
            subject: `calc ${name}`,
            line: at[0]!,
            column: 1,
            length: 4,
          } satisfies DslDiagnostic,
        ]
      : []
  );

  // Stand-in text already reported its problems when it was the file's.
  const fileDiagnostics = [
    ...[...own.values()].flat(),
    ...result.diagnostics.filter((item) => item.line <= notebook.lines.length),
    ...duplicates,
  ].sort((a, b) => a.line - b.line || a.column - b.column);
  const inFile = (item: DslChartResult) => item.line <= notebook.lines.length;

  const blocks: NotebookBlockResult[] = notebook.blocks.map((block) => ({
    index: block.index,
    status: frozen.has(block.index)
      ? "frozen"
      : broken.has(block.index)
        ? "invalid"
        : "ok",
    charts: charts
      .filter((chart) => ownerOf(chart.line) === block.index)
      .map(({ id, line }) => ({ id: id!, line })),
    calculations: calculations.get(block.index) ?? [],
    diagnostics: fileDiagnostics.filter(
      (item) => blockAt(notebook, item.line)?.index === block.index
    ),
  }));

  return {
    notebook,
    settings,
    blocks,
    diagnostics: fileDiagnostics,
    charts: charts.filter(inFile),
    skippedCharts: result.skippedCharts.filter(inFile),
    compiledText,
    complete: fileDiagnostics.length === 0,
  };
}
