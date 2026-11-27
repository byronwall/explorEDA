import { usedByText } from "./explore";
import {
  QuerySummary,
  type AnalysisProject,
  type AnalysisSourceRow,
} from "exploreda";

/** Fields scroll inside this height, so the card stays about a third of the screen. */
const SUMMARY_HEIGHT = 320;

/**
 * The most rows a card profiles. It works them out on each hover: about
 * 60 ms for 21,813 rows, so this many takes ~150 ms. A query that expands
 * past it, such as one that looks up many rows per source row, shows its
 * row count instead.
 */
const CARD_ROW_LIMIT = 50_000;

/**
 * A source's field summary, shown when the pointer rests on it in the rail:
 * the same summary its explorer opens on, from the same declared fields.
 */
export function SourceCard({
  project,
  tables,
  sourceId,
  usedBy,
}: {
  usedBy?: string[];
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  sourceId: string;
}) {
  return (
    <div className="app-source-card">
      <QuerySummary
        project={project}
        tables={tables}
        queryId={sourceId}
        maxRows={CARD_ROW_LIMIT}
        height={SUMMARY_HEIGHT}
      />
      <span className="app-source-card-foot">
        {usedByText(usedBy).replace(/^./, (first) => first.toUpperCase())}.
        Choose it to explore every row.
      </span>
    </div>
  );
}
