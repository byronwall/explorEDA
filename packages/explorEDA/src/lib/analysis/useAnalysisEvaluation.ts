import { useEffect, useMemo, useRef, useState } from "react";
import type {
  AnalysisEvaluation,
  AnalysisProject,
  AnalysisScalar,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { evaluateAnalysisQuery } from "./evaluateProject";
import type {
  AnalysisWorkerRequest,
  AnalysisWorkerResponse,
} from "./analysisWorkerProtocol";

export interface AnalysisEvaluationState {
  status: "pending" | "ready" | "error";
  /** The rows on screen. While pending, the last result that finished. */
  evaluation: AnalysisEvaluation;
  /** The parameter values `evaluation` was computed with. */
  appliedBindings?: Record<string, AnalysisScalar>;
  error?: string;
}

/** The part of `Worker` the evaluation uses, so tests can supply their own. */
export type AnalysisWorker = Pick<Worker, "postMessage" | "terminate"> & {
  onmessage: ((event: MessageEvent<AnalysisWorkerResponse>) => void) | null;
  onerror: ((event: ErrorEvent) => void) | null;
};

type Tables = Record<string, readonly AnalysisSourceRow[]>;

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

const message = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

/**
 * Evaluates a query on the main thread, or in a worker when `createWorker` is
 * given. With a worker, the last finished result stays on screen while the
 * next runs, and a result that finishes after a newer request is dropped, so
 * rows, counts, and inputs on screen always come from one evaluation.
 */
export function useAnalysisEvaluation(
  project: AnalysisProject,
  tables: Tables,
  queryId: string,
  bindings: Record<string, AnalysisScalar>,
  createWorker?: () => AnalysisWorker
): AnalysisEvaluationState {
  const direct = useMemo((): AnalysisEvaluationState | undefined => {
    if (createWorker) return undefined;
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
        error: message(error, "The query could not run."),
      };
    }
  }, [createWorker, project, tables, queryId, bindings]);

  const viaWorker = useWorkerEvaluation(
    createWorker,
    project,
    tables,
    queryId,
    bindings
  );
  return direct ?? viaWorker;
}

function useWorkerEvaluation(
  createWorker: (() => AnalysisWorker) | undefined,
  project: AnalysisProject,
  tables: Tables,
  queryId: string,
  bindings: Record<string, AnalysisScalar>
): AnalysisEvaluationState {
  // Only whether a worker is wanted matters; an inline factory must not
  // restart evaluation on every render.
  const enabled = Boolean(createWorker);
  const factory = useRef(createWorker);
  factory.current = createWorker;
  const workerRef = useRef<AnalysisWorker | undefined>(undefined);
  const sentTables = useRef<Tables | undefined>(undefined);
  const latest = useRef(0);
  const [finished, setFinished] = useState<{
    id: number;
    queryId: string;
    state: AnalysisEvaluationState;
  }>();
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    if (!enabled || !factory.current) return;
    const id = ++latest.current;
    setRequestId(id);
    const settle = (state: AnalysisEvaluationState) => {
      // A newer request has started; its result is the one to show.
      if (id === latest.current) setFinished({ id, queryId, state });
    };
    let worker = workerRef.current;
    try {
      if (!worker) {
        worker = factory.current();
        workerRef.current = worker;
        sentTables.current = undefined;
      }
      worker.onmessage = ({ data }) => {
        if (data.requestId !== id) return;
        settle(
          data.type === "result"
            ? {
                status: "ready",
                evaluation: data.evaluation,
                appliedBindings: bindings,
              }
            : {
                status: "error",
                evaluation: emptyEvaluation(queryId),
                error: data.message,
              }
        );
      };
      worker.onerror = (event) =>
        settle({
          status: "error",
          evaluation: emptyEvaluation(queryId),
          error: event.message || "The query worker stopped.",
        });
      // Tables go over once; each query then sends only definitions.
      if (sentTables.current !== tables) {
        worker.postMessage({
          type: "sources",
          tables,
        } satisfies AnalysisWorkerRequest);
        sentTables.current = tables;
      }
      worker.postMessage({
        type: "evaluate",
        requestId: id,
        project,
        queryId,
        bindings,
      } satisfies AnalysisWorkerRequest);
    } catch (error) {
      settle({
        status: "error",
        evaluation: emptyEvaluation(queryId),
        error: message(error, "The query worker could not start."),
      });
    }
  }, [enabled, project, tables, queryId, bindings]);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = undefined;
    },
    []
  );

  if (finished?.id === requestId) return finished.state;
  // While a request runs, keep showing the last result for the same query.
  const previous =
    finished &&
    finished.queryId === queryId &&
    finished.state.status !== "error"
      ? finished.state
      : undefined;
  return {
    status: "pending",
    evaluation: previous?.evaluation ?? emptyEvaluation(queryId),
    appliedBindings: previous?.appliedBindings,
  };
}
