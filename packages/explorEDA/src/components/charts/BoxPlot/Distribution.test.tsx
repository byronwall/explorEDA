import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { ChartTraceScope } from "../trace/ChartTraceScope";
import { ChartTracePanel } from "../trace/ChartTracePanel";
import { BoxPlot } from "./BoxPlot";
import { boxPlotDefinition } from "./definition";
import { validateSavedData, stringifySavedData } from "@/utils/saveDataUtils";

beforeAll(registerAllCharts);
const settings = {
  ...boxPlotDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 5 },
    "value"
  ),
  id: "distribution",
  colorField: "group",
  violinOverlay: true,
  showObservations: true,
};
function Harness() {
  const chart = useDataLayer((state) => state.charts[0]);
  const save = useDataLayer((state) => state.saveToStructure);
  const store = useDataLayer((state) => state.crossfilterWrapper);
  return (
    <>
      <output aria-label="Saved">{stringifySavedData(save())}</output>
      <output aria-label="Matching">
        {store.getFilteredRowIds().join(",")}
      </output>
      <ChartTraceScope>
        {chart?.type === "boxplot" && (
          <BoxPlot settings={chart} width={700} height={500} />
        )}
        <ChartTracePanel />
      </ChartTraceScope>
    </>
  );
}
it("traces individual observations, excluded inputs, and quartiles without changing selection", () => {
  render(
    <DataLayerProvider
      charts={[settings]}
      data={[
        { group: "A", value: 0 },
        { group: "A", value: 10 },
        { group: "A", value: 20 },
        { group: "A", value: "bad" },
        { group: "B", value: 100 },
      ]}
    >
      <Harness />
    </DataLayerProvider>
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Inspect source row 1: 10" })
  );
  expect(screen.getByText("Source row 1")).toBeInTheDocument();
  expect(screen.getByLabelText("Matching")).toHaveTextContent(/^0,1,2,3,4$/);
  fireEvent.click(screen.getByRole("button", { name: "Inspect distribution" }));
  expect(screen.getByText("3 of 4")).toBeInTheDocument();
  expect(screen.getAllByText('"bad"')).toHaveLength(2);
  expect(screen.getByText("Not a finite number")).toBeInTheDocument();
  fireEvent.keyDown(
    screen.getByRole("button", { name: "A: median 10, 3 rows" }),
    { key: "Enter" }
  );
  expect(screen.getByLabelText("Matching")).toHaveTextContent(/^0,1,2,3$/);
  const saved = JSON.parse(screen.getByLabelText("Saved").textContent!);
  expect(validateSavedData(saved)).toBe(true);
  expect(saved.charts[0].showObservations).toBe(true);
  expect(saved.charts[0].violinOverlay).toBe(true);
});
