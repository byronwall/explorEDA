import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { rowChartDefinition } from "./definition";
import type { RowChartSettings } from "@/types/ChartTypes";
import { RowChart } from "./RowChart";

beforeAll(registerAllCharts);
const settings = {
  ...rowChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "category"
  ),
  id: "categories",
  // Tall rows leave room for three, so the rest gather in Other.
  minRowHeight: 30,
  maxRowHeight: 50,
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
      charts={[{ ...settings, topN: 1 }]}
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
  expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(/^3$/);
  const saved = JSON.parse(
    screen.getByLabelText("Saved settings").textContent!
  );
  expect(saved.charts[0].filters).toEqual([
    { type: "value", field: "category", values: [1] },
  ]);
  expect(validateSavedData(saved)).toBe(true);
});

it("ranks a grouped summary by its filtered value while other charts filter", () => {
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
  const axis = () =>
    document.querySelector('[data-axis-edit="x"]')!.getAttribute("data-domain");
  const before = axis();
  fireEvent.click(screen.getByRole("button", { name: "Web only" }));
  // East has no web orders, so it leaves the chart. Its length still sets the
  // axis, so the others keep theirs.
  expect(axis()).toBe(before);
  expect(bars()).toEqual([
    "South, Revenue by region: 12",
    "North, Revenue by region: 10",
  ]);
  const saved = JSON.parse(
    screen.getByLabelText("Saved settings").textContent!
  );
  expect(saved.charts[0].aggregateId).toBe("revenue-by-region");
  expect(validateSavedData(saved)).toBe(true);
});

it("holds the order and labels an average with no rows when asked", () => {
  const ranking = {
    ...rowChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "Region"
    ),
    id: "ranking",
    aggregateId: "revenue-by-region",
    keepOrder: true,
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

it("shows every category without Top N, and folds a Top N tail into +N more", () => {
  const data = Array.from({ length: 12 }, (_, index) => ({
    category: `C${index}`,
  }));
  const { rerender } = render(
    <DataLayerProvider charts={[settings]} data={data}>
      <RowChart settings={settings} width={600} height={300} />
    </DataLayerProvider>
  );
  expect(
    screen.queryByRole("button", { name: /^Other categories/ })
  ).not.toBeInTheDocument();
  rerender(
    <DataLayerProvider charts={[{ ...settings, topN: 5 }]} data={data}>
      <RowChart settings={{ ...settings, topN: 5 }} width={600} height={300} />
    </DataLayerProvider>
  );
  expect(screen.getByText("+7 more")).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Show all 12 categories" })
  ).toBeInTheDocument();
});

describe("a row chart that follows other filters", () => {
  // All rows: A 30, B 3, C 2. Under "few", A has 1 and B and C keep theirs.
  const rows = [
    ...Array.from({ length: 30 }, (_, index) => ({
      Name: "A",
      Set: index ? "most" : "few",
    })),
    ...["B", "B", "B", "C", "C"].map((Name) => ({ Name, Set: "few" })),
  ];
  function setup(extra: Partial<RowChartSettings>) {
    const chart = (id: string, field: string) => ({
      ...rowChartDefinition.createDefaultSettings(
        { x: 0, y: 0, w: 6, h: 4 },
        field
      ),
      id,
    });
    function Workspace() {
      const settings = useDataLayer((state) => state.charts[0]);
      const update = useDataLayer((state) => state.updateChart);
      return (
        <>
          <button
            onClick={() =>
              update("sets", {
                filters: [{ type: "value", field: "Set", values: ["few"] }],
              })
            }
          >
            Few only
          </button>
          {settings?.type === "row" && (
            <RowChart settings={settings} width={600} height={300} />
          )}
        </>
      );
    }
    render(
      <DataLayerProvider
        data={rows}
        savedData={{
          charts: [
            { ...chart("names", "Name"), ...extra },
            chart("sets", "Set"),
          ],
          calculations: [],
          colorScales: [],
          gridSettings: {
            columnCount: 12,
            rowHeight: 76,
            containerPadding: 0,
            showBackgroundMarkers: false,
          },
          metadata: { name: "test", version: 1, createdAt: "", modifiedAt: "" },
        }}
      >
        <Workspace />
      </DataLayerProvider>
    );
    return {
      bar: (name: string) =>
        screen.getByRole("button", { name: new RegExp(`^${name}: `) }),
      names: () =>
        screen
          .getAllByRole("button", { name: / rows$/ })
          .map((item) => item.getAttribute("aria-label")),
      axis: () =>
        document
          .querySelector('[data-axis-edit="x"]')!
          .getAttribute("data-domain"),
      filter: () =>
        fireEvent.click(screen.getByRole("button", { name: "Few only" })),
    };
  }

  it("keeps its rows and axis through clicks on a cleared selection", () => {
    const view = setup({
      topN: 1,
      filters: [{ type: "value", field: "Name", values: ["A"] }],
    });
    const axis = view.axis();
    view.filter();
    // The selected A holds the one named row, so Other's context passes 30.
    expect(view.names()).toEqual(["A: 1 rows", "Other categories: 5 rows"]);
    expect(view.axis()).toBe(axis);
    fireEvent.click(view.bar("A"));
    const cleared = ["B: 3 rows", "Other categories: 3 rows"];
    expect(view.names()).toEqual(cleared);
    for (const pressed of ["true", "false"]) {
      fireEvent.click(view.bar("Other categories"));
      expect(view.names()).toEqual(cleared);
      expect(view.bar("Other categories")).toHaveAttribute(
        "aria-pressed",
        pressed
      );
    }
    expect(view.axis()).toBe(axis);
  });

  it("fits a share axis to the largest share", () => {
    const view = setup({ share: true, scaleTo: "filtered" });
    view.filter();
    // B is half of the six rows left.
    expect(view.axis()).toBe("0,0.5");
  });
});
