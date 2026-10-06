import { shopQueryPresets, shopProjectViews } from "./demos/multiSourceShop";
import {
  PROJECT_STORAGE_KEY,
  readSavedViewsSessionResult,
} from "./savedViewsSession";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  createShopFixture,
  evaluateAnalysisQuery,
  type SavedDataStructure,
} from "exploreda";
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

it("labels the first Rows search in an imported new tab as a filter", async () => {
  render(
    <SavedViewsWorkspace
      data={[{ category: "A" }, { category: "B" }]}
      initialSettings={importedSettings}
      viewName="Orders"
    />
  );
  await screen.findByRole("button", { name: "Rows" });

  fireEvent.click(screen.getByRole("button", { name: "New view" }));
  fireEvent.click(screen.getByRole("button", { name: "Rows" }));
  const rows = screen.getByRole("region", { name: "Rows" });
  fireEvent.click(within(rows).getByRole("button", { name: "Search rows" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Search table" }), {
    target: { value: "A" },
  });

  expect(screen.getByTestId("current-history-label")).toHaveTextContent(
    /^Filter ·/
  );
});

it("keeps order and item bindings through duplicate, undo, and local reload", async () => {
  const fixture = createShopFixture();
  const { unmount } = render(
    <SavedViewsWorkspace
      data={[]}
      viewName="Orders"
      initialSettings={shopQueryPresets["orders-by-customer"]}
      initialViews={shopProjectViews.filter(view => view.queryId === "items-by-order")}
      initialProject={fixture.project}
      sourceTables={fixture.sources}
      queryPresets={shopQueryPresets}
    />
  );
  await screen.findByRole("button", { name: "Add chart" });
  fireEvent.click(screen.getByRole("tab", { name: "Items" }));
  const stored = readSavedViewsSessionResult(PROJECT_STORAGE_KEY).session!;
  expect(
    stored.tabs.find((tab) => tab.id === stored.activeTabId)?.queryId
  ).toBe("items-by-order");
  fireEvent.keyDown(screen.getByRole("button", { name: "Options for Items" }), {
    key: "Enter",
  });
  fireEvent.click(
    await screen.findByRole("menuitem", { name: "Duplicate view" })
  );
  const copied = readSavedViewsSessionResult(PROJECT_STORAGE_KEY).session!;
  expect(copied.tabs).toHaveLength(3);
  expect(
    copied.tabs.find((tab) => tab.id === copied.activeTabId)?.queryId
  ).toBe("items-by-order");
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  const undone = readSavedViewsSessionResult(PROJECT_STORAGE_KEY).session!;
  expect(undone.tabs).toHaveLength(2);
  expect(undone.history[undone.path[undone.cursor]!]!.project?.id).toBe(
    fixture.project.id
  );
  unmount();
  render(
    <SavedViewsWorkspace
      data={[]}
      viewName="Reloaded"
      initialSession={undone}
      queryPresets={shopQueryPresets}
    />
  );
  await screen.findByRole("button", { name: "Add chart" });
  const restored = readSavedViewsSessionResult(PROJECT_STORAGE_KEY).session!;
  const order = evaluateAnalysisQuery(
    restored.project!,
    restored.tables!,
    "orders-by-customer"
  );
  const item = evaluateAnalysisQuery(
    restored.project!,
    restored.tables!,
    "items-by-order"
  );
  expect(
    order.rows.reduce(
      (sum, row) => sum + Number(row.values["orders.amount"]),
      0
    )
  ).toBe(150);
  expect(
    item.rows.reduce((sum, row) => sum + Number(row.values["items.revenue"]), 0)
  ).toBe(140);
});
