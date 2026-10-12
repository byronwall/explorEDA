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

// jsdom has no ResizeObserver, which sliders and anchored popovers measure with.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
