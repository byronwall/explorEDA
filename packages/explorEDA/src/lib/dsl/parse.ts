/**
 * Splits dashboard text into declarations. Each declaration's head sits on
 * one line: a keyword, an optional `@name`, plain values, and `key=value`
 * pairs. A head that ends in `{` opens a body, closed by `}`. In a body, a
 * line that starts with `key=` adds settings to the declaration it belongs
 * to, and a line that starts with a word is a child declaration.
 * Whitespace never carries meaning, so pasted text reads the same however
 * it is indented.
 */

export interface DslSpan {
  line: number;
  column: number;
  length: number;
}

export interface DslItem {
  text: string;
  quoted: boolean;
}

/** A value: one item, or several separated by commas outside quotes. */
export interface DslValue {
  raw: string;
  items: DslItem[];
}

export interface DslPair {
  key: string;
  value: DslValue;
  span: DslSpan;
}

export interface DslPositional {
  value: DslValue;
  span: DslSpan;
}

export interface DslDeclaration {
  keyword: string;
  span: DslSpan;
  endLine: number;
  /** Optional `@name` that gives the declaration a stable identity. */
  name?: string;
  positional: DslPositional[];
  pairs: DslPair[];
  /** The text after `name=` on a `calc` line. */
  expression?: { text: string; span: DslSpan };
  /** For a field alias line such as `revenue:num=Revenue`. */
  alias?: { name: string; type?: string; field: DslValue; span: DslSpan };
  /** Declarations in this one's body, other than a view's. */
  children: DslDeclaration[];
  /** The index of the `view` this declaration sits in, if any. */
  view?: number;
  /** True when the head ended in `{`. */
  hasBody?: boolean;
}

export interface DslParseProblem {
  message: string;
  span: DslSpan;
  suggestion?: string;
}

export interface DslParseResult {
  /**
   * Every top-level declaration, and every declaration in a view's body,
   * in text order. Other declarations hold their bodies as `children`.
   */
  declarations: DslDeclaration[];
  problems: DslParseProblem[];
}

interface RawToken {
  text: string;
  column: number;
}

const ALIAS = /^([A-Za-z_][\w]*)(?::([A-Za-z]+))?=/;

/**
 * Words that only start a top-level declaration. One at the start of a
 * line inside an open body means a `}` is missing above it.
 */
const TOP_LEVEL = new Set([
  "dashboard",
  "view",
  "calc",
  "field",
  "scale",
  "group",
  "filter",
  "grid",
  "theme",
  "source",
  "rows",
  "project",
  "relate",
  "query",
  "param",
]);

/**
 * Splits a line at spaces outside quotes. `{` and `}` outside quotes are
 * tokens of their own. A `#` starting a token ends the line.
 */
export function tokenize(
  line: string,
  start = 0
): { tokens: RawToken[]; unclosed?: number } {
  const tokens: RawToken[] = [];
  let index = start;
  while (index < line.length) {
    while (index < line.length && /\s/.test(line[index]!)) {
      index++;
    }
    if (index >= line.length || line[index] === "#") {
      break;
    }
    if (line[index] === "{" || line[index] === "}") {
      tokens.push({ text: line[index]!, column: index });
      index++;
      continue;
    }
    const begin = index;
    let quoteStart: number | undefined;
    while (
      index < line.length &&
      (quoteStart !== undefined || !/[\s{}]/.test(line[index]!))
    ) {
      const char = line[index]!;
      if (quoteStart !== undefined) {
        if (char === "\\") {
          index++;
        } else if (char === '"') {
          quoteStart = undefined;
        }
      } else if (char === '"') {
        quoteStart = index;
      }
      index++;
    }
    if (quoteStart !== undefined) {
      return { tokens, unclosed: quoteStart };
    }
    tokens.push({ text: line.slice(begin, index), column: begin });
  }
  return { tokens };
}

