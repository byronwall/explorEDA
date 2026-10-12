import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { DataLayerProvider, useDataLayer } from "@/providers/DataLayerProvider";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { projectAnnotations } from "@/lib/annotations/resolve";
import type { ChartAnnotation } from "@/lib/annotations/types";
import { BarChart } from "../BarChart/BarChart";
import { barChartDefinition } from "../BarChart/definition";
import { RowChart } from "../RowChart/RowChart";
import { rowChartDefinition } from "../RowChart/definition";

beforeAll(() => {
  registerAllCharts();
  window.PointerEvent = MouseEvent as typeof PointerEvent;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

const data = [
  { category: "A" },
  { category: "B" },
  { category: "B" },
  { category: "B" },
  { category: "C" },
];

const annotations: ChartAnnotation[] = [
  {
    id: "busy",
    type: "callout",
    text: "Busiest",
    attach: { kind: "category", value: "B" },
    offset: { dx: 10, dy: -10 },
  },
  { id: "goal", type: "reference-line", axis: "y", value: 2, label: "Goal" },
];

it("attaches a bar note to its category, at the top of that bar", () => {
  const settings = {
    ...barChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "category"
    ),
    annotations,
  };
  const { container } = render(
    <DataLayerProvider data={data} charts={[settings]}>
      <BarChart settings={settings} width={400} height={240} />
    </DataLayerProvider>
  );
  const ring = container.querySelector('[data-annotation-id="busy"] circle')!;
  const goal = container.querySelector('line[data-annotation-id="goal"]')!;
  // B is the tallest bar, so its top sits above the goal line at 2.
  expect(Number(ring.getAttribute("cy"))).toBeLessThan(
    Number(goal.getAttribute("y1"))
  );
});

it("puts a row chart note at the end of its row, with a value line on x", () => {
  const settings = {
    ...rowChartDefinition.createDefaultSettings(
      { x: 0, y: 0, w: 6, h: 4 },
      "category"
    ),
    annotations: [annotations[0]!, { ...annotations[1]!, axis: "x" as const }],
  };
  const { container } = render(
    <DataLayerProvider data={data} charts={[settings]}>
      <RowChart settings={settings} width={500} height={240} />
    </DataLayerProvider>
  );
  const ring = container.querySelector('[data-annotation-id="busy"] circle')!;
  const goal = container.querySelector('line[data-annotation-id="goal"]')!;
  // Three rows run past the goal at two.
  expect(Number(ring.getAttribute("cx"))).toBeGreaterThan(
    Number(goal.getAttribute("x1"))
  );
});

it("draws a facet-bound annotation only in its own panel", () => {
  const frame = {
    xScale: {
      type: "linear" as const,
      domain: [0, 10] as [number, number],
      range: [0, 100] as [number, number],
    },
    yScale: {
      type: "linear" as const,
      domain: [0, 10] as [number, number],
      range: [100, 0] as [number, number],
    },
    plotWidth: 100,
    plotHeight: 100,
    ids: [],
    getColumn: () => ({}),
  };
  const bound: ChartAnnotation = {
    ...annotations[1]!,
    facet: JSON.stringify(['["string","North"]', null]),
  };
  const north = frame && { ...frame, facetKey: bound.facet };
  const south = {
    ...frame,
    facetKey: JSON.stringify(['["string","South"]', null]),
  };
  expect(projectAnnotations([bound], north)[0]!.status).toBe("shown");
  expect(projectAnnotations([bound], south)[0]!.status).toBe("elsewhere");
  // An unfaceted chart draws it.
  expect(projectAnnotations([bound], frame)[0]!.status).toBe("shown");
});

it("adds a category callout from the Notes tab on a bar chart", async () => {
  const { ChartSettingsContent } = await import("../../ChartSettingsContent");
  const chart = barChartDefinition.createDefaultSettings(
    { x: 0, y: 0, w: 6, h: 4 },
    "category"
  );
  const onStateChange = vi.fn<(state: SavedDataStructure) => void>();
  function Settings() {
    const charts = useDataLayer((s) => s.charts);
    return <ChartSettingsContent settings={charts[0]!} />;
  }
  render(
    <DataLayerProvider
      data={data}
      charts={[chart]}
      onStateChange={onStateChange}
    >
      <Settings />
    </DataLayerProvider>
  );
  const notes = screen.getByRole("tab", { name: "Notes" });
  fireEvent.mouseDown(notes);
  fireEvent.click(notes);
  expect(screen.queryByRole("button", { name: "Region" })).toBeNull();
  fireEvent.click(await screen.findByRole("button", { name: "Callout" }));
  fireEvent.click(screen.getByRole("button", { name: "Line" }));
  const saved = onStateChange.mock.calls.at(-1)![0].charts[0]!.annotations!;
  expect(saved[0]).toMatchObject({
    attach: { kind: "category", value: "B" },
    text: "B",
  });
  // The median of the bar counts 1, 3, 1.
  expect(saved[1]).toMatchObject({ axis: "y", value: 1 });
});
