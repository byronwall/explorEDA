import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup, configure } from "@testing-library/react";
import { testTiming } from "@repo/test-config";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

configure({ asyncUtilTimeout: testTiming.waitMs });

// runs a cleanup after each test case
afterEach(() => {
  cleanup();
});

// In Vitest's VM pool, jsdom's performance has no User Timing API (marks and
// measures), which ScatterMatrix uses. Node's performance has it.
if (typeof performance.getEntriesByName !== "function") {
  const { performance: node } = await import("node:perf_hooks");
  for (const name of [
    "mark",
    "measure",
    "getEntriesByName",
    "getEntriesByType",
    "clearMarks",
    "clearMeasures",
  ] as const) {
    Object.defineProperty(performance, name, {
      configurable: true,
      value: node[name].bind(node),
    });
  }
}

// jsdom has no ResizeObserver, which sliders and anchored popovers measure with.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
