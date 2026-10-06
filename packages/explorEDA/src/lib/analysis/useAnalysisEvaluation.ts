import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AnalysisEvaluation,
  AnalysisProject,
  AnalysisScalar,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { createAnalysisWorker } from "./createAnalysisWorker";
import type {
  AnalysisWorkerRequest,
  AnalysisWorkerResponse,
} from "./analysisWorkerProtocol";

export interface AnalysisEvaluationState {
  status: "pending" | "ready" | "error";
  evaluation: AnalysisEvaluation;
  appliedBindings?: Record<string, AnalysisScalar>;
  error?: string;
}

type WorkerLike = Pick<Worker, "postMessage" | "terminate"> & {
  onmessage: ((event: MessageEvent<AnalysisWorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
};

interface EvaluationRequest {
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  queryId: string;
  bindings: Record<string, AnalysisScalar>;
}

interface AppliedResult {
  request: EvaluationRequest;
  result: AnalysisEvaluationState;
}

export function useAnalysisEvaluation(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  queryId: string,
  bindings: Record<string, AnalysisScalar>
): AnalysisEvaluationState {
  const request = useMemo(
    () => ({ project, tables, queryId, bindings }),
    [project, tables, queryId, bindings]
  );
  const latestRequest = useRef(request);
  latestRequest.current = request;
  const workerRef = useRef<WorkerLike | undefined>(undefined);
  const sequence = useRef(0);
  const sentTables = useRef<
    Record<string, readonly AnalysisSourceRow[]> | undefined
  >(undefined);
  const [applied, setApplied] = useState<AppliedResult>();
  const previousResult =
    applied?.request.project === project &&
    applied.request.tables === tables &&
    applied.request.queryId === queryId
      ? applied.result
      : undefined;

  useEffect(() => {
    const requestId = ++sequence.current;
    let worker = workerRef.current;
    if (!worker) {
      try {
        worker = createAnalysisWorker();
        workerRef.current = worker;
      } catch (error) {
        setApplied({
          request,
          result: {
            status: "error",
            evaluation: emptyEvaluation(queryId),
            error:
              error instanceof Error
                ? error.message
                : "The query worker could not start.",
          },
        });
        return;
      }
    }
    const activeWorker = worker;
    const handleResponse = (event: MessageEvent<AnalysisWorkerResponse>) => {
      if (sequence.current !== requestId || latestRequest.current !== request)
        return;
      const response = event.data;
      if (response.requestId !== requestId) return;
      setApplied({
        request,
        result:
          response.type === "result"
            ? {
                status: "ready",
                evaluation: response.evaluation,
                appliedBindings: { ...bindings },
              }
            : {
                status: "error",
                evaluation:
                  previousResult?.evaluation ?? emptyEvaluation(queryId),
                appliedBindings: previousResult?.appliedBindings,
                error: response.message,
              },
      });
    };
    activeWorker.onmessage = handleResponse;
    activeWorker.onerror = (event) => {
      if (sequence.current !== requestId || latestRequest.current !== request)
        return;
      setApplied({
        request,
        result: {
          status: "error",
          evaluation: previousResult?.evaluation ?? emptyEvaluation(queryId),
          appliedBindings: previousResult?.appliedBindings,
          error: event.message || "The query worker failed.",
        },
      });
    };
    try {
      if (sentTables.current !== tables) {
        activeWorker.postMessage({
          type: "sources",
          tables,
        } satisfies AnalysisWorkerRequest);
        sentTables.current = tables;
      }
      activeWorker.postMessage({
        type: "evaluate",
        requestId,
        project,
        queryId,
        bindings,
      } satisfies AnalysisWorkerRequest);
    } catch (error) {
      setApplied({
        request,
        result: {
          status: "error",
          evaluation: previousResult?.evaluation ?? emptyEvaluation(queryId),
          appliedBindings: previousResult?.appliedBindings,
          error:
            error instanceof Error
              ? error.message
              : "The query could not be sent to the worker.",
        },
      });
    }
    return () => {
      if (sequence.current === requestId) sequence.current += 1;
    };
  }, [request, project, tables, queryId, bindings]);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = undefined;
      sentTables.current = undefined;
    },
    []
  );

  if (applied?.request === request) return applied.result;
  return {
    status: "pending",
    evaluation: previousResult?.evaluation ?? emptyEvaluation(queryId),
    appliedBindings: previousResult?.appliedBindings,
  };
}

function emptyEvaluation(queryId: string): AnalysisEvaluation {
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
