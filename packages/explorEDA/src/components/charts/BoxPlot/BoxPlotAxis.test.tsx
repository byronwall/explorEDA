import { render } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { BoxPlot } from "./BoxPlot";
import { boxPlotDefinition } from "./definition";

beforeAll(registerAllCharts);

function Chart({ width }: { width: number }) {
  const chart = useDataLayer((state) => state.charts[0]);
  return chart?.type === "boxplot" ? (
    <BoxPlot settings={chart} width={width} height={360} />
  ) : null;
}

function renderBoxPlot(width: number, scaleType: "linear" | "symlog") {
  const defaults = boxPlotDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 5 },
    "revenue"
  );
  const chart = {
    ...defaults,
    id: "order-value",
    colorField: "category",
    yAxisLabel: "Revenue ($)",
    yAxis: { ...defaults.yAxis, scaleType },
  };
  return render(
    <DataLayerProvider
      data={[
        { category: "Home", revenue: 120.5 },
        { category: "Home", revenue: 4800.25 },
        { category: "Garden", revenue: 9100.75 },
        { category: "Garden", revenue: 18250.4 },
      ]}
      savedData={{
        charts: [chart],
        calculations: [],
        colorScales: [],
        fieldSettings: { revenue: { format: "currency", precision: 2 } },
        gridSettings: {
          columnCount: 12,
          rowHeight: 100,
          containerPadding: 10,
          showBackgroundMarkers: false,
        },
        metadata: {
          name: "Test",
          version: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          modifiedAt: "2026-01-01T00:00:00.000Z",
        },
      }}
    >
      <Chart width={width} />
    </DataLayerProvider>
  );
}

function yAxis(container: HTMLElement) {
  const plot = container.querySelector("g[transform^='translate(']")!;
  const left = Number(
    /translate\(([\d.]+)/.exec(plot.getAttribute("transform")!)![1]
  );
  const ticks = [
    ...container.querySelectorAll("[data-plan-id^='y:tick:'] text"),
  ].map((node) => node.textContent ?? "");
  const title = container.querySelector("[data-plan-id='y:label'] text")!;
  return { left, ticks, title };
}

it.each(["linear", "symlog"] as const)(
  "keeps %s currency ticks clear of the Y axis title",
  (scaleType) => {
    const { container } = renderBoxPlot(640, scaleType);
    const { left, ticks, title } = yAxis(container);
    expect(ticks.length).toBeGreaterThan(1);
    // Compact currency fits whole, with no ellipsis.
    expect(ticks.join(" ")).toMatch(/\$\d+(\.\d)?K/);
    expect(ticks.some((tick) => tick.includes("…"))).toBe(false);
    // Tick text ends 9px left of the axis; the rotated title sits left of it.
    const widest = Math.max(...ticks.map((tick) => tick.length * 10 * 0.6));
    const titleRight = left - 12 - 11 / 2;
    expect(titleRight).toBeGreaterThanOrEqual(9 + widest);
    expect(title.textContent).toBe(
      scaleType === "symlog" ? "Revenue ($) · symlog" : "Revenue ($)"
    );
  }
);

it("keeps a minimum plot width in a narrow panel", () => {
  const { container } = renderBoxPlot(180, "linear");
  const { left } = yAxis(container);
  const right = boxPlotDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 5 },
    "revenue"
  ).margin.right;
  expect(180 - left - right).toBeGreaterThanOrEqual(80);
});
