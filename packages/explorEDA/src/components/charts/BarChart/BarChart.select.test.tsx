import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { applyFilter } from "@/hooks/applyFilter";
import type { Filter } from "@/types/FilterTypes";
import { BarChart } from "./BarChart";
import { barChartDefinition, type BarChartSettings } from "./definition";

beforeAll(registerAllCharts);

const chart: BarChartSettings = {
  ...barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "Revenue"
  ),
  id: "revenue",
  aggregateId: "revenue-by-region",
};

const savedData: SavedDataStructure = {
  charts: [chart],
  calculations: [],
  colorScales: [],
  aggregates: [
    {
      id: "revenue-by-region",
      name: "Sum of Revenue by Region",
      groupField: "Region",
      measureField: "Revenue",
      aggregation: "sum",
    },
  ],
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: { name: "test", version: 1, createdAt: "", modifiedAt: "" },
};

function LiveBar() {
  const settings = useDataLayer((s) => s.charts[0]) as BarChartSettings;
  return <BarChart settings={settings} width={400} height={240} />;
}

function Filters() {
  const filters = useDataLayer((s) => s.charts[0]!.filters);
  return <output data-testid="filters">{JSON.stringify(filters)}</output>;
}

it("selects a grouped bar's group on click and keeps Alt-click for inspection", () => {
  render(
    <DataLayerProvider
      data={[
        { Region: "West", Revenue: 10 },
        { Region: "West", Revenue: 5 },
        { Region: "East", Revenue: 7 },
      ]}
      savedData={savedData}
    >
      <LiveBar />
      <Filters />
    </DataLayerProvider>
  );

  const west = screen.getByRole("button", { name: "West: 15" });
  fireEvent.click(west);
  expect(screen.getByTestId("filters").textContent).toBe(
    JSON.stringify([{ type: "value", field: "Region", values: ["West"] }])
  );
  expect(screen.getByRole("button", { name: "West: 15" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  fireEvent.click(screen.getByRole("button", { name: "East: 7" }), {
    altKey: true,
  });
  expect(screen.getByTestId("filters").textContent).toContain('["West"]');

  fireEvent.keyDown(screen.getByRole("button", { name: "West: 15" }), {
    key: "Enter",
  });
  expect(screen.getByTestId("filters").textContent).toBe("[]");
});

it("clears the chart's filters on a click in empty plot space, but not after a drag", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  const { container } = render(
    <DataLayerProvider
      data={[
        { Region: "West", Revenue: 10 },
        { Region: "East", Revenue: 7 },
      ]}
      savedData={savedData}
    >
      <LiveBar />
      <Filters />
    </DataLayerProvider>
  );
  const svg = container.querySelector<SVGSVGElement>("svg[role='group']")!;
  const press = (from: number, to: number) => {
    fireEvent.pointerDown(svg, { button: 0, clientX: from, clientY: 60 });
    fireEvent.pointerUp(svg, { button: 0, clientX: to, clientY: 60 });
    fireEvent.click(svg, { button: 0, clientX: to, clientY: 60 });
  };

  fireEvent.click(screen.getByRole("button", { name: "West: 10" }));
  expect(screen.getByTestId("filters").textContent).toContain('["West"]');

  press(200, 240);
  expect(screen.getByTestId("filters").textContent).toContain('["West"]');

  press(200, 200);
  expect(screen.getByTestId("filters").textContent).toBe("[]");
});

it("selects exactly a histogram bar's rows when values sit on its upper edge", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  // Two bins, [0, 0.5) and [0.5, 1]; two rows sit on the shared edge.
  const data = [0, 0.25, 0.5, 0.5, 1].map((Score) => ({ Score }));
  const histogram: BarChartSettings = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "Score"
    ),
    id: "score",
    binCount: 2,
  };
  const { container } = render(
    <DataLayerProvider
      data={data}
      savedData={{ ...savedData, charts: [histogram], aggregates: [] }}
    >
      <LiveBar />
      <Filters />
    </DataLayerProvider>
  );
  const svg = container.querySelector<SVGSVGElement>("svg[role='group']")!;
  const plot = svg.querySelector<SVGGElement>("g[transform]")!;
  const [left, top] = plot
    .getAttribute("transform")!
    .match(/-?[\d.]+/g)!
    .map(Number);
  const clickBar = (name: string) => {
    const bar = screen.getByRole("button", { name });
    const clientX =
      left! +
      Number(bar.getAttribute("x")) +
      Number(bar.getAttribute("width")) / 2;
    const clientY =
      top! +
      Number(bar.getAttribute("y")) +
      Number(bar.getAttribute("height")) / 2;
    fireEvent.pointerDown(svg, { button: 0, clientX, clientY });
    fireEvent.pointerUp(svg, { button: 0, clientX, clientY });
    fireEvent.click(svg, { button: 0, clientX, clientY });
  };
  const selectedRows = () => {
    const filters = JSON.parse(
      screen.getByTestId("filters").textContent!
    ) as Filter[];
    return data.filter((row) =>
      filters.every((filter) => applyFilter(row.Score, filter))
    ).length;
  };

  clickBar("0 to 0.5: 2 records");
  expect(selectedRows()).toBe(2);
  expect(container.textContent).toContain("2 of 5 rows selected: 0 to < 0.5");

  clickBar("0.5 to 1: 3 records");
  expect(selectedRows()).toBe(3);
});
