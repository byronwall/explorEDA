import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { scaleLinear } from "d3-scale";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider } from "@/providers/DataLayerProvider";
import { BaseChart } from "./BaseChart";
import { lineChartDefinition } from "./LineChart/definition";

beforeAll(registerAllCharts);

it("does not start a brush from a guide and keeps Alt+Enter inspection", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  const settings = lineChartDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 6,
    h: 4,
  });
  settings.xAxis = { ...settings.xAxis, grid: true };
  settings.yAxis = { ...settings.yAxis, grid: true };
  const onBrushChange = vi.fn();
  const onInspectGuide = vi.fn();

  render(
    <DataLayerProvider data={[{ x: 1, y: 2 }]} charts={[settings]}>
      <BaseChart
        width={400}
        height={300}
        xScale={scaleLinear().domain([0, 10]).range([0, 300])}
        yScale={scaleLinear().domain([0, 10]).range([200, 0])}
        brushingMode="horizontal"
        onBrushChange={onBrushChange}
        onInspectGuide={onInspectGuide}
        settings={settings}
      >
        <rect width={300} height={200} />
      </BaseChart>
    </DataLayerProvider>
  );

  const tick = screen.getByRole("button", { name: "Horizontal tick 2" });
  expect(tick).toHaveAttribute("aria-description", "Alt+Enter to inspect");
  fireEvent.pointerDown(tick, { button: 0, clientX: 100, clientY: 200 });
  fireEvent.pointerUp(tick, { button: 0, clientX: 100, clientY: 200 });
  expect(onBrushChange).not.toHaveBeenCalled();

  fireEvent.keyDown(tick, { altKey: true, key: "Enter" });
  expect(onInspectGuide).toHaveBeenCalledWith(
    expect.objectContaining({ role: "tick", axis: "x", value: 2 }),
    expect.anything()
  );
});
