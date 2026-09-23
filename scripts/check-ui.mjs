import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
const failures = [];
for (const path of [
  ...files("packages/explorEDA/src"),
  ...files("apps/demo/src"),
]) {
  if (!/\.(tsx|css)$/.test(path) || /\.test\.tsx$/.test(path)) continue;
  const text = readFileSync(path, "utf8");
  const report = (position, message) =>
    failures.push(
      `${path}:${text.slice(0, position).split("\n").length}: ${message}`
    );
  if (path.endsWith(".tsx")) {
    const source = ts.createSourceFile(
      path,
      text,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX
    );
    const visit = (node) => {
      if (
        (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) &&
        (ts.isJsxElement(node) ? node.openingElement : node).tagName.getText(
          source
        ) === "title"
      ) {
        report(
          node.getStart(source),
          "SVG <title> creates a native hover tooltip; use aria-label or visible text."
        );
      }
      if (ts.isJsxAttribute(node) && node.name.getText(source) === "title") {
        report(
          node.getStart(source),
          "Use ActionTooltip or Button tooltip for actions; omit redundant hover text."
        );
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  const rawBorder =
    /\bborder-(?:black|white|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+|\[(?:#|rgb|hsl|oklch|oklab|lab|lch|color))|(?<![-\w])border(?:-?(?:top|right|bottom|left))?(?:-?color)?["']?\s*:\s*[^;,\n{}]*(?:#[\da-f]{3,8}|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(|\b(?:black|white)\b)/gi;
  for (const match of text.matchAll(rawBorder))
    report(
      match.index,
      "Use semantic border tokens, including status borders."
    );
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "UI conventions pass: semantic borders and no native title tooltips."
  );
