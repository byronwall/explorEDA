import type { AnalysisQuery } from "@/types/AnalysisProject";

const glyphs = ["◆", "◇", "●", "▦", "◈", "⬡", "▣", "◉"];

export function nextQueryGlyph(
  queries: readonly Pick<AnalysisQuery, "glyph">[]
) {
  const used = new Set(queries.map((query) => query.glyph));
  const available = glyphs.find((glyph) => !used.has(glyph));
  if (available) return available;

  let suffix = 2;
  while (used.has(`${glyphs[0]}${suffix}`)) suffix += 1;
  return `${glyphs[0]}${suffix}`;
}
