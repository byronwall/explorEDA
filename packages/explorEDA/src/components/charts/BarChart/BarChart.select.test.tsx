import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
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