const ESCAPES: Record<string, string> = { n: "\n", t: "\t", r: "\r" };

/**
 * Reads a quoted literal. Export writes strings as JSON, so the JSON escapes
 * for newlines, tabs, and code points read back; any other escaped
 * character stands for itself.
 */
function unquote(text: string): string {
  return text
    .slice(1, -1)
    .replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_match, escaped: string) =>
      escaped.startsWith("u")
        ? String.fromCharCode(parseInt(escaped.slice(1), 16))
        : (ESCAPES[escaped] ?? escaped)
    );
}

/** Splits at commas outside quotes, keeping whether each item was quoted. */
export function parseValue(raw: string): DslValue {
  const items: DslItem[] = [];
  let current = "";
  let quoted = false;
  let inQuote = false;
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index]!;
    if (inQuote) {
      current += char;
      if (char === "\\") {
        current += raw[++index] ?? "";
      } else if (char === '"') {
        inQuote = false;
      }
    } else if (char === '"') {
      inQuote = true;
      quoted = true;
      current += char;
    } else if (char === ",") {
      items.push(toItem(current, quoted));
      current = "";
      quoted = false;
    } else {
      current += char;
    }
  }
  items.push(toItem(current, quoted));
  return { raw, items };
}

function toItem(text: string, quoted: boolean): DslItem {
  return quoted && text.startsWith('"') && text.endsWith('"')
    ? { text: unquote(text), quoted: true }
    : { text, quoted: false };
}

/** Splits `key=value` at the first `=` outside quotes. */
export function splitPair(text: string): [string, string] | undefined {
  let inQuote = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"') {
      inQuote = !inQuote;
    }
    if (!inQuote && char === "=") {
      return index === 0
        ? undefined
        : [text.slice(0, index), text.slice(index + 1)];
    }
  }
  return undefined;
}

/** Strips a trailing ` # comment` outside quotes from a formula. */
function stripComment(text: string): string {
  let inQuote = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (inQuote && char === "\\") {
      index++;
      continue;
    }
    if (char === '"') {
      inQuote = !inQuote;
    }
    if (
      !inQuote &&
      char === "#" &&
      (index === 0 || /\s/.test(text[index - 1]!))
    ) {
      return text.slice(0, index);
    }
  }
  return text;
}

function addToken(declaration: DslDeclaration, token: RawToken, line: number) {
  const span = { line, column: token.column + 1, length: token.text.length };
  if (token.text.startsWith("@") && token.text.length > 1) {
    declaration.name = token.text.slice(1);
    return;
  }
  const pair = splitPair(token.text);
  if (pair) {
    declaration.pairs.push({
      key: pair[0],
      value: parseValue(pair[1]),
      span,
    });
  } else {
    declaration.positional.push({ value: parseValue(token.text), span });
  }
}

function newDeclaration(keyword: string, span: DslSpan): DslDeclaration {
  return {
    keyword,
    span,
    endLine: span.line,
    positional: [],
    pairs: [],
    children: [],
  };
}

/** A `calc` line: the name, then the formula to the end of the line. */
function parseCalc(
  content: string,
  indent: number,
  line: number,
  problems: DslParseProblem[]
): DslDeclaration | undefined {
  const keywordEnd = 4;
  const span = { line, column: indent + 1, length: keywordEnd };
  const rest = stripComment(content.slice(indent + keywordEnd));
  const restStart =
    indent + keywordEnd + (rest.length - rest.trimStart().length);
  const body = rest.trim();
  // A quoted name holds spaces: calc "Net sales" = gross - discount.
  const quotedName = /^"((?:[^"\\]|\\.)*)"\s*=/.exec(body);
  const equals = quotedName ? quotedName[0].length - 1 : body.indexOf("=");
  const name = quotedName
    ? unquote(`"${quotedName[1]}"`)
    : equals > 0
      ? body.slice(0, equals).trim()
      : "";
  if (quotedName ? !name.trim() : !/^[A-Za-z_][\w]*$/.test(name)) {
    problems.push({
      message: "A calculation needs a name and a formula.",
      span: { line, column: indent + 1, length: content.length - indent },
      suggestion: "Write it as calc profit = revenue - cost.",
    });
    return undefined;
  }
  const declaration = newDeclaration("calc", span);
  declaration.name = name;
  const formula = body.slice(equals + 1);
  declaration.expression = {
    text: formula.trim(),
    span: {
      line,
      column:
        restStart + equals + 2 + (formula.length - formula.trimStart().length),
      length: formula.trim().length,
    },
  };
  return declaration;
}

