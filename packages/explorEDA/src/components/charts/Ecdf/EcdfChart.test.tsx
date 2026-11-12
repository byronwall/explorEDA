import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { EcdfChart } from "./EcdfChart";
import { ecdfDefinition, type EcdfSettings } from "./definition";

beforeAll(registerAllCharts);

function Live() {
  const settings = useDataLayer((s) => s.charts[0]) as EcdfSettings;
  return (
    <>
      <EcdfChart settings={settings} width={500} height={300} />
      <output data-testid="filters">{JSON.stringify(settings.filters)}</output>
    </>
  );
}

it("steps through observed values with the keyboard and selects a threshold", () => {
  const chart: EcdfSettings = {
    ...ecdfDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }, "Wait"),
    id: "ecdf",
  };
  render(
    <DataLayerProvider
      data={[{ Wait: 1 }, { Wait: 2 }, { Wait: 2 }, { Wait: 5 }]}
      charts={[chart]}
    >
      <Live />
    </DataLayerProvider>
  );
  const filters = () => JSON.parse(screen.getByTestId("filters").textContent!);
  const slider = screen.getByRole("slider", { name: "Wait threshold" });
  fireEvent.focus(slider);
  fireEvent.keyDown(slider, { key: "Home" });
  fireEvent.keyDown(slider, { key: "ArrowRight" });
  expect(slider).toHaveAttribute("aria-valuetext", "≤ 2: Wait 75%");
  // The share reads in the readout and beside the curve.
  expect(screen.getByText("75% (3/4)")).toBeInTheDocument();
  expect(
    screen.getByText("75%", { selector: ".eda-ecdf-value" })
  ).toBeInTheDocument();
  fireEvent.keyDown(slider, { key: "Enter" });
  expect(filters()).toEqual([{ type: "range", field: "Wait", max: 2 }]);
  expect(screen.getByText("≤ 2")).toBeInTheDocument();
  fireEvent.keyDown(slider, { key: "Delete" });
  expect(filters()).toEqual([]);
});

it("moves a span by its body, resizes it by an edge, and moves a threshold", () => {
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  const chart: EcdfSettings = {
    ...ecdfDefinition.createDefaultSettings({ x: 0, y: 0, w: 6, h: 4 }, "Wait"),
    id: "ecdf",
    filters: [{ type: "range", field: "Wait", min: 20, max: 40 }],
  };
  const { container } = render(
    <DataLayerProvider
      data={Array.from({ length: 101 }, (_, index) => ({ Wait: index }))}
      charts={[chart]}
    >
      <Live />
    </DataLayerProvider>
  );
  const filters = () => JSON.parse(screen.getByTestId("filters").textContent!);
  const slider = screen.getByRole("slider", { name: "Wait threshold" });
  // jsdom puts the svg at 0, 0, so client x is the plot x plus the margin.
  const margin = Number(
    /translate\(([\d.]+)/.exec(
      slider.parentElement!.getAttribute("transform")!
    )![1]
  );
  const band = () => {
    const rect = container.querySelector('rect[fill-opacity="0.08"]')!;
    const x = Number(rect.getAttribute("x"));
    return [x, x + Number(rect.getAttribute("width"))];
  };
  const drag = (from: number, to: number) => {
    fireEvent.pointerDown(slider, { clientX: margin + from, button: 0 });
    fireEvent.pointerMove(slider, { clientX: margin + to, buttons: 1 });
    fireEvent.pointerUp(slider, { clientX: margin + to });
  };
  let [x0, x1] = band();
  fireEvent.pointerMove(slider, { clientX: margin + (x0! + x1!) / 2 });
  expect(slider.style.cursor).toBe("move");
  fireEvent.pointerMove(slider, { clientX: margin + x1! });
  expect(slider.style.cursor).toBe("ew-resize");

  const step = (x1! - x0!) / 20;
  drag((x0! + x1!) / 2, (x0! + x1!) / 2 + step * 10);
  expect(filters()).toEqual([
    { type: "range", field: "Wait", min: 30, max: 50 },
  ]);
  [x0, x1] = band();
  drag(x1!, x1! + step * 10);
  expect(filters()).toEqual([
    { type: "range", field: "Wait", min: 30, max: 60 },
  ]);
  // A click on an edge keeps the span.
  [x0, x1] = band();
  drag(x0!, x0!);
  expect(filters()).toEqual([
    { type: "range", field: "Wait", min: 30, max: 60 },
  ]);
  // A click outside picks a threshold, and a drag on it moves that bound.
  drag(x1! + step * 20, x1! + step * 20);
  expect(filters()).toEqual([{ type: "range", field: "Wait", max: 80 }]);
  [, x1] = band();
  drag(x1! - step * 30, x1! - step * 40);
  expect(filters()).toEqual([{ type: "range", field: "Wait", max: 70 }]);
});
