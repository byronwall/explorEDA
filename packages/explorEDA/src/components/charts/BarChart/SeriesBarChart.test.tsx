import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { calculateGroupedAggregate } from "@/lib/aggregates";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { BarChart } from "./BarChart";
import { barChartDefinition, type BarChartSettings } from "./definition";
import { planSeriesBars } from "./seriesBarPlan";
import { rowChartDefinition } from "../RowChart/definition";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";

beforeAll(registerAllCharts);
const chart: BarChartSettings = {
  ...barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 8, h: 5 },
    "Amount"
  ),
  id: "pairs",
  aggregateId: "sales",
  seriesField: "Channel",
};
const saved: SavedDataStructure = {
  charts: [
    chart,
    {
      ...rowChartDefinition.createDefaultSettings(
        { x: 8, y: 0, w: 4, h: 5 },
        "Channel"
      ),
      id: "channels",
    },
  ],
  aggregates: [
    {
      id: "sales",
      name: "Sales",
      groupField: "Region",
      measureField: "Amount",
      aggregation: "sum",
    },
  ],
  calculations: [],
  colorScales: [],
  fieldSettings: { Amount: { type: "numeric" } },
  gridSettings: {
    columnCount: 12,
    rowHeight: 76,
    containerPadding: 0,
    showBackgroundMarkers: false,
  },
  metadata: { name: "test", version: 1, createdAt: "", modifiedAt: "" },
};
function Workspace() {
  const [facet, setFacet] = useState(false);
  const settings = useDataLayer((s) => s.charts[0]) as BarChartSettings;
  const update = useDataLayer((s) => s.updateChart);
  const updateAggregate = useDataLayer((s) => s.updateAggregate);
  const wrapper = useDataLayer((s) => s.crossfilterWrapper);
  const data = useDataLayer((s) => s.liveItems);
  void data;
  return (
    <>
      <output aria-label="Selected IDs">
        {wrapper.getFilteredRowIds().join(",")}
      </output>
      <button onClick={() => setFacet(true)}>North facet</button>
      <button
        onClick={() => updateAggregate("sales", { aggregation: "average" })}
      >
        Average
      </button>
      <button
        onClick={() =>
          update("channels", {
            filters: [{ type: "value", field: "Channel", values: ["Store"] }],
          })
        }
      >
        Store only
      </button>
      <ChartTraceScope>
        <BarChart
          settings={
            facet
              ? {
                  ...settings,
                  facet: {
                    enabled: true,
                    type: "wrap",
                    rowVariable: "Area",
                    columnCount: 2,
                  },
                }
              : settings
          }
          facetIds={facet ? [0, 2] : undefined}
          width={650}
          height={360}
        />
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("selects the exact pair and facet, traces exclusions, and responds to live filters", () => {
  render(
    <DataLayerProvider
      savedData={saved}
      data={[
        { Region: "West", Channel: "Web", Amount: "10", Area: "North" },
        { Region: "West", Channel: "Web", Amount: "bad", Area: "South" },
        { Region: "West", Channel: "Store", Amount: "-5", Area: "North" },
        { Region: "East", Channel: "Web", Amount: "20", Area: "South" },
      ]}
    >
      <Workspace />
    </DataLayerProvider>
  );
  const west = screen.getByRole("button", { name: "West · Web: 10" });
  fireEvent.keyDown(west, { key: "Enter" });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0,1");
  fireEvent.keyDown(west, { key: "Enter", altKey: true });
  const trace = screen.getByLabelText("Bar trace");
  expect(trace).toHaveTextContent("1 of 2 · 1 excluded");
  expect(within(trace).getByRole("table")).toHaveTextContent('"bad"');
  expect(trace).toHaveTextContent("Conversion failed");
  fireEvent.keyDown(west, { key: "Enter" });
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0,1,2,3");
  fireEvent.click(screen.getByRole("button", { name: "Average" }));
  expect(
    screen.getByRole("button", { name: "West · Web: 10" })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "North facet" }));
  fireEvent.click(screen.getByRole("button", { name: "West · Web: 10" }));
  expect(screen.getByLabelText("Selected IDs").textContent).toBe("0");
  fireEvent.click(screen.getByRole("button", { name: "West · Web: 10" }));
  fireEvent.click(screen.getByRole("button", { name: "Store only" }));
  expect(
    screen.queryByRole("button", { name: "West · Web: 10" })
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "West · Store: -5" })
  ).toBeInTheDocument();
});
it("keeps typed categories distinct, plots signed values, and restores series settings", () => {
  const spec = saved.aggregates![0]!;
  const plan = planSeriesBars({
    settings: chart,
    revision: "1",
    width: 600,
    height: 300,
    getColor: () => "blue",
    getLabel: (value) => value,
    format: (_field, value) => String(value),
    summaries: [
      {
        value: null,
        result: calculateGroupedAggregate(
          [
            { __ID: 0, Region: 1, Amount: -5 },
            { __ID: 1, Region: "1", Amount: 8 },
            { __ID: 2, Region: null, Amount: null },
          ],
          spec
        ),
      },
    ],
  });
  expect(plan.bars.map((bar) => bar.label)).toEqual([
    "1 · (missing)",
    '"1" · (missing)',
    "(missing) · (missing)",
  ]);
  expect(new Set(plan.bars.map((bar) => bar.x)).size).toBe(3);
  expect(plan.bars[0]!.y).toBe(plan.zeroBaseline);
  expect(plan.bars[1]!.y).toBeLessThan(plan.zeroBaseline);
  expect(plan.bars[2]!.valueText).toBe("No valid values");
  const restored = JSON.parse(stringifySavedData(saved));
  expect(validateSavedData(restored)).toBe(true);
  expect(restored.charts[0].seriesField).toBe("Channel");
  restored.charts[0].seriesField = 3;
  expect(validateSavedData(restored)).toBe(false);
});

import { ChartSettingsContent } from "@/components/ChartSettingsContent";
function SettingsWorkspace() {
  const settings = useDataLayer((s) => s.charts[0]) as BarChartSettings;
  return (
    <>
      <ChartSettingsContent settings={settings} />
      <BarChart settings={settings} width={600} height={300} />
    </>
  );
}
it("resets aggregate edits with the grouped-bar settings session", () => {
  render(
    <DataLayerProvider
      savedData={saved}
      data={[
        { Region: "West", Channel: "Web", Amount: 10 },
        { Region: "West", Channel: "Web", Amount: 20 },
      ]}
    >
      <SettingsWorkspace />
    </DataLayerProvider>
  );
  fireEvent.change(screen.getByRole("combobox", { name: "Operation" }), {
    target: { value: "average" },
  });
  expect(
    screen.getByRole("button", { name: "West · Web: 15" })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Reset changes" }));
  expect(
    screen.getByRole("button", { name: "West · Web: 30" })
  ).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Operation" })).toHaveValue(
    "sum"
  );
});
