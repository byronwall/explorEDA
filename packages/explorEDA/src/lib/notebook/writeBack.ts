/**
 * Writes a chart edit made through the app back into notebook text, changing
 * as little as it can. The edit is read as the difference between the
 * chart's text before and after, as export would write each; only the
 * settings that differ are touched in the author's text, so comments,
 * spacing, order, and every other line stay exactly as written.
 *
 * When an edit has no token of its own to change, such as a new chart type,
 * the chart's one declaration is rewritten. Every result is compiled again
 * and compared with the edit, so text that wouldn't rebuild the edited chart
 * is never returned as a splice.
 */
import isEqual from "react-fast-compare";
import { chartRegistry, getChartDefinition } from "@/charts/registry";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { exportParts, type DslChartPart } from "@/lib/dsl/export";
import { block as printBlock } from "@/lib/dsl/print";
import {
  parseDocument,
  splitPair,
  tokenize,
  type DslDeclaration,
  type DslSpan,
} from "@/lib/dsl/parse";
import type { datum } from "@/types/ChartTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { SavedChartSettings } from "@/types/SavedDataTypes";
import {
  compileNotebook,
  type NotebookCompileOptions,
  type NotebookCompileResult,
} from "./compileNotebook";

export type WriteBackKind = "splice" | "rewrite" | "unchanged" | "unsupported";

export interface WriteBackResult {
  kind: WriteBackKind;
  /** The notebook text with the edit; the original text when it can't apply. */
  text: string;
  /** Why the edit couldn't be written, when kind is "unsupported". */
  reason?: string;
}

/** Keys that hold view state rather than the analysis. */
function skippedKey(key: string) {
  // at= places a dashboard tile; a notebook places charts by their block.
  // select. holds a click or brush, which stays with the chart on screen.
  return key === "at" || key.startsWith("select.");
}

interface ChartText {
  word: string;
  name?: string;
  positional: string[];
  pairs: Map<string, string>;
  children: string[];
}

/** Tokens of a declaration, read as the parser reads them. */
function readTokens(tokens: string[], lead: number): ChartText {
  const positional: string[] = [];
  const pairs = new Map<string, string>();
  let name: string | undefined;
  for (const token of tokens.slice(lead)) {
    if (token.startsWith("@")) {
      name = token.slice(1);
      continue;
    }
    const pair = splitPair(token);
    if (pair) {
      if (!skippedKey(pair[0])) {
        pairs.set(pair[0], pair[1]);
      }
    } else {
      positional.push(token);
    }
  }
  return {
    word: tokens.slice(0, lead).join(" "),
    ...(name ? { name } : {}),
    positional,
    pairs,
    children: [],
  };
}

/** Real field names to the alias the notebook gives each. */
type Aliases = Map<string, string>;

function aliasesOf(compiledText: string): Aliases {
  const byField = new Map<string, string[]>();
  for (const declaration of parseDocument(compiledText).declarations) {
    const alias = declaration.alias;
    const field = alias?.field.items[0]?.text;
    if (alias && field && alias.field.items.length === 1) {
      byField.set(field, [...(byField.get(field) ?? []), alias.name]);
    }
  }
  return new Map(
    [...byField].flatMap(([field, names]) =>
      names.length === 1 ? [[field, names[0]!]] : []
    )
  );
}

