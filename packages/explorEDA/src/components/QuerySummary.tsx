import { useMemo } from "react";
import { toSavedData } from "@/chart/config";
import { SummaryTable } from "@/components/charts/SummaryTable/SummaryTable";
import type { SummaryTableSettings } from "@/components/charts/SummaryTable/definition";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { queryInput } from "./project/queryInput";

export interface QuerySummaryProps {
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  /** The query to summarize, such as a source's own query. */
  queryId: string;
  /** Height in pixels; the fields scroll inside it. */
  height: number;
}

/**
 * A read-only summary of every field a query returns: type, distinct and
 * missing counts, and spread. It is the Summary Table a view of the same
 * query shows, from the same rows and declared types, without a workspace.
 */
export function QuerySummary({
  project,
  tables,
  queryId,
  height,
}: QuerySummaryProps) {
  const summary = useMemo(() => {
    try {
      const input = queryInput(evaluateAnalysisQuery(project, tables, queryId));
      const savedData = {
        ...toSavedData({ type: "summary" }, "summary"),
        fieldSettings: input.declared,
      };
      return { ...input, savedData };
    } catch {
      return undefined;
    }
  }, [project, tables, queryId]);

  if (!summary) return null;
  return (
    <div className="eda-workspace eda-query-summary">
      <DataLayerProvider
        data={summary.data}
        fieldNames={summary.fieldNames}
        fieldTypes={summary.fieldTypes}
        savedData={summary.savedData}
        selections={false}
      >
        <SummaryTable
          settings={summary.savedData.charts[0] as SummaryTableSettings}
          width={0}
          height={height}
        />
      </DataLayerProvider>
    </div>
  );
}
