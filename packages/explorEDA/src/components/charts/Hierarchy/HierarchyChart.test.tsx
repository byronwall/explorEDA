import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { HierarchyChart, textOn } from "./HierarchyChart";
import { hierarchyDefinition, type HierarchySettings } from "./definition";

beforeAll(registerAllCharts);

function Live() {
  const updateChart = useDataLayer((s) => s.updateChart);
  const settings = useDataLayer((s) => s.charts[0]) as HierarchySettings;
  return (
    <>
      <HierarchyChart settings={settings} width={600} height={360} />
      <output data-testid="filters">{JSON.stringify(settings.filters)}</output>
      <output data-testid="focus">
        {JSON.stringify(settings.focus ?? null)}
      </output>
      <button
        type="button"
        onClick={() => updateChart("tree", { focus: ["West"] })}
      >
        Set missing focus
      </button>
    </>
  );
}

const data = [
  { Region: "North", Category: "Home" },
  { Region: "North", Category: "Home" },
  { Region: "North", Category: "Office" },
  { Region: "South", Category: "Home" },
];

function setup(onStateChange?: () => void) {
  const chart: HierarchySettings = {
    ...hierarchyDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }),
    id: "tree",
    levels: ["Region", "Category"],
  };
  render(
    <DataLayerProvider
      data={data}
      charts={[chart]}
      onStateChange={onStateChange}
    >
      <Live />
    </DataLayerProvider>
  );
  return () => JSON.parse(screen.getByTestId("filters").textContent!);
}

it("selects a branch by click, adds a sibling with Shift, and clears on empty space", () => {
  const filters = setup();
  const northHome = screen.getByRole("button", {
    name: "North › Home: 2 rows, 66.7% of North",
  });
  fireEvent.click(northHome);
  expect(filters()).toEqual([
    { type: "value", field: "Region", values: ["North"] },
    { type: "value", field: "Category", values: ["Home"] },
  ]);
  expect(northHome).toHaveAttribute("aria-pressed", "true");

  fireEvent.click(
    screen.getByRole("button", {
      name: "North › Office: 1 row, 33.3% of North",
    }),
    { shiftKey: true }
  );
  expect(filters()).toEqual([
    { type: "value", field: "Region", values: ["North"] },
    { type: "value", field: "Category", values: ["Home", "Office"] },
  ]);

  // A sibling under another parent is refused, and the selection stays.
  fireEvent.click(
    screen.getByRole("button", { name: "South › Home: 1 row, 100% of South" }),
    { shiftKey: true }
  );
  expect(filters()[1].values).toEqual(["Home", "Office"]);
  expect(screen.getByText(/same parent only/)).toBeInTheDocument();

  fireEvent.click(document.querySelector("svg > rect")!);
  expect(filters()).toEqual([]);
});

it("moves focus with the arrow keys and selects with Enter", () => {
  const filters = setup();
  const north = screen.getByRole("button", {
    name: "North: 3 rows, 75% of all",
  });
  expect(north).toHaveAttribute("tabindex", "0");
  north.focus();
  fireEvent.keyDown(north, { key: "ArrowRight" });
  const next = document.activeElement!;
  expect(next.getAttribute("aria-label")).toMatch(/^North › Home/);
  fireEvent.keyDown(next, { key: "Enter" });
  expect(filters()).toHaveLength(2);
});

it("picks readable text on light and dark fills", () => {
  expect(textOn("#1b4f8a")).toBe("#fff");
  expect(textOn("#f2d64b")).toBe("#1b1f24");
});

it("zooms on a double-click without changing filters, as one step", async () => {
  vi.useFakeTimers();
  const changes = vi.fn();
  const filters = setup(changes);
  await vi.runAllTimersAsync();
  changes.mockClear();
  const focus = () => JSON.parse(screen.getByTestId("focus").textContent!);
  const north = screen.getByRole("button", {
    name: "North: 3 rows, 75% of all",
  });

  fireEvent.click(north, { detail: 1 });
  expect(filters()).toEqual([
    { type: "value", field: "Region", values: ["North"] },
  ]);
  fireEvent.click(north, { detail: 2 });
  expect(focus()).toEqual(["North"]);
  expect(filters()).toEqual([]);
  await vi.runAllTimersAsync();
  expect(changes).toHaveBeenCalledTimes(1);

  // Zoomed: North's categories fill the chart, with a path back.
  const nav = screen.getByRole("navigation", { name: "Zoom path" });
  expect(nav).toHaveTextContent("All›North");
  expect(
    screen.queryByRole("button", { name: /^South/ })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "All" }));
  expect(focus()).toBe(null);
  vi.useRealTimers();
});

