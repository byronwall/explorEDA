import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { SavedDataStructure } from "exploreda";
import { SavedViewsWorkspace } from "./SavedViewsWorkspace";

const importedSettings: SavedDataStructure = {
  charts: [],
  calculations: [],
  gridSettings: {
    columnCount: 12,
    rowHeight: 100,
    containerPadding: 10,
    showBackgroundMarkers: true,
  },
  metadata: {
    name: "Orders",
    version: 1,
    createdAt: "2026-10-05T00:00:00.000Z",
    modifiedAt: "2026-10-05T00:00:00.000Z",
  },
  colorScales: [],
  rowsSettings: {
    columns: [],
    sortDirection: "asc",
    filters: [],
    globalSearch: "",
  },
};

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
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

it("labels adding the first chart to a new tab as a view change", async () => {
  render(
    <SavedViewsWorkspace
      data={[{ category: "A" }, { category: "B" }]}
      initialSettings={importedSettings}
      viewName="Orders"
    />
  );
  await screen.findByRole("button", { name: "Add chart" });

  fireEvent.click(screen.getByRole("button", { name: "New view" }));
  const addChart = screen.getByRole("button", { name: "Add chart" });
  fireEvent.click(addChart);
  const dialog = await screen.findByRole("dialog", { name: "Add a chart" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Metric Card" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Add to grid" }));

  expect(screen.getByTestId("current-history-label")).toHaveTextContent(
    /^View ·/
  );
});
