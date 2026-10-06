import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ExplorEdaProject } from "@/components/ExplorEdaProject";
import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { createShopFixture } from "@/lib/analysis/shopFixture";
import type { AnalysisView } from "@/types/AnalysisProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";

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

it("keeps a real grouped-bar trace in query flow after the host update and trace popover closes", async () => {
  const { project, sources } = createShopFixture();
  const settings: SavedDataStructure = {
    charts: [
      {
        ...barChartDefinition.createDefaultSettings(
          { x: 0, y: 0, w: 12, h: 5 },
          "product.name"
        ),
        id: "revenue-by-product",
        title: "Revenue by product",
        aggregateId: "product-revenue",
      },
    ],
    calculations: [],
    aggregates: [
      {
        id: "product-revenue",
        name: "Revenue",
        groupField: "product.name",
        measureField: "revenueByProduct",
        aggregation: "sum",
      },
    ],
    colorScales: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 100,
      containerPadding: 10,
      showBackgroundMarkers: false,
    },
    metadata: {
      name: "Revenue by product",
      version: 1,
      createdAt: "2026-10-06",
      modifiedAt: "2026-10-06",
    },
  };
  const initialView: AnalysisView = {
    id: "product-revenue-view",
    name: "Revenue by product",
    queryId: "product-revenue",
    settings,
  };

  function ControlledWorkspace() {
    const [view, setView] = useState(initialView);
    const [hostUpdates, setHostUpdates] = useState(0);
    return (
      <>
        <output aria-label="Host updates">{hostUpdates}</output>
        <ExplorEdaProject
          project={project}
          tables={sources}
          view={view}
          onProjectChange={({ view: nextView }) => {
            setView(nextView);
            setHostUpdates((count) => count + 1);
          }}
        />
      </>
    );
  }

  render(<ControlledWorkspace />);
  const notebook = await screen.findByRole("button", {
    name: /Notebook.*50/,
  });
  fireEvent.click(notebook, { altKey: true });
  fireEvent.click(
    await screen.findByRole("button", { name: /Open query flow/ })
  );

  await waitFor(() =>
    expect(screen.getByLabelText("Host updates")).toHaveTextContent("1")
  );
  const operations = await screen.findByLabelText("Chart operations");
  expect(operations).toHaveTextContent("Grouped bar · Notebook");
  expect(operations).toHaveTextContent("Query result rows represented");
  expect(
    within(operations.parentElement!).getByLabelText("Bar trace")
  ).toHaveTextContent("Exact result");
  expect(
    within(operations.parentElement!).getByLabelText("Bar trace")
  ).toHaveTextContent("50");

  fireEvent.click(screen.getByRole("button", { name: "Trace chart objects" }));
  expect(
    screen.queryByRole("button", { name: /Open query flow/ })
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("Chart operations")).toHaveTextContent(
    "Grouped bar · Notebook"
  );
  expect(screen.getByLabelText("Chart operations")).toHaveTextContent("50");
});
