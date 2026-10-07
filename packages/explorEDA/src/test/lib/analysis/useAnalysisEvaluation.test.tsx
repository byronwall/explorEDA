import { act, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { handleAnalysisWorkerRequest } from "@/lib/analysis/analysisWorkerProtocol";
import type {
  AnalysisWorkerRequest,
  AnalysisWorkerResponse,
} from "@/lib/analysis/analysisWorkerProtocol";
import {
  useAnalysisEvaluation,
  type AnalysisWorker,
} from "@/lib/analysis/useAnalysisEvaluation";
import type {
  AnalysisScalar,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { createShopFixture } from "@/test/fixtures/shopProject";

/** Runs the real evaluator, but answers C1 later than anything else. */
class SlowForC1Worker implements AnalysisWorker {
  onmessage: ((event: MessageEvent<AnalysisWorkerResponse>) => void) | null =
    null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  private tables: Record<string, readonly AnalysisSourceRow[]> = {};
  postMessage(request: AnalysisWorkerRequest) {
    const response = handleAnalysisWorkerRequest(request, this.tables);
    if (request.type === "sources") this.tables = request.tables;
    if (!response || request.type !== "evaluate") return;
    const delay = request.bindings.customerId === "C1" ? 40 : 0;
    setTimeout(
      () => this.onmessage?.({ data: response } as MessageEvent),
      delay
    );
  }
  terminate() {}
}

const { project, sources } = createShopFixture();
const range = { dateStart: "2025-01-01", dateEnd: "2025-12-31" };

let setBindings: (value: Record<string, AnalysisScalar>) => void = () => {};
function Harness({ createWorker }: { createWorker?: () => AnalysisWorker }) {
  const [bindings, set] = useState<Record<string, AnalysisScalar>>({
    customerId: "C2",
    ...range,
  });
  setBindings = set;
  const result = useAnalysisEvaluation(
    project,
    sources,
    "customer-instance",
    bindings,
    createWorker
  );
  return (
    <output data-testid="result">
      {result.status} {String(result.appliedBindings?.customerId)}{" "}
      {result.evaluation.rows.length}
    </output>
  );
}

describe("useAnalysisEvaluation", () => {
  it("evaluates on the main thread without a worker", () => {
    render(<Harness />);
    expect(screen.getByTestId("result")).toHaveTextContent("ready C2 1");
  });

  it("drops a slow worker result once a newer request has finished", async () => {
    render(<Harness createWorker={() => new SlowForC1Worker()} />);
    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent("ready C2 1")
    );
    act(() => setBindings({ customerId: "C1", ...range }));
    // Pending keeps the last finished result and its inputs together.
    expect(screen.getByTestId("result")).toHaveTextContent("pending C2 1");
    act(() => setBindings({ customerId: "C4", ...range }));
    await waitFor(() =>
      expect(screen.getByTestId("result")).toHaveTextContent("ready C4 0")
    );
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(screen.getByTestId("result")).toHaveTextContent("ready C4 0");
  });
});
