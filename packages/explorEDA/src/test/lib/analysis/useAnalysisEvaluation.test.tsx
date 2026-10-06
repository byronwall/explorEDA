import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { StrictMode, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type {
  AnalysisProject,
  AnalysisScalar,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { createShopFixture } from "@/lib/analysis/shopFixture";
import { handleAnalysisWorkerRequest } from "@/lib/analysis/analysisWorkerProtocol";
import type {
  AnalysisWorkerRequest,
  AnalysisWorkerResponse,
} from "@/lib/analysis/analysisWorkerProtocol";
import { useAnalysisEvaluation } from "@/lib/analysis/useAnalysisEvaluation";

class TestWorker {
  onmessage: ((event: MessageEvent<AnalysisWorkerResponse>) => void) | null =
    null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  tables: Record<string, readonly AnalysisSourceRow[]> = {};

  postMessage(request: AnalysisWorkerRequest) {
    if (request.type === "sources") {
      this.tables = request.tables;
      return;
    }
    const response = handleAnalysisWorkerRequest(request, this.tables);
    if (!response) return;
    const delay = request.bindings.customerId === "C1" ? 30 : 0;
    window.setTimeout(
      () => this.onmessage?.({ data: response } as MessageEvent),
      delay
    );
  }

  terminate() {}
}

function EvaluationHarness({
  project,
  tables,
  initialQueryId = "customer-instance",
}: {
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  initialQueryId?: string;
}) {
  const [bindings, setBindings] = useState<Record<string, AnalysisScalar>>({});
  const [queryId, setQueryId] = useState(initialQueryId);
  const result = useAnalysisEvaluation(project, tables, queryId, bindings);
  return (
    <div>
      <button onClick={() => setBindings({ customerId: "C1" })}>
        Slow binding
      </button>
      <button onClick={() => setBindings({ customerId: "C4" })}>
        Fast binding
      </button>
      <button onClick={() => setQueryId("orders-by-customer")}>
        Switch query
      </button>
      <output data-testid="result">
        {JSON.stringify({
          status: result.status,
          queryId: result.evaluation.queryId,
          binding: result.appliedBindings?.customerId,
          rows: result.evaluation.rows.map((row) => ({
            key: row.key,
            sourceRows: row.sourceRows,
          })),
          counts: result.evaluation.counts,
          stages: result.evaluation.stages.map((stage) => [
            stage.stepId,
            stage.outputCount,
          ]),
        })}
      </output>
    </div>
  );
}

describe("useAnalysisEvaluation", () => {
  it("keeps prior results atomic and ignores a late worker completion", async () => {
    vi.stubGlobal("Worker", TestWorker);
    const { project, sources } = createShopFixture();
    render(<EvaluationHarness project={project} tables={sources} />);
    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent('"status":"ready"')
    );

    fireEvent.click(screen.getByRole("button", { name: "Slow binding" }));
    fireEvent.click(screen.getByRole("button", { name: "Fast binding" }));
    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent('"binding":"C4"')
    );
    await act(
      async () => new Promise((resolve) => window.setTimeout(resolve, 40))
    );

    const result = JSON.parse(screen.getByTestId("result").textContent ?? "{}");
    expect(result.binding).toBe("C4");
    expect(result.rows).toEqual([]);
    expect(result.counts.output).toBe(0);
    expect(result.stages.at(-1)[1]).toBe(0);
  });

  it("clears rows while a new query definition is pending and ignores the old result", async () => {
    vi.stubGlobal("Worker", TestWorker);
    const { project, sources } = createShopFixture();
    render(<EvaluationHarness project={project} tables={sources} />);
    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent('"status":"ready"')
    );

    fireEvent.click(screen.getByRole("button", { name: "Slow binding" }));
    fireEvent.click(screen.getByRole("button", { name: "Switch query" }));
    const pending = JSON.parse(
      screen.getByTestId("result").textContent ?? "{}"
    );
    expect(pending.status).toBe("pending");
    expect(pending.queryId).toBe("orders-by-customer");
    expect(pending.rows).toEqual([]);
    expect(pending.stages).toEqual([]);

    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent('"status":"ready"')
    );
    await act(
      async () => new Promise((resolve) => window.setTimeout(resolve, 40))
    );
    const result = JSON.parse(screen.getByTestId("result").textContent ?? "{}");
    expect(result.queryId).toBe("orders-by-customer");
    expect(result.rows).toHaveLength(5);
  });

  it("resends source tables when StrictMode recreates the worker", async () => {
    vi.stubGlobal("Worker", TestWorker);
    const { project, sources } = createShopFixture();
    render(
      <StrictMode>
        <EvaluationHarness
          project={project}
          tables={sources}
          initialQueryId="orders-by-customer"
        />
      </StrictMode>
    );
    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent('"status":"ready"')
    );
    expect(
      JSON.parse(screen.getByTestId("result").textContent ?? "{}").rows
    ).toHaveLength(5);
  });
});
