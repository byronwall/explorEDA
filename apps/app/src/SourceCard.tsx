import { usedByText } from "./explore";
import {
  QuerySummary,
  type AnalysisProject,
  type AnalysisSourceRow,
} from "exploreda";

/** Fields scroll inside this height, so the card stays about a third of the screen. */
const SUMMARY_HEIGHT = 320;

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
        height={SUMMARY_HEIGHT}
      />
      <span className="app-source-card-foot">
        {usedByText(usedBy).replace(/^./, (first) => first.toUpperCase())}.
        Choose it to explore every row.
      </span>
    </div>
  );
}
