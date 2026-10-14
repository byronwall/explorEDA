import { formatDsl } from "@/lib/dsl";
import { parseNotebook } from "./parseNotebook";

/**
 * Formats the dashboard text in each `eda` block and leaves the prose, the
 * fences, and everything between blocks exactly as written.
 */
export function formatNotebook(text: string): string {
  const { blocks, lines } = parseNotebook(text);
  const out = [...lines];
  // From the last block back, so earlier line numbers stay put.
  for (const block of [...blocks].reverse()) {
    if (!block.text.trim()) {
      continue;
    }
    const formatted = formatDsl(block.text).replace(/\n$/, "").split("\n");
    out.splice(
      block.startLine - 1,
      block.endLine - block.startLine + 1,
      ...formatted
    );
  }
  return out.join("\n");
}
