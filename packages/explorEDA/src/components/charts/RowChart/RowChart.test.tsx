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
  fireEvent.click(
    screen.getByRole("checkbox", { name: "Select 1" })
  );
  expect(screen.getByLabelText("Matching IDs")).toHaveTextContent(/^3$/);
  expect(
    screen.getByRole("checkbox", { name: "Select 1" })
  ).toBeChecked();
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
