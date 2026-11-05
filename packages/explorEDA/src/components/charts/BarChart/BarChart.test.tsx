import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { BarChart } from "./BarChart";
import { barChartDefinition } from "./definition";

beforeAll(registerAllCharts);

it("highlights a grid line only during Alt hover", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  const settings = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "category"
  );
  settings.yAxis = { ...settings.yAxis, grid: true };
  render(
    <DataLayerProvider
      data={[{ category: "A" }, { category: "B" }]}
      charts={[settings]}
    >
      <BarChart settings={settings} width={400} height={240} />
    </DataLayerProvider>
  );

  const guide = screen.getAllByRole("button", { name: /grid line at/i })[0]!;
  const line = guide.previousElementSibling;
  fireEvent.pointerMove(guide);
  expect(line?.getAttribute("style") ?? "").not.toContain("var(--primary)");
  fireEvent.pointerMove(guide, { altKey: true });
  expect(line).toHaveAttribute(
    "style",
    expect.stringContaining("var(--primary)")
  );
  fireEvent.pointerMove(guide);
  expect(line?.getAttribute("style") ?? "").not.toContain("var(--primary)");
});

it("counts only the chart's own population", () => {
  const settings = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "cat"
  );
  settings.localFilters = [{ type: "value", field: "year", values: [2023] }];
  render(
    <DataLayerProvider
      data={[
        { cat: "A", year: 2023 },
        { cat: "A", year: 2023 },
        { cat: "A", year: 2022 },
        { cat: "A", year: 2022 },
        { cat: "A", year: 2022 },
        { cat: "B", year: 2022 },
      ]}
      charts={[settings]}
    >
      <BarChart settings={settings} width={400} height={240} />
    </DataLayerProvider>
  );
  const bars = screen.getAllByRole("button", { name: /records/ });
  expect(bars.map((bar) => bar.getAttribute("aria-label"))).toEqual([
    "A: 2 records",
  ]);
});
