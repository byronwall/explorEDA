import type { AnalysisProject } from "exploreda";

/**
 * A complete analysis over related source tables. The tables load from CSV
 * files; every tab in `text` charts the result of `queryId`.
 */
export interface ExampleAnalysis {
  project: AnalysisProject;
  /** Source ID to the CSV file that holds its rows. */
  tableFiles: Record<string, string>;
  /** The query every tab charts. Defaults to the project's first query. */
  queryId?: string;
  /** Dashboard text with one `view` per tab. */
  text: string;
}

/** Escapes text for a quoted dashboard-text value. */
export function quoted(text: string) {
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** A result note: a heading line and short findings, as notes-chart HTML. */
export function note(heading: string, lines: string[]) {
  return quoted(
    `<p><strong>${heading}</strong></p>` +
      `<ul>${lines.map((line) => `<li>${line}</li>`).join("")}</ul>`
  );
}

export const formatCount = (value: number) => value.toLocaleString("en-US");

export const percent = (part: number, whole: number) =>
  `${Math.round((part / whole) * 100)}%`;
