import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { ParallelCoordinates } from "./ParallelCoordinates";
import {
  parallelCoordinatesDefinition,
  type ParallelCoordinatesSettings,
} from "./definition";

beforeAll(() => {
  registerAllCharts();
  // jsdom has no canvas; the lines are not under test here.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

function Live() {
  const settings = useDataLayer(
    (s) => s.charts[0]
  ) as ParallelCoordinatesSettings;
  return (
    <>
      <ParallelCoordinates settings={settings} width={600} height={320} />
      <output data-testid="filters">{JSON.stringify(settings.filters)}</output>
      <output data-testid="axes">
        {settings.axes.map((axis) => axis.field).join(",")}
      </output>
    </>
  );
}

it("selects, moves, and clears an axis range from the keyboard, and reorders axes", () => {
  const chart: ParallelCoordinatesSettings = {
    ...parallelCoordinatesDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 6,
      h: 4,
    }),
    id: "pc",
    axes: [
      { field: "Length", inverted: false },
      { field: "Width", inverted: false },
    ],
  };
  render(
    <DataLayerProvider
      data={[
        { Length: 0, Width: 1 },
        { Length: 50, Width: 2 },
        { Length: 100, Width: 3 },
      ]}
      charts={[chart]}
    >
      <Live />
    </DataLayerProvider>
  );

  const filters = () => JSON.parse(screen.getByTestId("filters").textContent!);
  const axis = screen.getByRole("group", { name: /^Length axis/ });
  fireEvent.keyDown(axis, { key: "Enter" });
  const [selected] = filters();
  expect(selected).toMatchObject({ type: "range", field: "Length" });
  expect(selected.min).toBeGreaterThan(0);
  expect(selected.max).toBeLessThan(100);

  fireEvent.keyDown(screen.getByRole("group", { name: /^Length axis/ }), {
    key: "ArrowUp",
  });
  expect(filters()[0].min).toBeGreaterThan(selected.min);

  fireEvent.keyDown(screen.getByRole("group", { name: /^Length axis/ }), {
    key: "Delete",
  });
  expect(filters()).toEqual([]);

  fireEvent.keyDown(
    screen.getByRole("button", { name: "Length, axis 1 of 2" }),
    {
      key: "ArrowRight",
      shiftKey: true,
    }
  );
  expect(screen.getByTestId("axes").textContent).toBe("Width,Length");

  fireEvent.click(screen.getByRole("button", { name: "Flip Length" }));
  expect(screen.getByRole("button", { name: "Flip Length" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});
