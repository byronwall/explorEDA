import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { rowChartDefinition } from "./definition";
import { RowChart } from "./RowChart";

beforeAll(registerAllCharts);
const settings = {
  ...rowChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "category"
  ),
  id: "categories",
};
function Harness() {
  const [height, setHeight] = useState(160);
  const chart = useDataLayer((state) => state.charts[0]);
  const save = useDataLayer((state) => state.saveToStructure);
  const store = useDataLayer((state) => state.crossfilterWrapper);
  return (
    <>
      <button onClick={() => setHeight(800)}>Resize</button>
      <output aria-label="Saved settings">{stringifySavedData(save())}</output>
      <output aria-label="Matching IDs">
        {store.getFilteredRowIds().join(",")}
      </output>
      <ChartTraceScope>
        {chart?.type === "row" && (
          <RowChart settings={chart} width={600} height={height} />
        )}
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("inspects typed Other members and saves exact category selections across resize", () => {
  render(
    <DataLayerProvider
      charts={[settings]}
      data={["A", "A", "A", 1, "1", null, "Other categories"].map(
        (category) => ({ category })
      )}
    >
      <Harness />
    </DataLayerProvider>
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Other categories: 4 rows" }),
    { altKey: true }
  );
  expect(
    screen.getByRole("checkbox", { name: 'Select "1"' })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("checkbox", { name: "Select 1" }));
  expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(/^3$/);
  expect(screen.getByRole("checkbox", { name: "Select 1" })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Resize" }));
  expect(
    screen.queryByRole("button", { name: "Other categories: 4 rows" })
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(/^3$/);
  const saved = JSON.parse(
    screen.getByLabelText("Saved settings").textContent!
  );
  expect(saved.charts[0].filters).toEqual([
    { type: "value", field: "category", values: [1] },
  ]);
  expect(validateSavedData(saved)).toBe(true);
});

it("ranks a grouped summary and holds its order while other charts filter", () => {
  const ranking = {
    ...rowChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "Region"
    ),
    id: "ranking",
    aggregateId: "revenue-by-region",
  };
  const channel = {
    ...rowChartDefinition.createDefaultSettings(
      { x: 6, y: 0, w: 6, h: 4 },
      "Channel"
    ),
    id: "channel",
  };
  function Ranking() {
    const chart = useDataLayer((state) => state.charts[0]);
    const updateChart = useDataLayer((state) => state.updateChart);
    const save = useDataLayer((state) => state.saveToStructure);
    return (
      <>
        <button
          onClick={() =>
            updateChart("channel", {
              filters: [{ type: "value", field: "Channel", values: ["Web"] }],
            })
          }
        >
          Web only
        </button>
        <output aria-label="Saved settings">
          {stringifySavedData(save())}
        </output>
        {chart?.type === "row" && (
          <RowChart settings={chart} width={600} height={300} />
        )}
      </>
    );
  }
  render(
    <DataLayerProvider
      data={[
        { Region: "North", Channel: "Store", Revenue: 30 },
        { Region: "North", Channel: "Web", Revenue: 10 },
        { Region: "South", Channel: "Web", Revenue: 12 },
        { Region: "East", Channel: "Store", Revenue: 50 },
      ]}
      savedData={{
        charts: [ranking, channel],
        calculations: [],
        colorScales: [],
        aggregates: [
          {
            id: "revenue-by-region",
            name: "Revenue by region",
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
      }}
    >
      <Ranking />
    </DataLayerProvider>
  );
  const bars = () =>
    screen
      .getAllByRole("button", { name: /Revenue by region/ })
      .map((bar) => bar.getAttribute("aria-label"));
  expect(bars()).toEqual([
    "East, Revenue by region: 50",
    "North, Revenue by region: 40",
    "South, Revenue by region: 12",
  ]);
  fireEvent.click(screen.getByRole("button", { name: "Web only" }));
  expect(bars()).toEqual([
    "East, Revenue by region: 0",
    "North, Revenue by region: 10",
    "South, Revenue by region: 12",
  ]);
  const saved = JSON.parse(
    screen.getByLabelText("Saved settings").textContent!
  );
  expect(saved.charts[0].aggregateId).toBe("revenue-by-region");
  expect(validateSavedData(saved)).toBe(true);
});

it("labels an average with no filtered rows instead of drawing zero", () => {
  const ranking = {
    ...rowChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "Region"
    ),
    id: "ranking",
    aggregateId: "revenue-by-region",
  };
  const channel = {
    ...rowChartDefinition.createDefaultSettings(
      { x: 6, y: 0, w: 6, h: 4 },
      "Channel"
    ),
    id: "channel",
  };
  function Ranking() {
    const chart = useDataLayer((state) => state.charts[0]);
    const updateChart = useDataLayer((state) => state.updateChart);
    const save = useDataLayer((state) => state.saveToStructure);
    return (
      <>
        <button
          onClick={() =>
            updateChart("channel", {
              filters: [{ type: "value", field: "Channel", values: ["Web"] }],
            })
          }
        >
          Web only
        </button>
        <output aria-label="Saved settings">
          {stringifySavedData(save())}
        </output>
        {chart?.type === "row" && (
          <RowChart settings={chart} width={600} height={300} />
        )}
      </>
    );
  }
  render(
    <DataLayerProvider
      data={[
        { Region: "North", Channel: "Store", Revenue: 30 },
        { Region: "North", Channel: "Web", Revenue: 10 },
        { Region: "South", Channel: "Web", Revenue: 12 },
        { Region: "East", Channel: "Store", Revenue: 50 },
      ]}
      savedData={{
        charts: [ranking, channel],
        calculations: [],
        colorScales: [],
        aggregates: [
          {
            id: "revenue-by-region",
            name: "Average revenue",
            groupField: "Region",
            measureField: "Revenue",
            aggregation: "average",
          },
        ],
        gridSettings: {
          columnCount: 12,
          rowHeight: 76,
          containerPadding: 0,
          showBackgroundMarkers: false,
        },
        metadata: { name: "test", version: 1, createdAt: "", modifiedAt: "" },
      }}
    >
      <Ranking />
    </DataLayerProvider>
  );
  const bars = () =>
    screen
      .getAllByRole("button", { name: /Average revenue/ })
      .map((bar) => bar.getAttribute("aria-label"));
  fireEvent.click(screen.getByRole("button", { name: "Web only" }));
  expect(bars()).toEqual([
    "East, Average revenue: No rows",
    "North, Average revenue: 10",
    "South, Average revenue: 12",
  ]);
});

it("keeps Top N membership fixed across a resize", () => {
  function Sized() {
    const [height, setHeight] = useState(160);
    const chart = useDataLayer((state) => state.charts[0]);
    return (
      <>
        <button onClick={() => setHeight(800)}>Resize</button>
        {chart?.type === "row" && (
          <RowChart settings={chart} width={600} height={height} />
        )}
      </>
    );
  }
  const otherOf = () =>
    screen.getByRole("button", { name: /^Other categories: \d+ rows$/ });
  render(
    <DataLayerProvider
      charts={[{ ...settings, topN: 2 }]}
      data={["A", "A", "A", "B", "B", "C", "D", "E"].map((category) => ({
        category,
      }))}
    >
      <Sized />
    </DataLayerProvider>
  );
  expect(otherOf()).toHaveAccessibleName("Other categories: 3 rows");
  fireEvent.click(screen.getByRole("button", { name: "Resize" }));
  expect(otherOf()).toHaveAccessibleName("Other categories: 3 rows");
  expect(
    screen
      .getAllByRole("button", { name: /rows$/ })
      .map((bar) => bar.getAttribute("aria-label"))
  ).toEqual(["A: 3 rows", "B: 2 rows", "Other categories: 3 rows"]);
});

it("traces a ranked value to its included and excluded rows", () => {
  const ranking = {
    ...rowChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "Region"
    ),
    id: "ranking",
    aggregateId: "revenue-by-region",
    topN: 1,
  };
  function Traced() {
    const chart = useDataLayer((state) => state.charts[0]);
    return (
      <ChartTraceScope>
        {chart?.type === "row" && (
          <RowChart settings={chart} width={600} height={300} />
        )}
        <ChartTracePanel />
      </ChartTraceScope>
    );
  }
  render(
    <DataLayerProvider
      data={[
        { Region: "North", Revenue: 30 },
        { Region: "North", Revenue: "n/a" },
        { Region: "South", Revenue: 4 },
        { Region: "East", Revenue: 8 },
      ]}
      savedData={{
        charts: [ranking],
        calculations: [],
        colorScales: [],
        aggregates: [
          {
            id: "revenue-by-region",
            name: "Average revenue",
            groupField: "Region",
            measureField: "Revenue",
            aggregation: "average",
          },
        ],
        gridSettings: {
          columnCount: 12,
          rowHeight: 76,
          containerPadding: 0,
          showBackgroundMarkers: false,
        },
        metadata: { name: "test", version: 1, createdAt: "", modifiedAt: "" },
      }}
    >
      <Traced />
    </DataLayerProvider>
  );
  fireEvent.click(
    screen.getByRole("button", { name: "North, Average revenue: 30" }),
    { altKey: true }
  );
  expect(screen.getByText("Average of Revenue")).toBeInTheDocument();
  expect(screen.getByText("Not a finite number")).toBeInTheDocument();
  // South and East pool into one average: (4 + 8) / 2.
  fireEvent.click(
    screen.getByRole("button", {
      name: "Other categories, Average revenue: 6",
    }),
    { altKey: true }
  );
  // Each member lists its own value, and the source rows are pooled.
  const member = (name: string) =>
    screen.getByRole("checkbox", { name: `Select ${name}` }).closest("div")!
      .textContent;
  expect(member("South")).toBe("South4Inspect");
  expect(member("East")).toBe("East8Inspect");
  expect(screen.getByText("Value").nextSibling?.textContent).toBe("6");
});
