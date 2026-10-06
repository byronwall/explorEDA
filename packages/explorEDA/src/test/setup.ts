import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { handleAnalysisWorkerRequest } from "@/lib/analysis/analysisWorkerProtocol";
import type { AnalysisWorkerRequest } from "@/lib/analysis/analysisWorkerProtocol";
import type { AnalysisSourceRow } from "@/types/AnalysisProject";

expect.extend(matchers);

// runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// jsdom has no ResizeObserver, which sliders and anchored popovers measure with.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// JSDOM has no browser Worker. This test transport still runs the real evaluator.
class TestAnalysisWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  private tables: Record<string, readonly AnalysisSourceRow[]> = {};

  postMessage(request: AnalysisWorkerRequest) {
    if (request.type === "sources") {
      this.tables = request.tables;
      return;
    }
    const response = handleAnalysisWorkerRequest(request, this.tables);
    if (response)
      queueMicrotask(() =>
        this.onmessage?.({ data: response } as MessageEvent)
      );
  }

  terminate() {}
}

globalThis.Worker ??= TestAnalysisWorker as unknown as typeof Worker;
