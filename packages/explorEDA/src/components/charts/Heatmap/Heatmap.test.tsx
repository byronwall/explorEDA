import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { Heatmap } from "./Heatmap";
import { heatmapDefinition, type HeatmapSettings } from "./definition";

beforeAll(registerAllCharts);

function Live() {
  const settings = useDataLayer((s) => s.charts[0]) as HeatmapSettings;
  const filters = useDataLayer((s) => s.charts[0]!.filters);
  return (
    <>
      <Heatmap settings={settings} width={480} height={320} />
      <output data-testid="filters">{JSON.stringify(filters)}</output>
    </>
  );
}

it("selects a cell by click and moves between cells with arrow keys", () => {
  const chart: HeatmapSettings = {
    ...heatmapDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }, "Region"),
    id: "heat",
    columnField: "Channel",
  };
  render(
    <DataLayerProvider
      data={[
        { Region: "North", Channel: "Web" },
        { Region: "North", Channel: "Store" },
        { Region: "South", Channel: "Web" },
      ]}
      charts={[chart]}
    >
      <Live />
    </DataLayerProvider>
  );

  const first = screen.getByRole("button", { name: "North, Web: 1" });
  expect(first).toHaveAttribute("tabindex", "0");
  fireEvent.keyDown(first, { key: "ArrowRight" });
  const next = screen.getByRole("button", { name: "North, Store: 1" });
  expect(next).toHaveFocus();
  fireEvent.keyDown(next, { key: "Enter" });
  expect(JSON.parse(screen.getByTestId("filters").textContent!)).toEqual([
    { type: "value", field: "Region", values: ["North"] },
    { type: "value", field: "Channel", values: ["Store"] },
  ]);
  expect(screen.getByRole("button", { name: "North, Store: 1" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  fireEvent.click(screen.getByRole("button", { name: "South, Store: No rows" }));
  expect(screen.getByTestId("filters").textContent).toContain("Store");

  fireEvent.click(screen.getByRole("button", { name: "North, Store: 1" }));
  expect(screen.getByTestId("filters").textContent).toBe("[]");
});
