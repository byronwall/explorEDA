import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { ChartLayout } from "@/types/ChartTypes";
import { barChartDefinition } from "../charts/BarChart/definition";
import { ChartGridLayout, ResizeHandle } from "../ChartGridLayout";
import { findEmptyPlacement } from "../chartGridPlacement";

// 1220 px wide with 10 px padding gives 100 px columns; rows are 100 px.
const WIDTH = 1220;
const PADDING = 10;
const CELL = 100;

beforeAll(() => {
  registerAllCharts();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  Element.prototype.scrollIntoView = vi.fn();
  if (!("PointerEvent" in window)) {
    class PointerEvent extends MouseEvent {
      pointerType: string;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerType = init.pointerType ?? "";
      }
    }
    vi.stubGlobal("PointerEvent", PointerEvent);
  }
});

function chartAt(title: string, layout: ChartLayout) {
  return {
    ...barChartDefinition.createDefaultSettings(layout, "value"),
    id: title,
    title,
  };
}

let readLayouts: () => Record<string, ChartLayout> = () => ({});
let addChartAt: (layout: ChartLayout) => void = () => {};

function Grid() {
  const charts = useDataLayer((s) => s.charts);
  const addChart = useDataLayer((s) => s.addChart);
  readLayouts = () =>
    Object.fromEntries(charts.map((chart) => [chart.title, chart.layout]));
  addChartAt = (layout) => addChart(chartAt("Blocker", layout));
  return (
    <ChartGridLayout charts={charts} containerWidth={WIDTH}>
      {charts.map((chart) => (
        <div key={chart.id} data-testid={chart.title}>
          {chart.title}
        </div>
      ))}
    </ChartGridLayout>
  );
}

function renderGrid(layouts: Record<string, ChartLayout>) {
  const charts = Object.entries(layouts).map(([title, layout]) =>
    chartAt(title, layout)
  );
  return render(
    <DataLayerProvider data={[{ value: 1 }, { value: 2 }]} charts={charts}>
      <Grid />
    </DataLayerProvider>
  );
}

function dragHandle(title: string, axis: string, dx: number, dy: number) {
  const item = screen.getByTestId(title).closest(".react-grid-item")!;
  const handle = item.querySelector(`[data-resize-axis="${axis}"]`)!;
  fireEvent.mouseDown(handle, { clientX: 500, clientY: 500, button: 0 });
  for (let step = 1; step <= 4; step++) {
    fireEvent.mouseMove(document, {
      clientX: 500 + (dx * step) / 4,
      clientY: 500 + (dy * step) / 4,
    });
  }
  fireEvent.mouseUp(document, {
    clientX: 500 + dx,
    clientY: 500 + dy,
  });
}

function hoverCell(x: number, y: number) {
  const grid = document.querySelector(".react-grid-layout")!.parentElement!;
  fireEvent.pointerMove(grid, {
    pointerType: "mouse",
    buttons: 0,
    clientX: PADDING + x * CELL + CELL / 2,
    clientY: PADDING + y * CELL + CELL / 2,
  });
}

describe("ResizeHandle", () => {
  it("marks each side so the grid can resize from it", () => {
    const { container } = render(
      <>
        <ResizeHandle axis="w" />
        <ResizeHandle axis="n" />
        <ResizeHandle axis="se" />
      </>
    );

    expect(container.querySelector(".eda-resize-w")).toHaveAttribute(
      "data-resize-axis",
      "w"
    );
    expect(container.querySelector(".eda-resize-n")).toHaveClass(
      "react-resizable-handle"
    );
    expect(container.querySelector(".eda-resize-se")).toHaveClass("handle-se");
  });
});

