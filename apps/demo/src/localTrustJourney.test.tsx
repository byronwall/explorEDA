import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SavedViewsWorkspace } from "./SavedViewsWorkspace";
import { getSavedViewsRows, readSavedViewsSession } from "./savedViewsSession";
import { trustRows, trustSettings } from "./localTrustFixture";

// The undo, redo, and reload half of the "local trust" journey from
// docs/intent/current-analysis-trust. The library half, which compares the
// bar, cards, table, CSV, and traces, is
// packages/explorEDA/src/test/providers/localTrustJourney.test.tsx.

beforeEach(() => {
  localStorage.clear();
  // jsdom has no layout; report a desktop-width grid so its charts draw.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              target,
              contentRect: { width: 1200, height: 800 },
            } as ResizeObserverEntry,
          ],
          this as unknown as ResizeObserver
        );
      }
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const sum = () => screen.getByLabelText("Sum of revenue");
const average = () => screen.getByLabelText("Average of revenue");
const tools = () => screen.getByRole("button", { name: "Tools: 12" });
const savedBarFilters = () =>
  readSavedViewsSession()?.tabs[0]?.settings?.charts.find(
    (chart) => chart.id === "bar"
  )?.filters;

function expectAllRows() {
  expect(within(sum()).getByText("24")).toBeInTheDocument();
  expect(tools()).not.toHaveAttribute("aria-pressed", "true");
}

function expectTools() {
  expect(within(sum()).getByText("12")).toBeInTheDocument();
  expect(sum()).toHaveTextContent("3 of 5 rows");
  expect(within(average()).getByText("6")).toBeInTheDocument();
  expect(tools()).toHaveAttribute("aria-pressed", "true");
}

it("undoes, redoes, and reloads one category selection to the same rows and values", async () => {
  const first = render(
    <SavedViewsWorkspace
      data={trustRows}
      initialSettings={trustSettings}
      viewName="Local trust"
    />
  );
  await screen.findByRole("button", { name: "Tools: 12" });
  expectAllRows();

  fireEvent.click(tools());
  expectTools();
  expect(screen.getByTestId("current-history-label")).toHaveTextContent(
    /^Filter ·/
  );

  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  await waitFor(expectAllRows);
  fireEvent.click(screen.getByRole("button", { name: "Redo" }));
  await waitFor(expectTools);
  await waitFor(() =>
    expect(savedBarFilters()).toEqual([
      { type: "value", field: "category", values: ["Tools"] },
    ])
  );

  // Reopen from what the demo saved locally.
  const saved = readSavedViewsSession()!;
  expect(getSavedViewsRows(saved)).toEqual(trustRows);
  first.unmount();
  render(
    <SavedViewsWorkspace data={[]} initialSession={saved} viewName="Reopened" />
  );
  await screen.findByRole("button", { name: "Tools: 12" });
  expectTools();
});
