import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "@/lib/dsl/compile";
import { exportDocument } from "@/lib/dsl/export";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { stringifySavedData, validateSavedData } from "@/utils/saveDataUtils";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { Donut } from "./Donut";
import { donutDefinition, type DonutSettings } from "./definition";

beforeAll(registerAllCharts);

const rows = [
  { channel: "Web", revenue: 50 },
  { channel: "Store", revenue: 30 },
  { channel: "Web", revenue: 20 },
  { channel: "Wholesale", revenue: 15 },
  { channel: "Phone", revenue: 5 },
];

const settings: DonutSettings = {
  ...donutDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 5, h: 4 },
    "channel"
  ),
  id: "share",
  aggregation: "sum",
  measureField: "revenue",
  topN: 2,
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
        {chart?.type === "donut" && (
          <Donut settings={chart} width={520} height={320} />
        )}
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}

function renderDonut(chart: DonutSettings = settings, data = rows) {
  return render(
    <DataLayerProvider charts={[chart]} data={data}>
      <Harness />
    </DataLayerProvider>
  );
}

describe("Donut", () => {
  it("draws the largest slices, pools the rest into Other, and shows the total", () => {
    renderDonut();
    expect(
      screen
        .getAllByRole("button", { pressed: false })
        .map((item) => item.getAttribute("aria-label"))
    ).toContain("Other: 20, 17%");
    expect(screen.getByRole("button", { name: "Web: 70, 58%" })).toBeVisible();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "channel legend" })
    ).toHaveTextContent("Web58%Store25%Other17%");
  });

  it("selects a slice, Other's members, and clears from empty space", () => {
    const { container } = renderDonut();
    fireEvent.click(screen.getByRole("button", { name: "Web: 70, 58%" }));
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(/^0,2$/);
    fireEvent.click(screen.getByRole("button", { name: "Other: 20, 17%" }));
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(
      /^0,2,3,4$/
    );
    fireEvent.click(container.querySelector(".eda-donut")!);
    expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(
      /^0,1,2,3,4$/
    );
  });

  it("traces Other to its categories and rows", () => {
    renderDonut();
    fireEvent.click(screen.getByRole("button", { name: "Other: 20, 17%" }), {
      altKey: true,
    });
    const trace = screen.getByLabelText("Donut trace");
    expect(trace).toHaveTextContent("Categories in Other");
    expect(trace).toHaveTextContent("Wholesale15");
    expect(trace).toHaveTextContent("20 ÷ 120");
  });

  it("refuses a negative part", () => {
    renderDonut(settings, [...rows, { channel: "Returns", revenue: -200 }]);
    expect(screen.getByText(/^Returns is negative/)).toBeInTheDocument();
  });

  it("saves and restores through saved data and dashboard text", () => {
    renderDonut();
    const saved = JSON.parse(
      screen.getByLabelText("Saved settings").textContent!
    );
    expect(validateSavedData(saved)).toBe(true);
    const { text, omitted } = exportDocument(saved, { rows });
    expect(omitted).toEqual([]);
    const compiled = compileDocument(text, { rows });
    expect(compiled.diagnostics).toEqual([]);
    expect(compiled.settings.charts[0]).toMatchObject({
      type: "donut",
      field: "channel",
      aggregation: "sum",
      measureField: "revenue",
      topN: 2,
    });
  });
});