describe("ChartGridLayout resizing", () => {
  it("grows a chart left and up while its right and bottom edges stay put", () => {
    renderGrid({ Target: { x: 6, y: 2, w: 4, h: 3 } });

    dragHandle("Target", "w", -2 * CELL, 0);
    expect(readLayouts().Target).toEqual({ x: 4, y: 2, w: 6, h: 3 });

    dragHandle("Target", "n", 0, -CELL);
    expect(readLayouts().Target).toEqual({ x: 4, y: 1, w: 6, h: 4 });
  });

  it("stops a left resize at the neighboring chart without moving it", () => {
    renderGrid({
      Neighbor: { x: 0, y: 0, w: 4, h: 4 },
      Target: { x: 8, y: 0, w: 4, h: 4 },
    });

    dragHandle("Target", "w", -6 * CELL, 0);

    expect(readLayouts()).toEqual({
      Neighbor: { x: 0, y: 0, w: 4, h: 4 },
      Target: { x: 4, y: 0, w: 8, h: 4 },
    });
  });
});

describe("adding a chart from empty grid space", () => {
  async function openAddMenu(x: number, y: number) {
    vi.useFakeTimers();
    hoverCell(x, y);
    expect(screen.queryByRole("button", { name: "Add chart here" })).toBeNull();
    act(() => vi.advanceTimersByTime(500));
    vi.useRealTimers();
    fireEvent.keyDown(screen.getByRole("button", { name: "Add chart here" }), {
      key: "ArrowDown",
    });
    return screen.findByRole("menuitem", { name: "Bar Chart" });
  }

  it("creates the chosen chart in the hovered free area", async () => {
    renderGrid({ Existing: { x: 0, y: 0, w: 6, h: 4 } });

    fireEvent.click(await openAddMenu(8, 1));

    const layouts = Object.values(readLayouts());
    expect(layouts).toHaveLength(2);
    expect(layouts[1]).toEqual({ x: 6, y: 0, w: 6, h: 4 });
    expect(readLayouts().Existing).toEqual({ x: 0, y: 0, w: 6, h: 4 });
  });

  it("falls back to the bottom when the space fills before a choice", async () => {
    renderGrid({ Existing: { x: 0, y: 0, w: 6, h: 4 } });
    const item = await openAddMenu(8, 1);

    act(() => addChartAt({ x: 6, y: 0, w: 6, h: 4 }));
    fireEvent.click(item);

    const layouts = Object.values(readLayouts());
    expect(layouts).toHaveLength(3);
    expect(layouts[2]).toEqual({ x: 0, y: 4, w: 6, h: 4 });
  });
});

describe("add control focus", () => {
  it("keeps focus in the grid when a focused plus goes away", () => {
    renderGrid({ Existing: { x: 0, y: 0, w: 6, h: 4 } });
    vi.useFakeTimers();
    hoverCell(8, 1);
    act(() => vi.advanceTimersByTime(500));
    vi.useRealTimers();
    const plus = screen.getByRole("button", { name: "Add chart here" });
    plus.focus();

    hoverCell(8, 3);

    expect(screen.queryByRole("button", { name: "Add chart here" })).toBeNull();
    expect(document.activeElement).toBe(
      document.querySelector(".react-grid-layout")!.parentElement
    );
  });
});

describe("findEmptyPlacement", () => {
  const chart = { x: 0, y: 0, w: 6, h: 4 };

  it("places the default chart beside an occupied chart", () => {
    expect(findEmptyPlacement({ x: 7, y: 1 }, [chart], 12)).toEqual({
      x: 6,
      y: 0,
      w: 6,
      h: 4,
    });
  });

  it("slides the chart up and left to the edge of a free region", () => {
    expect(findEmptyPlacement({ x: 2, y: 5 }, [chart], 12)).toEqual({
      x: 0,
      y: 4,
      w: 6,
      h: 4,
    });
  });

  it("shrinks to fit a tight space without overlapping", () => {
    const left = { x: 0, y: 0, w: 4, h: 4 };
    const right = { x: 8, y: 0, w: 4, h: 4 };
    const placement = findEmptyPlacement({ x: 5, y: 1 }, [left, right], 12);

    expect(placement).toEqual({ x: 4, y: 0, w: 4, h: 4 });
  });

  it("refuses a space too small for any chart", () => {
    const left = { x: 0, y: 0, w: 5, h: 4 };
    const right = { x: 7, y: 0, w: 5, h: 4 };

    expect(findEmptyPlacement({ x: 5, y: 1 }, [left, right], 12)).toBeNull();
    expect(findEmptyPlacement({ x: 1, y: 1 }, [left, right], 12)).toBeNull();
  });
});