/**
 * A `calc` step in a query body. Its head runs to the first ` = ` outside
 * quotes, so it can carry an `@name`, a label, and settings before the
 * formula: calc @dep-band dep_band "Departure status" = if ….
 */
function parseStepCalc(
  content: string,
  indent: number,
  line: number,
  problems: DslParseProblem[]
): DslDeclaration | undefined {
  const span = { line, column: indent + 1, length: 4 };
  const text = stripComment(content);
  let inQuote = false;
  let equals = -1;
  for (let index = indent + 4; index < text.length; index++) {
    const char = text[index]!;
    if (inQuote && char === "\\") {
      index++;
    } else if (char === '"') {
      inQuote = !inQuote;
    } else if (
      !inQuote &&
      char === "=" &&
      /\s/.test(text[index - 1]!) &&
      /\s|$/.test(text[index + 1] ?? "")
    ) {
      equals = index;
      break;
    }
  }
  const declaration = newDeclaration("calc", span);
  if (equals >= 0) {
    const { tokens } = tokenize(text.slice(0, equals), indent + 4);
    for (const token of tokens) {
      addToken(declaration, token, line);
    }
  }
  const formula = equals >= 0 ? text.slice(equals + 1) : "";
  if (!declaration.positional.length || !formula.trim()) {
    problems.push({
      message: "A calc step needs a field and a formula.",
      span: { line, column: indent + 1, length: content.length - indent },
      suggestion: 'Write it as calc margin "Margin" = revenue - cost.',
    });
    return undefined;
  }
  declaration.expression = {
    text: formula.trim(),
    span: {
      line,
      column: equals + 2 + (formula.length - formula.trimStart().length),
      length: formula.trim().length,
    },
  };
  return declaration;
}

interface OpenBlock {
  declaration: DslDeclaration;
  /** The line holding the `{`. */
  line: number;
}

