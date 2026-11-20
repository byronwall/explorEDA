// Writes dist/chart.css: the workspace stylesheet, scoped to standalone
// charts. Every rule matches only inside an element with the
// `eda-standalone` class, so a host page keeps its own reset, variables, and
// element styles. `:where()` adds no specificity, so rules cascade inside a
// chart exactly as they do in the workspace.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const ROOT = ".eda-standalone";
const INSIDE = `:where(${ROOT}, ${ROOT} *)`;
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), "../dist");

/**
 * Splits at commas and combinators outside brackets, parentheses, and
 * escapes such as Tailwind's `.\\[\\&\\>svg\\]`.
 */
function split(selector, separators) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const char = selector[i];
    if (char === "\\") i++;
    else if (char === "(" || char === "[") depth++;
    else if (char === ")" || char === "]") depth--;
    else if (depth === 0 && separators.includes(char)) {
      parts.push(selector.slice(start, i), char);
      start = i + 1;
    }
  }
  parts.push(selector.slice(start));
  return parts;
}

/** One complex selector, scoped to the chart root and its descendants. */
export function scopeSelector(selector) {
  let text = selector.trim();
  // The document root holds the theme variables and base font: the chart
  // root takes them instead.
  text = text.replace(/^(:root|:host|html|body)(?![\w-])/, ROOT);
  if (text.startsWith(ROOT)) return text;
  // A dark host marks an ancestor; keep that and scope what follows.
  const dark = /^\.dark(?=[\s>]|$)/.exec(text);
  if (dark) {
    const rest = text.slice(dark[0].length).trim();
    return rest ? `.dark ${scopeSelector(rest)}` : `.dark ${ROOT}`;
  }
  const parts = split(text, " >+~");
  const first = parts[0];
  // Before a pseudo-element, which must end its compound.
  const pseudo = first.indexOf("::");
  parts[0] =
    pseudo === -1
      ? `${first}${INSIDE}`
      : `${first.slice(0, pseudo)}${INSIDE}${first.slice(pseudo)}`;
  return parts.join("");
}

export function scopeCss(css) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    // Keyframe steps and nested rules inherit their scope.
    if (rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name))
      return;
    if (rule.parent?.type === "rule" || /(^|[^\\])&/.test(rule.selector))
      return;
    rule.selectors = rule.selectors.map((selector) =>
      split(selector, ",")
        .filter((part) => part !== ",")
        .map(scopeSelector)
        .join(", ")
    );
  });
  return root.toString();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const css = readFileSync(path.join(dist, "ExplorEda.css"), "utf8");
  writeFileSync(path.join(dist, "chart.css"), scopeCss(css));
}
