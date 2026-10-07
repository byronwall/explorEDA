import { evaluateAnalysisQuery } from "./evaluateProject";
import type {
  AnalysisEvaluation,
  AnalysisProject,
  AnalysisScalar,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";

export type AnalysisWorkerRequest =
  | {
      type: "sources";
      tables: Record<string, readonly AnalysisSourceRow[]>;
    }
  | {
      type: "evaluate";
      requestId: number;
      project: AnalysisProject;
      queryId: string;
      bindings: Record<string, AnalysisScalar>;
    };

export type AnalysisWorkerResponse =
  | { type: "result"; requestId: number; evaluation: AnalysisEvaluation }
  | { type: "error"; requestId: number; message: string };

export function handleAnalysisWorkerRequest(
  request: AnalysisWorkerRequest,
  tables: Record<string, readonly AnalysisSourceRow[]>
): AnalysisWorkerResponse | undefined {
  if (request.type === "sources") {
    for (const key of Object.keys(tables)) delete tables[key];
    Object.assign(tables, request.tables);
    return undefined;
  }
  try {
    return {
      type: "result",
      requestId: request.requestId,
      evaluation: evaluateAnalysisQuery(
        request.project,
        tables,
        request.queryId,
        request.bindings
      ),
    };
  } catch (error) {
    return {
      type: "error",
      requestId: request.requestId,
      message:
        error instanceof Error
          ? error.message
          : "The query could not be evaluated.",
    };
  }
}
