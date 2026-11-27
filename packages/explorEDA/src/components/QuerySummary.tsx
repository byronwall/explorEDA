import { useMemo } from "react";
import { toSavedData } from "@/chart/config";
import { SummaryTable } from "@/components/charts/SummaryTable/SummaryTable";
import type { SummaryTableSettings } from "@/components/charts/SummaryTable/definition";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import type {
  AnalysisProject,
  AnalysisScalar,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { queryInput, withDeclared } from "./project/queryInput";

export interface QuerySummaryProps {
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  /** The query to summarize, such as a source's own query. */
  queryId: string;
  /** Parameter inputs, as the view of a parameterized query binds them. */
  bindings?: Record<string, AnalysisScalar>;
  /** A view's own field settings: labels, types, formats, missing tokens. */
  fieldSettings?: SavedDataStructure["fieldSettings"];
  /**
   * The most rows to profile. A query that returns more shows its row count
   * instead, so a preview never stalls the page.
   */
  maxRows?: number;
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
  bindings,
  fieldSettings,
  maxRows,
  height,
}: QuerySummaryProps) {
  const summary = useMemo(() => {
    try {
      const evaluation = evaluateAnalysisQuery(
        project,
        tables,
        queryId,
        bindings
      );
      if (maxRows !== undefined && evaluation.rows.length > maxRows) {
        return { tooMany: evaluation.rows.length } as const;
      }
      const input = queryInput(evaluation);
      const savedData = {
        ...toSavedData({ type: "summary" }, "summary"),
        fieldSettings: withDeclared(input.declared, fieldSettings),
      };
      return { ...input, savedData, tooMany: undefined };
    } catch {
      return undefined;
    }
  }, [project, tables, queryId, bindings, fieldSettings, maxRows]);

  if (!summary) return null;
  if (summary.tooMany !== undefined) {
    return (
      <p className="eda-query-summary eda-query-summary-note">
        {summary.tooMany.toLocaleString()} rows: too many to summarize here.
      </p>
    );
  }
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