/** Splits a value at commas outside quotes, keeping each piece as written. */
function pieces(value: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuote = false;
  for (let index = 0; index < value.length; index++) {
    const char = value[index]!;
    if (inQuote && char === "\\") {
      current += char + (value[++index] ?? "");
      continue;
    }
    if (char === '"') {
      inQuote = !inQuote;
    }
    if (char === "," && !inQuote) {
      out.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  out.push(current);
  return out;
}

/** A value with each field named by its alias: sum(demand.actual) → sum(actual). */
function aliasValue(value: string, aliases: Aliases): string {
  const one = (piece: string): string => {
    const text = piece.startsWith('"') ? (JSON.parse(piece) as string) : piece;
    const alias = aliases.get(text);
    if (alias) {
      return alias;
    }
    const call = /^([A-Za-z]+)\((.+)\)$/.exec(piece);
    return call ? `${call[1]}(${one(call[2]!)})` : piece;
  };
  return pieces(value)
    .map((piece) => {
      try {
        return one(piece);
      } catch {
        return piece;
      }
    })
    .join(",");
}

/** A key that names a field, such as where.demand.actual, by its alias. */
function aliasKey(key: string, aliases: Aliases): string {
  const match = /^(where|select)\.(.+)$/.exec(key);
  if (!match) {
    return key;
  }
  for (const [field, alias] of aliases) {
    for (const suffix of [
      "",
      ".contains",
      ".equals",
      ".startsWith",
      ".endsWith",
    ]) {
      if (match[2] === `${field}${suffix}`) {
        return `${match[1]}.${alias}${suffix}`;
      }
    }
  }
  return key;
}

function aliasToken(token: string, aliases: Aliases): string {
  if (token.startsWith("@") || token === "{" || token === "}") {
    return token;
  }
  const pair = splitPair(token);
  return pair
    ? `${aliasKey(pair[0], aliases)}=${aliasValue(pair[1], aliases)}`
    : aliasValue(token, aliases);
}

/** A line of tokens with fields renamed; its first `lead` words stay. */
function aliasLine(line: string, aliases: Aliases, lead = 1): string {
  const tokens = tokenize(line).tokens.map((token) => token.text);
  return [
    ...tokens.slice(0, lead),
    ...tokens.slice(lead).map((token) => aliasToken(token, aliases)),
  ].join(" ");
}

/** Export's form of a chart, in the notebook's own field names. */
function aliasPart(part: DslChartPart, aliases: Aliases): DslChartPart {
  if (!aliases.size) {
    return part;
  }
  return {
    ...part,
    head: aliasLine(part.head, aliases, part.head.startsWith("chart ") ? 2 : 1),
    tokens: part.tokens.map((token) => aliasToken(token, aliases)),
    children: part.children.map((line) =>
      /[{}]/.test(line) ? line : aliasLine(line, aliases)
    ),
  };
}

/** A chart part's head and tokens, read as a declaration reads them. */
function readPart(part: DslChartPart): ChartText {
  const head = tokenize(part.head).tokens.map((token) => token.text);
  // `chart <type>` names its type in two words.
  const lead = head[0] === "chart" ? 2 : 1;
  return {
    ...readTokens([...head, ...part.tokens], lead),
    children: part.children,
  };
}

/** A one-line child, such as `series actual lineColor=#3479a8`. */
function readChild(line: string): ChartText {
  return readTokens(
    tokenize(line).tokens.map((token) => token.text),
    1
  );
}

/** What a child line is about: its word, name, and first plain value. */
function childIdentity(child: ChartText) {
  return `${child.word} @${child.name ?? ""} ${child.positional[0] ?? ""}`;
}

function declarationIdentity(declaration: DslDeclaration) {
  return `${declaration.keyword} @${declaration.name ?? ""} ${declaration.positional[0]?.value.raw ?? ""}`;
}

interface Edit {
  line: number;
  /** 0-based start in the line. */
  start: number;
  end: number;
  text: string;
}

function spanEdit(span: DslSpan, text: string): Edit {
  return {
    line: span.line,
    start: span.column - 1,
    end: span.column - 1 + span.length,
    text,
  };
}

function applyEdits(lines: string[], edits: Edit[]): string[] {
  const next = [...lines];
  const sorted = [...edits].sort(
    (a, b) => b.line - a.line || b.start - a.start
  );
  const touched = new Set<number>();
  for (const edit of sorted) {
    const line = next[edit.line - 1]!;
    next[edit.line - 1] =
      line.slice(0, edit.start) + edit.text + line.slice(edit.end);
    touched.add(edit.line);
  }
  // A settings line whose last setting was removed goes with it.
  return next.filter(
    (line, index) =>
      !touched.has(index + 1) ||
      line.trim() !== "" ||
      lines[index]!.trim() === ""
  );
}

/** Removes a token and the space before it. */
function deleteEdit(lines: string[], span: DslSpan): Edit {
  const line = lines[span.line - 1]!;
  let start = span.column - 1;
  while (start > 0 && /\s/.test(line[start - 1]!)) {
    start--;
  }
  return {
    line: span.line,
    start,
    end: span.column - 1 + span.length,
    text: "",
  };
}

/** Adds a token at the end of the declaration's head line, before any `{`. */
function insertEdit(
  lines: string[],
  declaration: DslDeclaration,
  token: string
): Edit {
  const line = lines[declaration.span.line - 1]!;
  const tokens = tokenize(line).tokens;
  const brace = tokens.findIndex(
    (item, index) => item.text === "{" && index === tokens.length - 1
  );
  const last = brace > 0 ? tokens[brace - 1]! : tokens.at(-1)!;
  const at = last.column + last.text.length;
  return { line: declaration.span.line, start: at, end: at, text: ` ${token}` };
}

/**
 * Adds a one-line child as the last line of the declaration's block, with
 * its children's indent. Undefined when the declaration has no block to add
 * it to, or the line opens one of its own.
 */
function addChildEdit(
  lines: string[],
  declaration: DslDeclaration,
  child: string
): Edit | undefined {
  const close = lines[declaration.endLine - 1];
  if (
    /[{}]/.test(child) ||
    declaration.endLine <= declaration.span.line ||
    close?.trim() !== "}"
  ) {
    return undefined;
  }
  const last = lines[declaration.endLine - 2]!;
  const head = lines[declaration.span.line - 1]!;
  const indentOf = (line: string) =>
    line.slice(0, line.length - line.trimStart().length);
  const indent =
    declaration.endLine - 1 > declaration.span.line
      ? indentOf(last)
      : `${indentOf(head)}  `;
  return {
    line: declaration.endLine - 1,
    start: last.length,
    end: last.length,
    text: `\n${indent}${child}`,
  };
}

function sameList(a: string[], b: string[]) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

/** The declaration of the chart with this ID, from the compiled text. */
function declarationFor(
  compiled: NotebookCompileResult,
  chartId: string
): DslDeclaration | undefined {
  const chart = compiled.blocks
    .find(
      (block) =>
        block.status === "ok" &&
        block.charts.some((item) => item.id === chartId)
    )
    ?.charts.find((item) => item.id === chartId);
  if (!chart) {
    return undefined;
  }
  return parseDocument(compiled.compiledText).declarations.find(
    (item) => item.span.line === chart.line
  );
}

/**
 * Splices the settings that changed into the author's declaration, and into
 * its child lines one by one. Undefined when the change has no token of its
 * own in the author's text.
 */
function spliceEdits(
  lines: string[],
  declaration: DslDeclaration,
  before: ChartText,
  after: ChartText
): Edit[] | undefined {
  if (before.word !== after.word) {
    return undefined;
  }
  const edits: Edit[] = [];
  let children = after.children;
  if (children.length === before.children.length + 1) {
    // One new child line, such as a series the text didn't style yet, goes
    // at the end of the declaration's block.
    const without = (index: number) =>
      children.filter((_, other) => other !== index);
    const added = children.findIndex((_, index) =>
      sameList(before.children, without(index))
    );
    const edit =
      added === -1
        ? undefined
        : addChildEdit(lines, declaration, children[added]!);
    if (!edit) {
      return undefined;
    }
    edits.push(edit);
    children = without(added);
  }
  if (!sameList(before.children, children)) {
    if (
      before.children.length !== children.length ||
      [...before.children, ...children].some((line) => /[{}]/.test(line))
    ) {
      return undefined;
    }
    for (const [index, line] of before.children.entries()) {
      if (line === children[index]) {
        continue;
      }
      const was = readChild(line);
      const now = readChild(children[index]!);
      const identity = childIdentity(was);
      const written = declaration.children.filter(
        (child) => declarationIdentity(child) === identity
      );
      if (childIdentity(now) !== identity || written.length !== 1) {
        return undefined;
      }
      const childEdits = spliceEdits(lines, written[0]!, was, now);
      if (!childEdits) {
        return undefined;
      }
      edits.push(...childEdits);
    }
  }
  if (!sameList(before.positional, after.positional)) {
    const written = declaration.positional;
    if (
      written.length !== before.positional.length ||
      written.length !== after.positional.length
    ) {
      return undefined;
    }
    after.positional.forEach((value, index) => {
      if (value !== before.positional[index]) {
        edits.push(spanEdit(written[index]!.span, value));
      }
    });
  }
  const keys = new Set([...before.pairs.keys(), ...after.pairs.keys()]);
  for (const key of keys) {
    const was = before.pairs.get(key);
    const now = after.pairs.get(key);
    if (was === now) {
      continue;
    }
    const written = declaration.pairs.filter((pair) => pair.key === key);
    if (written.length > 1) {
      return undefined;
    }
    const pair = written[0];
    if (now !== undefined && pair) {
      edits.push(spanEdit(pair.span, `${key}=${now}`));
    } else if (now !== undefined && was === undefined) {
      edits.push(insertEdit(lines, declaration, `${key}=${now}`));
    } else if (now === undefined && pair) {
      edits.push(deleteEdit(lines, pair.span));
    } else {
      // The text says this some other way, so the token can't be found.
      return undefined;
    }
  }
  return edits;
}

/** Replaces the chart's declaration lines with export's form of it. */
function rewriteLines(
  lines: string[],
  declaration: DslDeclaration,
  part: DslChartPart
): string[] {
  const head = tokenize(part.head).tokens.map((token) => token.text);
  // Keep the author's name, and only theirs.
  const named = head.filter((token) => !token.startsWith("@"));
  if (declaration.name) {
    named.splice(named[0] === "chart" ? 2 : 1, 0, `@${declaration.name}`);
  }
  const tokens = part.tokens.filter((token) => {
    const pair = splitPair(token);
    return !pair || !skippedKey(pair[0]);
  });
  const first = lines[declaration.span.line - 1]!;
  const indent = first.slice(0, first.length - first.trimStart().length);
  const written = printBlock(named.join(" "), tokens, part.children).map(
    (line) => `${indent}${line}`
  );
  return [
    ...lines.slice(0, declaration.span.line - 1),
    ...written,
    ...lines.slice(declaration.endLine),
  ];
}

function partFor(
  settings: SavedDataStructure,
  chartId: string,
  rows: Array<Record<string, datum>>,
  aliases: Aliases
) {
  const part = exportParts(settings, { rows }).charts.find(
    (item) => item.id === chartId
  );
  return part && aliasPart(part, aliases);
}

/** The chart as the text builds it, in export's canonical form. */
function rebuiltPart(
  text: string,
  chartId: string,
  options: NotebookCompileOptions
) {
  const compiled = compileNotebook(text, options);
  return partFor(
    compiled.settings,
    chartId,
    options.rows,
    aliasesOf(compiled.compiledText)
  );
}

function samePart(a: DslChartPart | undefined, b: DslChartPart | undefined) {
  if (!a || !b) {
    return false;
  }
  const left = readPart(a);
  const right = readPart(b);
  return (
    left.word === right.word &&
    sameList(left.positional, right.positional) &&
    sameList(left.children, right.children) &&
    left.pairs.size === right.pairs.size &&
    [...left.pairs].every(([key, value]) => right.pairs.get(key) === value)
  );
}

/**
 * Writes `chart`, an edited version of a chart the notebook builds, back
 * into the notebook's text.
 */
export function writeBackChart(
  text: string,
  compiled: NotebookCompileResult,
  chart: SavedChartSettings,
  options: NotebookCompileOptions
): WriteBackResult {
  const unsupported = (reason: string): WriteBackResult => ({
    kind: "unsupported",
    text,
    reason,
  });
  const declaration = declarationFor(compiled, chart.id);
  if (!declaration) {
    return unsupported(
      "This chart's block has a problem in its text, so the change was undone. Fix the text first."
    );
  }
  const afterSettings: SavedDataStructure = {
    ...compiled.settings,
    charts: compiled.settings.charts.map((item) =>
      item.id === chart.id ? chart : item
    ),
  };
  const aliases = aliasesOf(compiled.compiledText);
  const before = partFor(compiled.settings, chart.id, options.rows, aliases);
  const after = partFor(afterSettings, chart.id, options.rows, aliases);
  if (!before || !after) {
    return unsupported("This change has no text form, so it was undone.");
  }
  if (samePart(before, after)) {
    return { kind: "unchanged", text };
  }
  const lines = compiled.notebook.lines;
  const edits = spliceEdits(
    lines,
    declaration,
    readPart(before),
    readPart(after)
  );
  if (edits) {
    const spliced = applyEdits(lines, edits).join("\n");
    if (samePart(rebuiltPart(spliced, chart.id, options), after)) {
      return { kind: "splice", text: spliced };
    }
  }
  const rewritten = rewriteLines(lines, declaration, after).join("\n");
  // A rewrite can change an unnamed chart's ID; find it by its position.
  const rebuilt = compileNotebook(rewritten, options);
  const block = compiled.blocks.find((item) =>
    item.charts.some((entry) => entry.id === chart.id)
  )!;
  const position = block.charts.findIndex((entry) => entry.id === chart.id);
  const id = rebuilt.blocks[block.index]?.charts[position]?.id;
  const rebuiltPartText = id
    ? partFor(
        rebuilt.settings,
        id,
        options.rows,
        aliasesOf(rebuilt.compiledText)
      )
    : undefined;
  if (samePart(rebuiltPartText, after)) {
    return { kind: "rewrite", text: rewritten };
  }
  return unsupported(
    "This change can't be written to the notebook's text, so it was undone."
  );
}

/** What a chart's text says: everything but its selection and placement. */
function textPart(chart: SavedChartSettings) {
  const { filters: _filters, layout: _layout, ...rest } = chart;
  return rest;
}

type SeriesColors = Record<string, { lineColor?: string } | undefined>;

/**
 * The chart after, without the colors a line chart picks for series that
 * had none before. It saves them as it draws, and a chart can draw while
 * someone edits another block; that pick is not an edit to write.
 */
function withoutDrawnColors(
  before: SavedChartSettings,
  after: SavedChartSettings
): SavedChartSettings {
  const was = (before as { seriesSettings?: SeriesColors }).seriesSettings;
  const now = (after as { seriesSettings?: SeriesColors }).seriesSettings;
  if (!isRecord(now)) {
    return after;
  }
  let changed = false;
  const kept: SeriesColors = { ...now };
  for (const [field, settings] of Object.entries(now)) {
    const color = was?.[field]?.lineColor;
    if (settings?.lineColor && (!color || color === "default")) {
      changed = true;
      if (was?.[field]) {
        kept[field] = was[field];
      } else {
        delete kept[field];
      }
    }
  }
  return changed
    ? ({ ...after, seriesSettings: kept } as SavedChartSettings)
    : after;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** `over` laid on `under`, record by record. */
function layered(under: unknown, over: unknown): unknown {
  if (!isRecord(under) || !isRecord(over)) {
    return over === undefined ? under : over;
  }
  const out: Record<string, unknown> = { ...under };
  for (const [key, value] of Object.entries(over)) {
    out[key] = layered(under[key], value);
  }
  return out;
}

/**
 * The values the app may fill into a chart of this type: its own defaults
 * over the ones every chart shares, such as axis and facet settings.
 */
function fillIns(chart: SavedChartSettings): unknown {
  const own = chartRegistry.has(chart.type)
    ? getChartDefinition(chart.type).createDefaultSettings(chart.layout)
    : {};
  return layered(DEFAULT_CHART_SETTINGS, own);
}

/** Settings any chart keeps, whatever its type. */
const SHARED_KEYS = [
  "id",
  "title",
  "subtitle",
  "note",
  "colorField",
  "colorScaleId",
  "localFilters",
  "annotations",
];

/**
 * A chart that changed type, without the old type's settings: the app keeps
 * them in case the type changes back, but text says only what this type uses.
 */
function newTypeChart(chart: SavedChartSettings): SavedChartSettings {
  const known = fillIns(chart);
  const keep = new Set([
    ...SHARED_KEYS,
    ...(isRecord(known) ? Object.keys(known) : []),
  ]);
  return Object.fromEntries(
    Object.entries(chart).filter(([key]) => keep.has(key))
  ) as unknown as SavedChartSettings;
}

/**
 * `base` with the change from `before` to `after` applied: only the values
 * that changed, at any depth. Lists change whole.
 */
function applyChange(
  base: unknown,
  before: unknown,
  after: unknown,
  defaults: unknown
): unknown {
  if (!isRecord(before) || !isRecord(after)) {
    return after;
  }
  const out: Record<string, unknown> = isRecord(base) ? { ...base } : {};
  const fallback = isRecord(defaults) ? defaults : {};
  for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
    if (isEqual(before[key], after[key])) {
      continue;
    }
    // The app fills in a default it left out; the text needn't say it.
    if (before[key] === undefined && isEqual(after[key], fallback[key])) {
      continue;
    }
    if (!(key in after) || after[key] === undefined) {
      delete out[key];
    } else {
      out[key] = applyChange(
        isRecord(base) ? base[key] : undefined,
        before[key],
        after[key],
        fallback[key]
      );
    }
  }
  return out;
}

export interface NotebookWriteBack {
  /** The notebook text with every edit that could be written. */
  text: string;
  /** One result for each chart whose text-borne settings changed. */
  results: Array<WriteBackResult & { chartId: string }>;
}

/**
 * Writes the chart edits between `previous` and `next`, the dashboard as
 * the app held it before and after, into the notebook text `compiled` was
 * built from. Only what changed is applied to the compiled charts, so
 * defaults the app fills in never reach the text. Clicks, brushes, and
 * placement aren't text, so they never cause a write.
 */
export function writeBackSettings(
  text: string,
  compiled: NotebookCompileResult,
  previous: SavedDataStructure,
  next: SavedDataStructure,
  options: NotebookCompileOptions
): NotebookWriteBack {
  let current = text;
  let state = compiled;
  const results: NotebookWriteBack["results"] = [];
  for (const drawn of next.charts) {
    const before = previous.charts.find((item) => item.id === drawn.id);
    const base = state.settings.charts.find((item) => item.id === drawn.id);
    if (!before || !base) {
      continue;
    }
    const chart = withoutDrawnColors(before, drawn);
    if (isEqual(textPart(before), textPart(chart))) {
      continue;
    }
    const edited =
      before.type === chart.type
        ? (applyChange(
            base,
            textPart(before),
            textPart(chart),
            fillIns(chart)
          ) as SavedChartSettings)
        : newTypeChart(chart);
    const result = writeBackChart(current, state, edited, options);
    results.push({ ...result, chartId: chart.id });
    if (result.text !== current) {
      current = result.text;
      state = compileNotebook(current, options);
    }
  }
  return { text: current, results };
}
