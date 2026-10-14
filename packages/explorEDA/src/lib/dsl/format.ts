/**
 * Formats dashboard text: indents each line by its brace depth, puts one
 * space between tokens, and keeps every token, comment, and line break the
 * author wrote. Whitespace never changes meaning, so formatting never does.
 */
import { tokenize } from "./parse";

const INDENT = "  ";

/** The `# comment` after a line's last token, if any. */
function trailingComment(line: string, end: number): string {
  const rest = line.slice(end).trim();
  return rest.startsWith("#") ? ` ${rest}` : "";
}

export function formatDsl(text: string): string {
  const out: string[] = [];
  let depth = 0;
  for (const raw of text.split(/\r?\n/)) {
    const trimmed = raw.trim();
    if (!trimmed) {
      // One blank line at most, and none at the start of a body.
      if (out.length && out.at(-1) !== "" && !out.at(-1)!.endsWith("{")) {
        out.push("");
      }
      continue;
    }
    if (trimmed.startsWith("#")) {
      out.push(`${INDENT.repeat(depth)}${trimmed}`);
      continue;
    }
    // A formula runs to the end of its line, so it keeps its own spacing.
    if (/^calc\s/.test(trimmed)) {
      out.push(`${INDENT.repeat(depth)}${trimmed}`);
      continue;
    }
    const { tokens, unclosed } = tokenize(raw);
    if (unclosed !== undefined || !tokens.length) {
      out.push(`${INDENT.repeat(depth)}${trimmed}`);
      continue;
    }
    // Leading closers belong to the body they end.
    let leading = 0;
    while (tokens[leading]?.text === "}") {
      leading++;
    }
    const lineDepth = Math.max(0, depth - leading);
    const last = tokens.at(-1)!;
    const comment = trailingComment(raw, last.column + last.text.length);
    if (leading && out.at(-1) === "") {
      out.pop();
    }
    out.push(
      `${INDENT.repeat(lineDepth)}${tokens.map((token) => token.text).join(" ")}${comment}`
    );
    for (const token of tokens) {
      if (token.text === "{") {
        depth++;
      } else if (token.text === "}") {
        depth = Math.max(0, depth - 1);
      }
    }
  }
  while (out.at(-1) === "") {
    out.pop();
  }
  return `${out.join("\n")}\n`;
}
