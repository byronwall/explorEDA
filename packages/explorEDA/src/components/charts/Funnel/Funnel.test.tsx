import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "@/lib/dsl/compile";
import { exportDocument } from "@/lib/dsl/export";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { Funnel } from "./Funnel";
import { funnelDefinition, type FunnelSettings } from "./definition";

beforeAll(registerAllCharts);

const day = (n: number) => `2025-01-0${n}T10:00:00Z`;
// The shape brief's fixture: 4 → 3 → 2.
const rows = [
  { user: "u1", event: "view", at: day(1) },
  { user: "u1", event: "signup", at: day(2) },
  { user: "u1", event: "pay", at: day(3) },
  { user: "u2", event: "view", at: day(1) },
  { user: "u2", event: "pay", at: day(2) },
  { user: "u2", event: "signup", at: day(3) },
  { user: "u3", event: "signup", at: day(1) },
  { user: "u3", event: "view", at: day(2) },
  { user: "u3", event: "signup", at: day(3) },
  { user: "u3", event: "pay", at: day(4) },
  { user: "u4", event: "view", at: day(1) },
];

const settings: FunnelSettings = {
  ...funnelDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "event"
  ),
  id: "funnel",
  entityField: "user",
  timeField: "at",
  steps: ["view", "signup", "pay"],
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
        {chart?.type === "funnel" && (
          <Funnel settings={chart} width={560} height={240} />
        )}
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}

function renderFunnel(chart: FunnelSettings = settings) {
  return render(
    <DataLayerProvider charts={[chart]} data={rows}>
      <Harness />
    </DataLayerProvider>
  );
}

describe("Funnel", () => {
  it("draws each step's count and share of the first", () => {
    const { container } = renderFunnel();
    expect(
      [...container.querySelectorAll("svg [role='button']")].map((item) =>
        item.getAttribute("aria-label")
      )
    ).toEqual([
      "Step 1, view: 4, 100% of the first step",
      "Step 2, signup: 3, 75% of the first step",
      "Step 3, pay: 2, 50% of the first step",
    ]);
    expect(container.querySelector(".eda-chart-status")).toHaveTextContent(
      "4 entered · 2 completed (50%)"
    );
  });

  it("selects every event of the entities that reached a step", () => {
    const { container } = renderFunnel();
    fireEvent.click(screen.getByRole("button", { name: /^Step 3, pay/ }));
    // u1 and u3, all their events.
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(
      /^0,1,2,6,7,8,9$/
    );
    expect(
      screen.getByRole("button", { name: /^Step 3, pay/ })
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(container.querySelector("svg")!);
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(
      /^0,1,2,3,4,5,6,7,8,9,10$/
    );
  });

  it("traces a step to its rule, its drop-off, and the events that counted", () => {
    renderFunnel();
    fireEvent.click(screen.getByRole("button", { name: /^Step 3, pay/ }), {
      altKey: true,
    });
    const trace = screen.getByLabelText("Funnel trace");
    expect(trace).toHaveTextContent("66.7% = 2 ÷ 3 who reached signup");
    expect(trace).toHaveTextContent("Never did it: 0");
    expect(trace).toHaveTextContent(
      "Did it too early: 1, only before reaching signup"
    );
  });

  it("asks for steps before drawing", () => {
    renderFunnel({ ...settings, steps: ["view"] });
    expect(
      screen.getByText("Choose at least two steps in chart settings.")
    ).toBeInTheDocument();
  });

  it("saves and restores through saved data and dashboard text", () => {
    renderFunnel({
      ...settings,
      windowDays: 14,
      filters: [{ type: "value", field: "event", values: ["signup"] }],
    });
    const saved = JSON.parse(
      screen.getByLabelText("Saved settings").textContent!
    );
    expect(validateSavedData(saved)).toBe(true);
    const { text, omitted } = exportDocument(saved, { rows });
    expect(omitted).toEqual([]);
    const compiled = compileDocument(text, { rows });
    expect(compiled.diagnostics).toEqual([]);
    expect(compiled.settings.charts[0]).toMatchObject({
      type: "funnel",
      field: "event",
      entityField: "user",
      timeField: "at",
      steps: ["view", "signup", "pay"],
      windowDays: 14,
      filters: [{ type: "value", field: "event", values: ["signup"] }],
    });
  });
});