export function parseDocument(text: string): DslParseResult {
  const declarations: DslDeclaration[] = [];
  const problems: DslParseProblem[] = [];
  const lines = text.split(/\r?\n/);
  const stack: OpenBlock[] = [];
  let viewCount = 0;
  /** The last line with content, to say where a missing `}` goes. */
  let lastContentLine = 0;

  const currentView = () => {
    for (let index = stack.length - 1; index >= 0; index--) {
      const declaration = stack[index]!.declaration;
      if (declaration.keyword === "view") {
        return declaration.view;
      }
    }
    return undefined;
  };

  /** Puts a new declaration where it belongs: a view's body is flat. */
  const place = (declaration: DslDeclaration) => {
    const parent = stack.at(-1)?.declaration;
    if (!parent || parent.keyword === "view") {
      declaration.view = currentView();
      declarations.push(declaration);
    } else {
      parent.children.push(declaration);
    }
    if (declaration.keyword === "view") {
      declaration.view = viewCount++;
    }
  };

  const closeAll = (keyword: string) => {
    const open = stack.at(-1)!;
    problems.push({
      message: `${open.declaration.keyword} on line ${open.line} has no closing }, so it ends before this ${keyword}.`,
      span: open.declaration.span,
      suggestion: `Add } after line ${Math.max(open.line, lastContentLine)}.`,
    });
    for (const block of stack) {
      block.declaration.endLine = Math.max(block.line, lastContentLine);
    }
    stack.length = 0;
  };

  lines.forEach((content, index) => {
    const line = index + 1;
    const trimmed = content.trimStart();
    const indent = content.length - trimmed.length;
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }
    const firstWord = trimmed.slice(0, trimmed.search(/[\s{}]|$/));

    // A top-level word flush left inside a body: the body is missing its }.
    if (stack.length && indent === 0 && TOP_LEVEL.has(firstWord)) {
      closeAll(firstWord);
    }

    if (firstWord === "+") {
      problems.push({
        message: "A + line no longer continues the line above.",
        span: { line, column: indent + 1, length: 1 },
        suggestion:
          "End the line above with {, put these settings on their own lines, and close with }.",
      });
      return;
    }

    if (firstWord === "calc") {
      const declaration =
        stack.at(-1)?.declaration.keyword === "query"
          ? parseStepCalc(content, indent, line, problems)
          : parseCalc(content, indent, line, problems);
      if (declaration) {
        place(declaration);
      }
      lastContentLine = line;
      return;
    }

    const { tokens, unclosed } = tokenize(content, indent);
    if (unclosed !== undefined) {
      problems.push({
        message: "This quoted value has no closing quote.",
        span: { line, column: unclosed + 1, length: content.length - unclosed },
        suggestion: 'Close the value with ".',
      });
    }

    /** The declaration this line's tokens go to. */
    let current: DslDeclaration | undefined;
    /** True while the tokens are settings for the enclosing declaration. */
    let settingsLine = false;
    for (const token of tokens) {
      const span = {
        line,
        column: token.column + 1,
        length: token.text.length,
      };
      if (token.text === "{") {
        if (!current || settingsLine) {
          problems.push({
            message: "{ opens a body, but there is no declaration before it.",
            span,
            suggestion: "Put { at the end of the line that starts the block.",
          });
          continue;
        }
        current.hasBody = true;
        stack.push({ declaration: current, line });
        current = undefined;
        settingsLine = false;
        continue;
      }
      if (token.text === "}") {
        const open = stack.pop();
        if (!open) {
          problems.push({
            message: "This } closes nothing.",
            span,
            suggestion:
              "Remove it, or add { to the line that starts the block.",
          });
        } else {
          open.declaration.endLine = line;
        }
        current = undefined;
        settingsLine = false;
        continue;
      }
      if (current) {
        addToken(current, token, line);
        current.endLine = line;
        continue;
      }
      // The first token of a statement decides what it is.
      const parent = stack.at(-1)?.declaration;
      const pair = splitPair(token.text);
      if ((pair || token.text.startsWith("@")) && parent) {
        // Settings, or a name, for the declaration whose body this is.
        current = parent;
        settingsLine = true;
        addToken(parent, token, line);
        continue;
      }
      const alias = !parent ? ALIAS.exec(token.text) : null;
      if (alias) {
        const declaration = newDeclaration("alias", span);
        declaration.alias = {
          name: alias[1]!,
          type: alias[2],
          field: parseValue(token.text.slice(alias[0].length)),
          span,
        };
        place(declaration);
        current = declaration;
        continue;
      }
      if (pair) {
        problems.push({
          message: `${pair[0]}= is a setting, but it isn't inside a declaration's { }.`,
          span,
          suggestion:
            "Put it on the declaration's line, or inside the { } after it.",
        });
        break;
      }
      const declaration = newDeclaration(token.text, span);
      place(declaration);
      current = declaration;
    }
    lastContentLine = line;
  });

  if (stack.length) {
    const open = stack.at(-1)!;
    problems.push({
      message: `${open.declaration.keyword} on line ${open.line} has no closing }.`,
      span: open.declaration.span,
      suggestion: `Add } after line ${lastContentLine}.`,
    });
    for (const block of stack) {
      block.declaration.endLine = lastContentLine;
    }
  }

  return { declarations, problems };
}
