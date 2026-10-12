import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { exportDocument } from "@/lib/dsl/export";
import { compileDocument } from "@/lib/dsl/compile";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { waterfallDefinition } from "./definition";
import { Waterfall } from "./Waterfall";
import type { WaterfallSettings } from "./waterfallTypes";

beforeAll(registerAllCharts);

const rows = [
  { group: "Income", line: "Tuition", scenario: "Plan", amount: 800 },
  { group: "Income", line: "Tuition", scenario: "Actual", amount: 850 },
  { group: "Income", line: "Grants", scenario: "Plan", amount: 300 },
  { group: "Income", line: "Grants", scenario: "Actual", amount: 270 },
  { group: "Costs", line: "Salaries", scenario: "Plan", amount: -500 },
  { group: "Costs", line: "Salaries", scenario: "Actual", amount: -525 },
  { group: "Costs", line: "Travel", scenario: "Plan", amount: -50 },
  { group: "Costs", line: "Travel", scenario: "Actual", amount: -40 },
];

const settings: WaterfallSettings = {
  ...waterfallDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 6 },
    "line"
  ),
  id: "bridge",
  measureField: "amount",
  parentField: "group",
  states: [
    {
      label: "Plan",
      filters: [{ type: "value", field: "scenario", values: ["Plan"] }],
    },
    {
      label: "Actual",
      filters: [{ type: "value", field: "scenario", values: ["Actual"] }],
    },
  ],
};

function Harness() {
  const chart = useDataLayer((state) => state.charts[0]);
  const save = useDataLayer((state) => state.saveToStructure);
  const store = useDataLayer((state) => state.crossfilterWrapper);
  return (
    <>
      <output aria-label="Saved settings">{stringifySavedData(save())}</output>
      <output aria-label="Matching IDs">
        {store.getFilteredRowIds().join(",")}
      </output>
      <ChartTraceScope>
        {chart?.type === "waterfall" && (
          <Waterfall settings={chart} width={640} height={420} />
        )}
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}

function renderBridge(chart: WaterfallSettings = settings) {
  return render(
    <DataLayerProvider charts={[chart]} data={rows}>
      <Harness />
    </DataLayerProvider>
  );
}

const savedFilters = () =>
  JSON.parse(screen.getByLabelText("Saved settings").textContent!).charts[0]
    .filters;

describe("Waterfall", () => {
  it("draws the plan, each line's change, the group subtotals, and the actual", () => {
    renderBridge();
    const labels = screen
      .getAllByRole("button")
      .filter((item) => item.hasAttribute("data-waterfall-kind"))
      .map((item) => item.getAttribute("aria-label"));
    expect(labels).toEqual([
      "Plan, total 550",
      "Tuition, change +50",
      "Grants, change -30",
      "Income, subtotal 570",
      "Salaries, change -25",
      "Travel, change +10",
      "Costs, subtotal 555",
      "Actual, total 555",
    ]);
  });

  it("selects a step's rows in both states, and a subtotal's whole group", () => {
    renderBridge();
    fireEvent.click(screen.getByRole("button", { name: "Grants, change -30" }));
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(/^2,3$/);
    fireEvent.click(screen.getByRole("button", { name: "Grants, change -30" }));
    expect(savedFilters()).toEqual([]);
    fireEvent.click(
      screen.getByRole("button", { name: "Costs, subtotal 555" })
    );
    expect(savedFilters()).toEqual([
      { type: "value", field: "line", values: ["Salaries", "Travel"] },
    ]);
  });

  it("selects every row of a state from its total", () => {
    renderBridge();
    fireEvent.click(screen.getByRole("button", { name: "Actual, total 555" }));
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(
      /^1,3,5,7$/
    );
    expect(
      screen.getByRole("button", { name: "Actual, total 555" })
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Actual, total 555" }));
    expect(savedFilters()).toEqual([]);
  });

  it("traces a step to both states' rows", () => {
    renderBridge();
    fireEvent.click(
      screen.getByRole("button", { name: "Grants, change -30" }),
      {
        altKey: true,
      }
    );
    const trace = screen.getByLabelText("Waterfall trace");
    expect(trace).toHaveTextContent("Actual minus Plan");
    expect(trace).toHaveTextContent("scenario: Plan");
    expect(trace).toHaveTextContent("scenario: Actual");
  });

  it("explains a missing measure instead of drawing", () => {
    renderBridge({ ...settings, measureField: undefined });
    expect(
      screen.getByText("Choose a measure in chart settings.")
    ).toBeInTheDocument();
  });

  it("saves and restores through saved data and dashboard text", () => {
    renderBridge();
    const saved = JSON.parse(
      screen.getByLabelText("Saved settings").textContent!
    );
    expect(validateSavedData(saved)).toBe(true);
    const { text, omitted } = exportDocument(saved, { rows });
    expect(omitted).toEqual([]);
    const compiled = compileDocument(text, { rows });
    expect(compiled.diagnostics).toEqual([]);
    const chart = compiled.settings.charts.find(
      (item) => item.type === "waterfall"
    );
    expect(chart).toMatchObject({
      field: "line",
      parentField: "group",
      measureField: "amount",
      states: settings.states,
    });
  });
});
