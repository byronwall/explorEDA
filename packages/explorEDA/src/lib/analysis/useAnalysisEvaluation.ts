import { useMemo } from "react";
import type {
  AnalysisEvaluation,
  AnalysisProject,
  AnalysisScalar,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { evaluateAnalysisQuery } from "./evaluateProject";

export interface AnalysisEvaluationState {
  status: "pending" | "ready" | "error";
  /** The rows on screen. While pending, the last result that finished. */
  evaluation: AnalysisEvaluation;
  /** The parameter values `evaluation` was computed with. */
  appliedBindings?: Record<string, AnalysisScalar>;
  error?: string;
}

export function emptyEvaluation(queryId: string): AnalysisEvaluation {
  return {
    queryId,
    revision: "unavailable",
    fields: [],
    rows: [],
    stages: [],
    diagnostics: [],
    counts: { source: 0, output: 0, available: 0, excluded: 0 },
  };
}

/** Evaluates on the main thread. Small and medium projects finish in a frame. */
export function useAnalysisEvaluation(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  queryId: string,
  bindings: Record<string, AnalysisScalar>
): AnalysisEvaluationState {
  return useMemo(() => {
    try {
      return {
        status: "ready",
        evaluation: evaluateAnalysisQuery(project, tables, queryId, bindings),
        appliedBindings: bindings,
      };
    } catch (error) {
      return {
        status: "error",
        evaluation: emptyEvaluation(queryId),
        error:
          error instanceof Error ? error.message : "The query could not run.",
      };
    }
  }, [project, tables, queryId, bindings]);
}
