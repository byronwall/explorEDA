/**
 * Splits dashboard text into declarations. One declaration starts on each
 * line; a line that starts with `+` continues the one above it. Values are
 * flat `key=value` pairs, so no setting needs nested indentation.
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
}

export interface DslParseProblem {
  message: string;
  span: DslSpan;
  suggestion?: string;
}

export interface DslParseResult {
  declarations: DslDeclaration[];
  problems: DslParseProblem[];
}

interface RawToken {
  text: string;
  column: number;
}

const ALIAS = /^([A-Za-z_][\w]*)(?::([A-Za-z]+))?=/;

/** Splits a line at spaces outside quotes. A `#` starting a token ends it. */
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
    const begin = index;
    let quoteStart: number | undefined;
    while (
      index < line.length &&
      (quoteStart !== undefined || !/\s/.test(line[index]!))
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

function addTokens(
  declaration: DslDeclaration,
  tokens: RawToken[],
  line: number
) {
  for (const token of tokens) {
    const span = { line, column: token.column + 1, length: token.text.length };
    if (token.text.startsWith("@") && token.text.length > 1) {
      declaration.name = token.text.slice(1);
      continue;
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
}

export function parseDocument(text: string): DslParseResult {
  const declarations: DslDeclaration[] = [];
  const problems: DslParseProblem[] = [];
  const lines = text.split(/\r?\n/);

  lines.forEach((content, index) => {
    const line = index + 1;
    const trimmed = content.trimStart();
    const indent = content.length - trimmed.length;
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    if (
      trimmed.startsWith("+") &&
      (trimmed.length === 1 || /\s/.test(trimmed[1]!))
    ) {
      const previous = declarations.at(-1);
      const { tokens, unclosed } = tokenize(content, indent + 1);
      if (unclosed !== undefined) {
        problems.push({
          message: "This quoted value has no closing quote.",
          span: {
            line,
            column: unclosed + 1,
            length: content.length - unclosed,
          },
          suggestion: 'Close the value with ".',
        });
      }
      if (!previous) {
        problems.push({
          message:
            "A + line continues the declaration above it, but there is none.",
          span: { line, column: indent + 1, length: 1 },
          suggestion: "Start the declaration on this line without the +.",
        });
        return;
      }
      previous.endLine = line;
      addTokens(previous, tokens, line);
      return;
    }

    const keywordEnd = trimmed.search(/\s|$/);
    const keyword = trimmed.slice(0, keywordEnd);
    const span = { line, column: indent + 1, length: keyword.length };

    if (keyword === "calc") {
      const rest = stripComment(content.slice(indent + keywordEnd));
      const restStart =
        indent + keywordEnd + (rest.length - rest.trimStart().length);
      const body = rest.trim();
      // A quoted name holds spaces: calc "Net sales"=gross-discount.
      const quotedName = /^"((?:[^"\\]|\\.)*)"\s*=/.exec(body);
      const equals = quotedName ? quotedName[0].length - 1 : body.indexOf("=");
      const name = quotedName
        ? unquote(`"${quotedName[1]}"`)
        : equals > 0
          ? body.slice(0, equals).trim()
          : "";
      const declaration: DslDeclaration = {
        keyword,
        span,
        endLine: line,
        positional: [],
        pairs: [],
      };
      if (quotedName ? !name.trim() : !/^[A-Za-z_][\w]*$/.test(name)) {
        problems.push({
          message: "A calculation needs a name and a formula.",
          span: { line, column: indent + 1, length: content.length - indent },
          suggestion: "Write it as calc profit=revenue-cost.",
        });
        return;
      }
      declaration.name = name;
      const formula = body.slice(equals + 1);
      declaration.expression = {
        text: formula.trim(),
        span: {
          line,
          column:
            restStart +
            equals +
            2 +
            (formula.length - formula.trimStart().length),
          length: formula.trim().length,
        },
      };
      declarations.push(declaration);
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
    const first = tokens[0];
    if (!first) {
      return;
    }
    const alias = ALIAS.exec(first.text);
    if (alias) {
      const declaration: DslDeclaration = {
        keyword: "alias",
        span: { line, column: first.column + 1, length: first.text.length },
        endLine: line,
        positional: [],
        pairs: [],
        alias: {
          name: alias[1]!,
          type: alias[2],
          field: parseValue(first.text.slice(alias[0].length)),
          span: { line, column: first.column + 1, length: first.text.length },
        },
      };
      addTokens(declaration, tokens.slice(1), line);
      declarations.push(declaration);
      return;
    }
    const declaration: DslDeclaration = {
      keyword: first.text,
      span: { line, column: first.column + 1, length: first.text.length },
      endLine: line,
      positional: [],
      pairs: [],
    };
    addTokens(declaration, tokens.slice(1), line);
    declarations.push(declaration);
  });

  return { declarations, problems };
}