it("keeps a single click as a selection once the double-click window passes", async () => {
  vi.useFakeTimers();
  const changes = vi.fn();
  const filters = setup(changes);
  await vi.runAllTimersAsync();
  changes.mockClear();
  fireEvent.click(
    screen.getByRole("button", { name: "North: 3 rows, 75% of all" }),
    { detail: 1 }
  );
  expect(changes).not.toHaveBeenCalled();
  await vi.advanceTimersByTimeAsync(500);
  expect(changes).toHaveBeenCalledTimes(1);
  expect(filters()).toHaveLength(1);
  vi.useRealTimers();
});

it("zooms with Shift+Enter and shows a missing branch without losing it", () => {
  setup();
  const focus = () => JSON.parse(screen.getByTestId("focus").textContent!);
  const north = screen.getByRole("button", {
    name: "North: 3 rows, 75% of all",
  });
  fireEvent.keyDown(north, { key: "Enter", shiftKey: true });
  expect(focus()).toEqual(["North"]);

  fireEvent.click(screen.getByRole("button", { name: "Set missing focus" }));
  expect(focus()).toEqual(["West"]);
  expect(
    screen.getByRole("navigation", { name: "Zoom path" })
  ).toHaveTextContent("West · no rows");
  // The whole is drawn meanwhile.
  expect(
    screen.getByRole("button", { name: "South: 1 row, 25% of all" })
  ).toBeInTheDocument();
});

it("traces a box on Alt-click", () => {
  render(
    <DataLayerProvider
      data={data}
      charts={[
        {
          ...hierarchyDefinition.createDefaultSettings({
            x: 0,
            y: 0,
            w: 6,
            h: 4,
          }),
          id: "tree",
          levels: ["Region", "Category"],
        } as HierarchySettings,
      ]}
    >
      <ChartTraceScope>
        <Live />
        <ChartTracePanel />
      </ChartTraceScope>
    </DataLayerProvider>
  );
  fireEvent.click(
    screen.getByRole("button", {
      name: "North › Home: 2 rows, 66.7% of North",
    }),
    { altKey: true }
  );
  const body = screen.getByLabelText("Hierarchy node trace");
  expect(body).toHaveTextContent("North › Home");
  expect(body).toHaveTextContent("Last level: sum of its rows");
  expect(screen.getByTestId("filters").textContent).toBe("[]");
});

it("switches arrangement in one step, keeping levels, zoom, and filters", async () => {
  vi.useFakeTimers();
  const changes = vi.fn();
  const filters = setup(changes);
  await vi.runAllTimersAsync();
  const north = screen.getByRole("button", {
    name: "North: 3 rows, 75% of all",
  });
  fireEvent.keyDown(north, { key: "Enter", shiftKey: true });
  fireEvent.keyDown(
    screen.getByRole("button", {
      name: "North › Home: 2 rows, 66.7% of North",
    }),
    { key: "Enter" }
  );
  await vi.runAllTimersAsync();
  changes.mockClear();
  const before = filters();

  fireEvent.click(screen.getByRole("radio", { name: "Icicle" }));
  await vi.runAllTimersAsync();
  expect(changes).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole("group", { name: /as an icicle$/ })
  ).toBeInTheDocument();
  expect(filters()).toEqual(before);
  expect(screen.getByTestId("focus").textContent).toBe('["North"]');
  expect(
    screen.getByRole("button", { name: "North › Home: 2 rows, 66.7% of North" })
  ).toHaveAttribute("aria-pressed", "true");
  vi.useRealTimers();
});

it("draws a sunburst whose center steps out of the zoom", () => {
  setup();
  fireEvent.click(screen.getByRole("radio", { name: "Sunburst" }));
  expect(
    screen.getByRole("group", { name: /as a sunburst$/ })
  ).toBeInTheDocument();
  const north = screen.getByRole("button", {
    name: "North: 3 rows, 75% of all",
  });
  expect(north.tagName.toLowerCase()).toBe("path");
  expect(
    screen.queryByRole("button", { name: /^Zoom out/ })
  ).not.toBeInTheDocument();
  fireEvent.keyDown(north, { key: "Enter", shiftKey: true });
  expect(screen.getByTestId("focus").textContent).toBe('["North"]');
  fireEvent.click(screen.getByRole("button", { name: "Zoom out to All" }));
  expect(screen.getByTestId("focus").textContent).toBe("null");
});
