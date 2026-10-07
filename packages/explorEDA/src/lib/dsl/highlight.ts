/**
 * Splits dashboard text into colored pieces for an editor. It reads lines
 * with the parser's own lexer, so a piece is colored the way the parser will
 * read it. The pieces of a line join back into that exact line.
 */
import { DSL_CHART_KEYWORDS, DSL_OTHER_KEYWORDS } from "./compile";
import { splitPair, tokenize } from "./parse";

export type DslTokenKind =
  /** A word that starts a declaration, such as scatter, grid, or calc. */
  | "keyword"
  /** The chart type after `chart`, or a field type such as `:num`. */
  | "type"
  /** A `+` that continues the declaration above. */
  | "continuation"
  /** A setting name before `=`, such as xAxis.scaleType. */
  | "key"
  /** `@name`: a declaration's name, or a value that points at one. */
  | "reference"
  | "string"
  | "number"
  /** true, false, null, and unset. */
  | "constant"
  /** `=`, `,`, `..`, and the operators in a formula. */
  | "operator"
  | "comment"
  /** Field names and other plain words. */
  | "text"
  | "space";

export interface DslToken {
  text: string;
  kind: DslTokenKind;
}

const CONSTANTS = /^(true|false|null|unset)$/;
const NUMBER = /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;
const KEYWORDS = new Set([
  ...Object.keys(DSL_CHART_KEYWORDS),
  ...DSL_OTHER_KEYWORDS,
]);
const ALIAS = /^([A-Za-z_]\w*)(:[A-Za-z]+)?=/;

/** Splits text at commas outside quotes, keeping each piece's raw text. */
function splitItems(raw: string): string[] {
  const items: string[] = [];
  let start = 0;
  let inQuote = false;
  for (let index = 0; index < raw.length; index++) {
    const char = raw[index];
    if (inQuote && char === "\\") {
      index++;
    } else if (char === '"') {
      inQuote = !inQuote;
    } else if (!inQuote && char === ",") {
      items.push(raw.slice(start, index));
      start = index + 1;
    }
  }
  items.push(raw.slice(start));
  return items;
}

function scalar(text: string): DslToken {
  if (text.startsWith('"')) {
    return { text, kind: "string" };
  }
  if (CONSTANTS.test(text)) {
    return { text, kind: "constant" };
  }
  if (NUMBER.test(text)) {
    return { text, kind: "number" };
  }
  if (text.startsWith("@") && text.length > 1) {
    return { text, kind: "reference" };
  }
  return { text, kind: "text" };
}

/** One value: comma-separated items, each maybe a `min..max` range. */
function valueTokens(raw: string): DslToken[] {
  const tokens: DslToken[] = [];
  splitItems(raw).forEach((item, index) => {
    if (index > 0) {
      tokens.push({ text: ",", kind: "operator" });
    }
    if (!item) {
      return;
    }
    const range = item.startsWith('"') ? -1 : item.indexOf("..");
    if (range >= 0) {
      const [min, max] = [item.slice(0, range), item.slice(range + 2)];
      if (min) {
        tokens.push(scalar(min));
      }
      tokens.push({ text: "..", kind: "operator" });
      if (max) {
        tokens.push(scalar(max));
      }
      return;
    }
    tokens.push(scalar(item));
  });
  return tokens;
}

/** A `key=value` or plain token from the lexer. */
function wordTokens(word: string, positional: DslTokenKind): DslToken[] {
  if (word.startsWith("@") && word.length > 1) {
    return [{ text: word, kind: "reference" }];
  }
  const pair = splitPair(word);
  if (!pair) {
    const tokens = valueTokens(word);
    return positional === "text"
      ? tokens
      : tokens.map((token) =>
          token.kind === "text" ? { ...token, kind: positional } : token
        );
  }
  return [
    { text: pair[0], kind: "key" },
    { text: "=", kind: "operator" },
    ...valueTokens(pair[1]),
  ];
}

/** A formula after `calc name=`: strings, numbers, names, and operators. */
function formulaTokens(text: string): DslToken[] {
  const tokens: DslToken[] = [];
  const pattern =
    /("(?:[^"\\]|\\.)*"?)|(\s+#.*$)|(\s+)|(\d+\.?\d*(?:e[+-]?\d+)?|\.\d+)|([A-Za-z_][\w.]*)|([^\w\s"]+)/gy;
  let match: RegExpExecArray | null;
  while (pattern.lastIndex < text.length && (match = pattern.exec(text))) {
    const [piece, string, comment, space, number, name] = match;
    if (comment) {
      const hash = comment.indexOf("#");
      tokens.push({ text: comment.slice(0, hash), kind: "space" });
      tokens.push({ text: comment.slice(hash), kind: "comment" });
    } else {
      tokens.push({
        text: piece,
        kind: string
          ? "string"
          : space
            ? "space"
            : number
              ? "number"
              : name
                ? CONSTANTS.test(name)
                  ? "constant"
                  : "text"
                : "operator",
      });
    }
  }
  return tokens;
}

