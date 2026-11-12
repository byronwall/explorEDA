import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import { ScatterMatrix } from "./ScatterMatrix";
import {
  scatterMatrixDefinition,
  type ScatterMatrixSettings,
} from "./definition";

beforeAll(() => {
  registerAllCharts();
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  // jsdom has no canvas; the points are not under test here.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

function Live() {
  const settings = useDataLayer((s) => s.charts[0]) as ScatterMatrixSettings;
  return (
    <>
      <ScatterMatrix settings={settings} width={600} height={600} />
      <output data-testid="filters">{JSON.stringify(settings.filters)}</output>
    </>
  );
}

it("moves a cell's selection by its body and resizes it by an edge", () => {
  const chart: ScatterMatrixSettings = {
    ...scatterMatrixDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 6,
      h: 6,
    }),
    id: "matrix",
    fields: ["a", "b"],
    filters: [
      { type: "range", field: "a", min: 20, max: 40 },
      { type: "range", field: "b", min: 20, max: 40 },
    ],
  };
  const { container } = render(
    <DataLayerProvider
      data={Array.from({ length: 101 }, (_, index) => ({
        a: index,
        b: (index * 37) % 101,
      }))}
      charts={[chart]}
    >
      <Live />
    </DataLayerProvider>
  );
  const range = (field: string) =>
    (
      JSON.parse(screen.getByTestId("filters").textContent!) as {
        field: string;
        min: number;
        max: number;
      }[]
    ).find((filter) => filter.field === field)!;
  // Cell 1:0 plots a across and b up. jsdom puts every box at 0, 0, so
  // pointer positions are offsets inside the cell.
  const cell = container.querySelector<SVGRectElement>('[data-cell="1:0"]')!;
  const cx = Number(cell.getAttribute("x"));
  const cy = Number(cell.getAttribute("y"));
  const size = Number(cell.getAttribute("width"));
  const box = [
    ...container.querySelectorAll<SVGRectElement>(
      'rect[fill="var(--primary)"]'
    ),
  ].find((rect) => {
    const x = Number(rect.getAttribute("x"));
    const y = Number(rect.getAttribute("y"));
    return x >= cx && x < cx + size && y >= cy && y < cy + size;
  })!;
  const left = Number(box.getAttribute("x")) - cx;
  const top = Number(box.getAttribute("y")) - cy;
  const right = left + Number(box.getAttribute("width"));
  const middle = top + Number(box.getAttribute("height")) / 2;
  const drag = (from: number[], to: number[]) => {
    fireEvent.pointerDown(cell, {
      clientX: from[0],
      clientY: from[1],
      button: 0,
    });
    fireEvent.pointerMove(cell, { clientX: to[0], clientY: to[1], buttons: 1 });
    fireEvent.pointerUp(cell, { clientX: to[0], clientY: to[1] });
  };

  fireEvent.pointerMove(cell, { clientX: (left + right) / 2, clientY: middle });
  expect(cell.style.cursor).toBe("move");
  fireEvent.pointerMove(cell, { clientX: right, clientY: middle });
  expect(cell.style.cursor).toBe("ew-resize");

  // A move shifts a's range and keeps its width; b, moved by 0, stays.
  const a = range("a");
  const b = range("b");
  drag([(left + right) / 2, middle], [(left + right) / 2 + 30, middle]);
  expect(range("a").min).toBeGreaterThan(a.min + 5);
  expect(range("a").max - range("a").min).toBeCloseTo(a.max - a.min, 0);
  expect(range("b").min).toBeCloseTo(b.min, 0);
  expect(range("b").max).toBeCloseTo(b.max, 0);

  // The right edge widens a's range and leaves its low end in place.
  const moved = range("a");
  drag([right + 30, middle], [right + 60, middle]);
  expect(range("a").min).toBeCloseTo(moved.min, 0);
  expect(range("a").max).toBeGreaterThan(moved.max + 5);
  expect(range("b").min).toBeCloseTo(b.min, 0);
});
