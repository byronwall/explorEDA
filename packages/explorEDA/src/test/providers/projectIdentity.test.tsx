import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ExplorEdaProject } from "@/components/ExplorEdaProject";
import type { ExplorEdaHandle } from "@/components/ExplorEda";
import { createShopFixture } from "@/test/fixtures/shopProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              target,
              contentRect: { width: 1200 } as DOMRectReadOnly,
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
afterEach(() => vi.unstubAllGlobals());

it("keeps a logical order selection through source reorder and removal", async () => {
  const { project, sources } = createShopFixture();
  const settings: SavedDataStructure = {
    charts: [
      {
        ...DEFAULT_CHART_SETTINGS,
        id: "selected-order",
        type: "metric-card",
        title: "Selected order amount",
        aggregation: "sum",
        measureField: "orders.amount",
        layout: { x: 0, y: 0, w: 12, h: 3 },
        filters: [{ type: "value", field: "__ID", values: [0] }],
      },
    ],
    calculations: [],
    colorScales: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 100,
      containerPadding: 10,
      showBackgroundMarkers: false,
    },
    metadata: {
      name: "Orders",
      version: 1,
      createdAt: "2026-10-05",
      modifiedAt: "2026-10-05",
    },
  };
  const view = {
    id: "orders",
    name: "Orders",
    queryId: "orders-by-customer",
    settings,
  };
  const ref = createRef<ExplorEdaHandle>();
  const props = { project, view, ref, onProjectChange: vi.fn() };
  const rendered = render(<ExplorEdaProject {...props} tables={sources} />);
  await waitFor(() => expect(screen.getByText("30")).toBeInTheDocument());
  const savedSettings = ref.current!.getSettings();
  const savedFilter = savedSettings.charts[0]!.filters[0]!;
  expect(savedFilter.type === "value" && savedFilter.values).toEqual([
    "orders:string:O1",
  ]);
  const savedView = { ...view, settings: savedSettings };
  const reordered = { ...sources, orders: [...sources.orders!].reverse() };
  rendered.rerender(
    <ExplorEdaProject {...props} view={savedView} tables={reordered} />
  );
  await waitFor(() => expect(screen.getByText("30")).toBeInTheDocument());
  const persistedSettings = ref.current!.getSettings();
  const filter = persistedSettings.charts[0]!.filters[0]!;
  expect(filter.type === "value" && filter.values).toEqual([
    "orders:string:O1",
  ]);
  const persistedView = { ...view, settings: persistedSettings };
  rendered.rerender(
    <ExplorEdaProject
      {...props}
      view={persistedView}
      tables={{
        ...reordered,
        orders: reordered.orders.filter((row) => row.orderId !== "O1"),
      }}
    />
  );
  await waitFor(() => expect(screen.getByText("No rows")).toBeInTheDocument());
});

it("keeps a declared field name when saved settings format the field", async () => {
  const { project, sources } = createShopFixture();
  const settings: SavedDataStructure = {
    charts: [
      {
        ...DEFAULT_CHART_SETTINGS,
        id: "average-amount",
        type: "metric-card",
        title: "Average order",
        aggregation: "average",
        measureField: "orders.amount",
        layout: { x: 0, y: 0, w: 12, h: 3 },
      },
    ],
    calculations: [],
    colorScales: [],
    fieldSettings: { "orders.amount": { precision: 1 } },
    gridSettings: {
      columnCount: 12,
      rowHeight: 100,
      containerPadding: 10,
      showBackgroundMarkers: false,
    },
    metadata: {
      name: "Orders",
      version: 1,
      createdAt: "2026-10-05",
      modifiedAt: "2026-10-05",
    },
  };
  render(
    <ExplorEdaProject
      project={project}
      tables={sources}
      view={{
        id: "orders",
        name: "Orders",
        queryId: "orders-by-customer",
        settings,
      }}
      onProjectChange={vi.fn()}
    />
  );
  await waitFor(() =>
    expect(screen.getAllByText(/Average of Amount/).length).toBeGreaterThan(0)
  );
  expect(screen.queryByText(/orders\.amount/)).not.toBeInTheDocument();
});