/** Joins neighbors of the same kind, so a line renders as few spans. */
function merge(tokens: DslToken[]): DslToken[] {
  const merged: DslToken[] = [];
  for (const token of tokens) {
    if (!token.text) {
      continue;
    }
    const last = merged.at(-1);
    if (last && last.kind === token.kind) {
      last.text += token.text;
    } else {
      merged.push({ ...token });
    }
  }
  return merged;
}

function highlightLine(line: string): DslToken[] {
  const trimmed = line.trimStart();
  const indent = line.slice(0, line.length - trimmed.length);
  if (!trimmed) {
    return merge([{ text: line, kind: "space" }]);
  }
  if (trimmed.startsWith("#")) {
    return merge([
      { text: indent, kind: "space" },
      { text: trimmed, kind: "comment" },
    ]);
  }
  const tokens: DslToken[] = [{ text: indent, kind: "space" }];
  let cursor = indent.length;
  const continued =
    trimmed.startsWith("+") && (trimmed.length === 1 || /\s/.test(trimmed[1]!));
  if (continued) {
    tokens.push({ text: "+", kind: "continuation" });
    cursor++;
  }

  const keyword = continued ? "" : trimmed.slice(0, trimmed.search(/\s|$/));
  if (keyword === "calc") {
    tokens.push({ text: keyword, kind: "keyword" });
    const rest = line.slice(cursor + keyword.length);
    const name = /^(\s*)("(?:[^"\\]|\\.)*"|[^\s=]*)(\s*)(=?)/.exec(rest)!;
    tokens.push(
      { text: name[1]!, kind: "space" },
      { text: name[2]!, kind: name[2]!.startsWith('"') ? "string" : "key" },
      { text: name[3]!, kind: "space" },
      { text: name[4]!, kind: "operator" },
      ...formulaTokens(rest.slice(name[0].length))
    );
    return merge(tokens);
  }

  const { tokens: words, unclosed } = tokenize(line, cursor);
  words.forEach((word, index) => {
    tokens.push({ text: line.slice(cursor, word.column), kind: "space" });
    cursor = word.column + word.text.length;
    const first = index === 0 && !continued;
    if (first && KEYWORDS.has(word.text)) {
      tokens.push({ text: word.text, kind: "keyword" });
      return;
    }
    const alias = first ? ALIAS.exec(word.text) : null;
    if (alias) {
      tokens.push(
        { text: alias[1]!, kind: "key" },
        { text: alias[2] ?? "", kind: "type" },
        { text: "=", kind: "operator" },
        ...valueTokens(word.text.slice(alias[0].length))
      );
      return;
    }
    // The type after `chart`, such as `chart boxplot`, reads as a keyword.
    const chartType = index === 1 && !continued && words[0]!.text === "chart";
    tokens.push(...wordTokens(word.text, chartType ? "type" : "text"));
  });

  const rest = line.slice(cursor);
  const restText = rest.trimStart();
  tokens.push({
    text: rest.slice(0, rest.length - restText.length),
    kind: "space",
  });
  if (unclosed !== undefined) {
    // A value whose quote never closes: color it as the string it starts.
    const quote = restText.indexOf('"');
    const head = restText.slice(0, quote);
    const pair = head.endsWith("=") ? head.slice(0, -1) : undefined;
    tokens.push(
      ...(pair !== undefined
        ? [
            { text: pair, kind: "key" as const },
            { text: "=", kind: "operator" as const },
          ]
        : [{ text: head, kind: "text" as const }]),
      { text: restText.slice(quote), kind: "string" }
    );
  } else if (restText) {
    tokens.push({ text: restText, kind: "comment" });
  }
  return merge(tokens);
}

/**
 * Colors dashboard text for display, one token list per line. Joining a
 * line's token texts gives back that line exactly, so an editor can draw the
 * tokens under a transparent text area and keep them aligned.
 */
export function highlightDsl(text: string): DslToken[][] {
  return text.split(/\r?\n/).map(highlightLine);
}
